const request = require('supertest');
const app = require('../app');

//Authentication
describe('Auth', () => {
  it('should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
