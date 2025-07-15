const nodemailer = require('nodemailer');
require('dotenv').config();

//Email service
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p>${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${
      process.env.APP_NAME
    }. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Hello ${user.name}!
      
      Thank you for registering with us. Please verify your email address to complete your registration.
      
      Click this link to verify your email: ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      ${process.env.APP_NAME}
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html,
      text,
    });
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${process.env.APP_NAME}!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Your email has been verified successfully. Welcome to our platform!</p>
              <p>You can now enjoy all the features of your account.</p>
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${
      process.env.APP_NAME
    }. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.APP_NAME}!`,
      html,
      text: `Welcome to ${process.env.APP_NAME}, ${user.name}! Your email has been verified successfully.`,
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>For security reasons, if you didn't request a password reset, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${
      process.env.APP_NAME
    }. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
      text: `Password reset requested. Visit this link to reset your password: ${resetUrl}. This link expires in 10 min.`,
    });
  }

  async sendVendorVerificationEmail(user, status, notes = null) {
    const dashboardUrl = `${process.env.FRONTEND_URL}/vendor/dashboard`;

    let html, text, subject;

    if (status === 'approved') {
      subject = 'Vendor Account Approved - Welcome to Our Platform!';

      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .success-icon { font-size: 48px; color: #4CAF50; text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Vendor Account Approved!</h1>
              </div>
              <div class="content">
                <div class="success-icon">✅</div>
                <h2>Congratulations ${user.name}!</h2>
                <p>We're excited to inform you that your vendor account has been <strong>approved</strong> and verified!</p>
                <p>You can now start selling your products on our platform. Here's what you can do next:</p>
                <ul>
                  <li>Access your vendor dashboard</li>
                  <li>Add your products</li>
                  <li>Manage your inventory</li>
                  <li>View and process orders</li>
                  <li>Track your sales and earnings</li>
                </ul>
                <p>Click the button below to access your vendor dashboard:</p>
                <a href="${dashboardUrl}" class="button">Access Dashboard</a>
                <p>If you have any questions or need assistance getting started, please don't hesitate to contact our support team.</p>
                <p>Welcome to our vendor community!</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${
        process.env.APP_NAME
      }. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      text = `
        Congratulations ${user.name}!
        
        Your vendor account has been approved and verified!
        
        You can now start selling your products on our platform. Access your vendor dashboard here: ${dashboardUrl}
        
        What you can do next:
        - Add your products
        - Manage your inventory
        - View and process orders
        - Track your sales and earnings
        
        If you have any questions, please contact our support team.
        
        Welcome to our vendor community!
        
        ${process.env.APP_NAME}
      `;
    } else if (status === 'rejected') {
      subject = 'Vendor Account Application - Action Required';

      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .warning-icon { font-size: 48px; color: #f44336; text-align: center; margin-bottom: 20px; }
              .notes-section { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Vendor Application Update</h1>
              </div>
              <div class="content">
                <div class="warning-icon">⚠️</div>
                <h2>Hello ${user.name},</h2>
                <p>Thank you for your interest in becoming a vendor on our platform. After reviewing your application, we need some additional information or corrections before we can approve your account.</p>
                
                ${
                  notes
                    ? `
                  <div class="notes-section">
                    <h3>📋 Review Notes:</h3>
                    <p><strong>${notes}</strong></p>
                  </div>
                `
                    : ''
                }
                
                <p>Please review the feedback above and update your vendor profile accordingly. Once you've made the necessary changes, your application will be reviewed again.</p>
                
                <p>What you can do:</p>
                <ul>
                  <li>Review and update your business information</li>
                  <li>Upload any missing verification documents</li>
                  <li>Ensure all required fields are properly filled</li>
                  <li>Contact our support team if you need clarification</li>
                </ul>
                
                <p>Click the button below to update your vendor profile:</p>
                <a href="${dashboardUrl}" class="button">Update Profile</a>
                
                <p>If you have any questions about the review process or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>We appreciate your patience and look forward to having you as a vendor on our platform.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${
        process.env.APP_NAME
      }. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      text = `
        Hello ${user.name},
        
        Thank you for your interest in becoming a vendor on our platform. After reviewing your application, we need some additional information or corrections before we can approve your account.
        
        ${notes ? `Review Notes: ${notes}` : ''}
        
        Please review the feedback and update your vendor profile accordingly. Once you've made the necessary changes, your application will be reviewed again.
        
        Update your profile here: ${dashboardUrl}
        
        If you have any questions, please contact our support team.
        
        We appreciate your patience and look forward to having you as a vendor on our platform.
        
        ${process.env.APP_NAME}
      `;
    }

    await this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }
}

module.exports = new EmailService();
