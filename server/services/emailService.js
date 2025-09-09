require('dotenv').config();
const { FRONTEND_URL } = require('../configs');
const nodemailer = require('nodemailer');

//Email service
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      authMethod: 'PLAIN',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('SMTP server is ready to take messages');
      }
    });
  }

  async sendEmail(options) {
    try {
      console.log('Email config check:', {
        hasSmtpHost: !!process.env.SMTP_HOST,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        hasSmtpUser: !!process.env.SMTP_USER,
        smtpUser: process.env.SMTP_USER,
        fromEmail: process.env.EMAIL_FROM,
        appName: process.env.APP_NAME,
      });

      const emailData = {
        from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log('Attempting to send email:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from,
      });

      const result = await this.transporter.sendMail(emailData);
      return result;
    } catch (error) {
      console.error('Email sending failed:', {
        error: error.message,
        name: error.name,
        code: error.code,
        command: error.command,
      });
      throw error;
    }
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${FRONTEND_URL}/users/verify-email/${token}`;

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

  async sendResendVerificationEmail(user, token) {
    const verificationUrl = `${FRONTEND_URL}/users/verify-email/${token}`;

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
            <p>Please verify your email address to complete your registration.</p>
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
    const resetUrl = `${FRONTEND_URL}/users/reset-password/${token}`;

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

  async sendAccountActivationEmail(user, reason = null) {
    const loginUrl = `${FRONTEND_URL}/my-account`;

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
            .success-icon { font-size: 48px; color: #4CAF50; text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Activated</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>Hello ${user.name}!</h2>
              <p>Great news! Your account has been <strong>activated</strong> and you can now access all platform features.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>You can now log in and enjoy our services.</p>
              <a href="${loginUrl}" class="button">Login Now</a>
              <p>Thank you for being part of our community!</p>
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
      
      Great news! Your account has been activated and you can now access all platform features.
      
      ${reason ? `Reason: ${reason}` : ''}
      
      You can now log in at: ${loginUrl}
      
      Thank you for being part of our community!
      
      ${process.env.APP_NAME}
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Account Activated - Welcome Back!',
      html,
      text,
    });
  }

  async sendAccountDeactivationEmail(user, reason = null) {
    const supportUrl = `${FRONTEND_URL}/support`;

    const html = `
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Deactivated</h1>
            </div>
            <div class="content">
              <div class="warning-icon">⚠️</div>
              <h2>Hello ${user.name},</h2>
              <p>We're writing to inform you that your account has been <strong>deactivated</strong>.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>You will not be able to access your account until it is reactivated.</p>
              <p>If you believe this was done in error or have questions, please contact our support team.</p>
              <a href="${supportUrl}" class="button">Contact Support</a>
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
      Hello ${user.name},
      
      We're writing to inform you that your account has been deactivated.
      
      ${reason ? `Reason: ${reason}` : ''}
      
      You will not be able to access your account until it is reactivated.
      
      If you believe this was done in error or have questions, please contact our support team at: ${supportUrl}
      
      ${process.env.APP_NAME}
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Account Deactivated - Action Required',
      html,
      text,
    });
  }

  async sendVendorVerificationEmail(user, status, notes = null) {
    const dashboardUrl = `${FRONTEND_URL}/store-manager`;
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@example.com';

    let html, text, subject;

    switch (status) {
      case 'approved':
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
        text = `Your existing approved text template`;
        break;

      case 'rejected':
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
        break;

      case 'suspended':
        subject = 'Important: Your Vendor Account Has Been Suspended';
        html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .warning-icon { font-size: 48px; color: #ff9800; text-align: center; margin-bottom: 20px; }
              .notes-section { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Vendor Account Suspended</h1>
              </div>
              <div class="content">
                <div class="warning-icon">🚫</div>
                <h2>Hello ${user.name},</h2>
                <p>We regret to inform you that your vendor account has been <strong>temporarily suspended</strong> on our platform.</p>
                
                ${
                  notes
                    ? `
                <div class="notes-section">
                  <h3>Reason for Suspension:</h3>
                  <p><strong>${notes}</strong></p>
                </div>
                `
                    : ''
                }
                
                <p>During this suspension period:</p>
                <ul>
                  <li>Your products will not be visible to customers</li>
                  <li>You won't be able to receive new orders</li>
                  <li>Pending orders will be placed on hold</li>
                </ul>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li>Review our vendor guidelines and terms of service</li>
                  <li>Address the issues mentioned above</li>
                  <li>Contact our support team to appeal the suspension</li>
                </ol>
                
                <p>If you believe this suspension was made in error, please contact us immediately at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
                
                <p>We value your partnership and hope to resolve this matter promptly.</p>
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
        Important: Your Vendor Account Has Been Suspended
        
        Hello ${user.name},
        
        We regret to inform you that your vendor account has been temporarily suspended on our platform.
        
        ${notes ? `Reason for Suspension: ${notes}` : ''}
        
        During this suspension period:
        - Your products will not be visible to customers
        - You won't be able to receive new orders
        - Pending orders will be placed on hold
        
        Next Steps:
        1. Review our vendor guidelines and terms of service
        2. Address the issues mentioned above
        3. Contact our support team to appeal the suspension
        
        If you believe this suspension was made in error, please contact us immediately at ${supportEmail}.
        
        We value your partnership and hope to resolve this matter promptly.
        
        ${process.env.APP_NAME}
      `;
        break;

      case 'pending':
        subject = 'Your Vendor Application is Under Review';
        html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .info-icon { font-size: 48px; color: #2196F3; text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Vendor Application Received</h1>
              </div>
              <div class="content">
                <div class="info-icon">⏳</div>
                <h2>Hello ${user.name},</h2>
                <p>Thank you for submitting your vendor application to ${
                  process.env.APP_NAME
                }!</p>
                <p>We're currently reviewing your application and will notify you once the verification process is complete.</p>
                
                <p><strong>What to expect next:</strong></p>
                <ul>
                  <li>Our team will review your business information and documents</li>
                  <li>Verification typically takes 2-3 business days</li>
                  <li>You'll receive an email notification once a decision is made</li>
                </ul>
                
                <p>In the meantime, you can:</p>
                <ul>
                  <li>Ensure all your contact information is up-to-date</li>
                  <li>Prepare your product catalog for quick onboarding</li>
                  <li>Review our vendor guidelines and policies</li>
                </ul>
                
                <p>If you have any questions or need to update your application, please contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
                
                <p>We appreciate your patience and look forward to working with you!</p>
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
        Your Vendor Application is Under Review
        
        Hello ${user.name},
        
        Thank you for submitting your vendor application to ${process.env.APP_NAME}!
        
        We're currently reviewing your application and will notify you once the verification process is complete.
        
        What to expect next:
        - Our team will review your business information and documents
        - Verification typically takes 2-3 business days
        - You'll receive an email notification once a decision is made
        
        In the meantime, you can:
        - Ensure all your contact information is up-to-date
        - Prepare your product catalog for quick onboarding
        - Review our vendor guidelines and policies
        
        If you have any questions, please contact our support team at ${supportEmail}.
        
        We appreciate your patience and look forward to working with you!
        
        ${process.env.APP_NAME}
      `;
        break;

      default:
        throw new Error(`Unknown vendor status: ${status}`);
    }

    await this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }

  async sendOrderStatusUpdateEmail(orderData) {
    const {
      userId,
      _id: orderId,
      orderStatus,
      trackingNumber,
      estimatedDelivery,
      products = [],
      totalPrice,
    } = orderData;

    if (!orderData || !userId || !orderId) {
      console.error('Missing required order data:', {
        orderData,
        userId,
        orderId,
      });
      throw new Error('Missing required order data');
    }

    const safeProducts = Array.isArray(products) ? products : [];

    if (safeProducts.length === 0) {
      console.warn(`Order ${orderId} has no products array or empty products`);
    }

    const formattedOrderDate = orderData.createdAt
      ? new Date(orderData.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    const formattedEstDelivery = estimatedDelivery
      ? new Date(estimatedDelivery).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    let statusTitle,
      statusMessage,
      nextSteps,
      showTracking = false,
      headerColor = '#4CAF50';

    switch (orderStatus) {
      case 'pending':
        statusTitle = 'Order Confirmation';
        statusMessage =
          'Thank you for your order. We have received your order and will process it shortly.';
        nextSteps = [
          'Payment verification in progress',
          'You will receive an update within 24 hours',
        ];
        headerColor = '#FF9800';
        break;

      case 'paid':
        statusTitle = 'Payment Confirmed';
        statusMessage =
          'Your payment has been successfully processed and confirmed.';
        nextSteps = [
          'Your order will be processed within 1-2 business days',
          'You will receive a shipping notification once dispatched',
        ];
        headerColor = '#4CAF50';
        break;

      case 'processing':
        statusTitle = 'Order in Progress';
        statusMessage = 'Your order is currently being prepared for shipment.';
        nextSteps = [
          'Processing time: 1-2 business days',
          'Shipping notification will be sent upon dispatch',
        ];
        headerColor = '#2196F3';
        break;

      case 'shipped':
        statusTitle = 'Order Dispatched';
        statusMessage = 'Your order has been shipped and is on its way to you.';
        nextSteps = [
          'Track your package using the details below',
          `Expected delivery: ${formattedEstDelivery || '3-5 business days'}`,
        ];
        showTracking = true;
        headerColor = '#4CAF50';
        break;

      case 'delivered':
        statusTitle = 'Order Delivered';
        statusMessage =
          'Your order has been successfully delivered to your address.';
        nextSteps = [
          'Please inspect your package upon receipt',
          'Contact support within 7 days for any concerns',
        ];
        headerColor = '#4CAF50';
        break;

      case 'cancelled':
        statusTitle = 'Order Cancelled';
        statusMessage = 'Your order has been cancelled as requested.';
        nextSteps = [
          'Refund processing will begin within 24 hours',
          'Full refund expected within 5-7 business days',
        ];
        headerColor = '#f56565';
        break;

      case 'returned':
        statusTitle = 'Return Processed';
        statusMessage = 'Your return request has been processed successfully.';
        nextSteps = [
          'Refund will be processed to your original payment method',
          'Please allow 5-10 business days for refund completion',
        ];
        headerColor = '#FF9800';
        break;

      case 'on_hold':
        statusTitle = 'Order On Hold';
        statusMessage =
          'Your order is temporarily on hold pending verification.';
        nextSteps = [
          'Our team will contact you within 24 hours',
          'Please check your email for any additional requirements',
        ];
        headerColor = '#FF9800';
        break;

      default:
        statusTitle = 'Order Status Update';
        statusMessage =
          'Your order status has been updated. Please review the details below.';
        nextSteps = [
          'Contact our support team for assistance',
          'Reference your order number for faster service',
        ];
        headerColor = '#9E9E9E';
    }

    const trackOrderUrl = `${FRONTEND_URL}/orders/${orderId}/track`;
    const contactUrl = `${FRONTEND_URL}/contact-us`;
    const shopUrl = `${FRONTEND_URL}/shop`;

    // Safely handle user data
    const userName = userId?.name || 'Valued Customer';
    const userEmail = userId?.email;

    if (!userEmail) {
      console.error('No email found for user:', userId);
      throw new Error('User email is required to send notification');
    }

    const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { 
        background-color: ${headerColor}; 
        color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;
      }
      .header h1 { margin: 0; font-size: 24px; }
      .header p { margin: 10px 0 0 0; opacity: 0.9; }
      .status-icon { font-size: 48px; text-align: center; margin: 20px 0; }
      .content { background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
      .greeting { font-size: 18px; margin-bottom: 15px; }
      .message { font-size: 16px; margin-bottom: 25px; color: #555; }
      .tracking-info { 
        background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;
        border-left: 4px solid ${headerColor};
      }
      .button-container { text-align: center; margin: 30px 0; }
      .button { 
        display: inline-block; padding: 12px 24px; margin: 5px;
        color: white; text-decoration: none; border-radius: 5px; 
        font-weight: bold; transition: opacity 0.3s;
      }
      .button:hover { opacity: 0.8; }
      .button-primary { background-color: ${headerColor}; }
      .button-secondary { background-color: #2196F3; }
      .button-tertiary { background-color: #9C27B0; }
      .order-summary { margin: 25px 0; }
      .order-item { 
        display: flex; justify-content: space-between; padding: 12px 0; 
        border-bottom: 1px solid #f0f0f0; 
      }
      .order-item:last-child { border-bottom: 2px solid #ddd; font-weight: bold; }
      .no-products { color: #666; font-style: italic; text-align: center; padding: 20px; }
      .next-steps { margin: 25px 0; }
      .next-steps ul { padding-left: 20px; }
      .next-steps li { margin: 8px 0; }
      .footer { 
        text-align: center; margin-top: 30px; padding-top: 20px; 
        border-top: 1px solid #eee; font-size: 12px; color: #666; 
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${statusTitle}</h1>
        <p>Order #${orderId} • ${formattedOrderDate}</p>
      </div>
      
      <div class="content">
        <div class="status-icon">
          ${
            orderStatus === 'pending'
              ? '⏳'
              : orderStatus === 'paid'
              ? '💳'
              : orderStatus === 'processing'
              ? '🔄'
              : orderStatus === 'shipped'
              ? '🚚'
              : orderStatus === 'delivered'
              ? '✅'
              : orderStatus === 'cancelled'
              ? '❌'
              : orderStatus === 'returned'
              ? '↩️'
              : orderStatus === 'on_hold'
              ? '⏸️'
              : 'ℹ️'
          }
        </div>
        
        <div class="greeting">Dear ${userName},</div>
        <div class="message">${statusMessage}</div>
        
        ${
          showTracking && trackingNumber
            ? `
          <div class="tracking-info">
            <strong>Tracking Information:</strong><br>
            Tracking Number: ${trackingNumber}<br>
            ${
              formattedEstDelivery
                ? `Estimated Delivery: ${formattedEstDelivery}`
                : ''
            }
          </div>
        `
            : ''
        }
        
        <div class="order-summary">
          <h3>Order Summary:</h3>
          ${
            safeProducts.length > 0
              ? safeProducts
                  .map(
                    (product) => `
              <div class="order-item">
                <span>${product.product?.name || product.name || 'Product'} × ${
                      product.quantity || 1
                    }</span>
                <span>$${(
                  (product.price || 0) * (product.quantity || 1)
                ).toFixed(2)}</span>
              </div>
            `
                  )
                  .join('')
              : '<div class="no-products">Product details unavailable</div>'
          }
          <div class="order-item">
            <span><strong>Total Amount</strong></span>
            <span><strong>$${(totalPrice || 0).toFixed(2)}</strong></span>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>What's Next:</h3>
          <ul>
            ${nextSteps.map((step) => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        
        <div class="button-container">
          ${
            showTracking
              ? `<a href="${trackOrderUrl}" class="button button-primary">Track Package</a>`
              : ''
          }
          <a href="${contactUrl}" class="button button-secondary">Contact Support</a>
          <a href="${shopUrl}" class="button button-tertiary">Continue Shopping</a>
        </div>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${
      process.env.APP_NAME || 'Our Store'
    }. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>
`;

    const text = `
  ${statusTitle}
  
  Dear ${userName},
  
  ${statusMessage}
  
  Order Details:
  - Order Number: ${orderId}
  - Order Date: ${formattedOrderDate}
  - Current Status: ${orderStatus.toUpperCase()}
  ${trackingNumber ? `- Tracking Number: ${trackingNumber}\n` : ''}
  ${
    formattedEstDelivery
      ? `- Estimated Delivery: ${formattedEstDelivery}\n`
      : ''
  }
  
  Order Summary:
  ${
    safeProducts.length > 0
      ? safeProducts
          .map(
            (product) =>
              `- ${product.product?.name || product.name || 'Product'} × ${
                product.quantity || 1
              }: $${((product.price || 0) * (product.quantity || 1)).toFixed(
                2
              )}`
          )
          .join('\n')
      : '- Product details unavailable'
  }
  
  Total Amount: $${(totalPrice || 0).toFixed(2)}
  
  Next Steps:
  ${nextSteps.map((step) => `- ${step}`).join('\n')}
  
  For assistance, please contact our support team or visit our website.
  
  Best regards,
  ${process.env.APP_NAME || 'Our Store'} Team
`;

    try {
      await this.sendEmail({
        to: userEmail,
        subject: `Order Update: ${statusTitle} - #${orderId}`,
        html,
        text,
      });
    } catch (emailError) {
      throw new Error(
        `Failed to send order status email: ${emailError.message}`
      );
    }
  }
}

module.exports = new EmailService();
