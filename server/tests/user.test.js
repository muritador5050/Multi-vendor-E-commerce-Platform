const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const { setupDatabase, teardownDatabase } = require('./setup');

jest.setTimeout(30000); // Set a longer timeout for tests

beforeAll(async () => {
  await setupDatabase(); // This handles the MongoDB connection
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  // Clear the database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('User API Tests', () => {
  it('should create a new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
  });

  it('should login an existing user', async () => {
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();

    const response = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 401 for invalid login credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should get user profile', async () => {
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();

    const response = await request(app)
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${user.generateAuthToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
  });

  it('should return 401 for unauthorized access to user profile', async () => {
    const response = await request(app).get('/api/auth/user');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should update user profile', async () => {
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();

    const response = await request(app)
      .put('/api/auth/user')
      .set('Authorization', `Bearer ${user.generateAuthToken()}`)
      .send({
        name: 'Updated User',
        email: 'updateduser@example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Updated User');
    expect(response.body.email).toBe('updateduser@example.com');
  });

  it('should return 401 for unauthorized access to update user profile', async () => {
    const response = await request(app).put('/api/auth/user').send({
      name: 'Updated User',
      email: 'updateduser@example.com',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should delete user account', async () => {
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();

    const response = await request(app)
      .delete('/api/auth/user')
      .set('Authorization', `Bearer ${user.generateAuthToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'User deleted successfully'
    );
  });

  it('should return 401 for unauthorized access to delete user account', async () => {
    const response = await request(app).delete('/api/auth/user');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should reset password', async () => {
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();

    const response = await request(app).post('/api/auth/forgot-password').send({
      email: user.email,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Password reset link sent to email'
    );
  });

  it('should return 404 for non-existing user during password reset', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({
      email: 'nonexistinguser@example.com',
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should return 400 for invalid reset token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password/invalidtoken')
      .send({
        password: 'newpassword123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Invalid or expired reset token'
    );
  });
});
