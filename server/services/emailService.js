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
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;

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
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;

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
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

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
    const loginUrl = `${process.env.FRONTEND_URL}/my-account`;

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
    const supportUrl = `${process.env.FRONTEND_URL}/support`;

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
    const dashboardUrl = `${process.env.FRONTEND_URL}/store-manager`;
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
      user,
      _id: orderId,
      orderStatus,
      trackingNumber,
      estimatedDelivery,
      deliveredAt,
      products = [],
      totalPrice,
    } = orderData;

    // Format dates
    const formattedOrderDate = new Date(orderData.createdAt).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );

    const formattedEstDelivery = estimatedDelivery
      ? new Date(estimatedDelivery).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    // Status-specific content
    let statusTitle,
      statusMessage,
      nextSteps,
      showTracking = false;

    switch (orderStatus) {
      case 'processing':
        statusTitle = 'Your Order is Being Processed';
        statusMessage =
          "We've received your order and are preparing it for shipment.";
        nextSteps = [
          "We'll notify you when your order ships",
          'Expected processing time: 1-2 business days',
        ];
        break;

      case 'shipped':
        statusTitle = 'Your Order Has Shipped!';
        statusMessage = 'Your order is on its way to you!';
        nextSteps = [
          'Track your package using the link below',
          `Estimated delivery: ${formattedEstDelivery || '3-5 business days'}`,
        ];
        showTracking = true;
        break;

      case 'delivered':
        statusTitle = 'Your Order Has Been Delivered';
        statusMessage = 'Your order has been successfully delivered.';
        nextSteps = [
          'Check your package for any damages',
          'Contact us within 7 days for any issues',
        ];
        break;

      case 'cancelled':
        statusTitle = 'Your Order Has Been Cancelled';
        statusMessage = 'Your order has been cancelled as requested.';
        nextSteps = [
          'If this was unexpected, please contact our support team',
          'Refunds typically process within 5-7 business days',
        ];
        break;

      default:
        statusTitle = 'Your Order Status Has Been Updated';
        statusMessage = `Your order status is now: ${orderStatus}`;
    }

    const trackOrderUrl = `${process.env.FRONTEND_URL}/track-order/${orderId}`;
    const contactUrl = `${process.env.FRONTEND_URL}/contact`;
    const shopUrl = process.env.FRONTEND_URL;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Your existing email styles */
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background-color: ${
            orderStatus === 'cancelled' ? '#f56565' : '#4CAF50'
          }; 
          color: white; padding: 20px; text-align: center; 
        }
        .status-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .button { 
          display: inline-block; padding: 10px 20px; 
          background-color: ${
            orderStatus === 'cancelled' ? '#f56565' : '#4CAF50'
          }; 
          color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; 
        }
        .order-items { margin: 20px 0; }
        .order-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
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
              orderStatus === 'processing'
                ? '🔄'
                : orderStatus === 'shipped'
                ? '🚚'
                : orderStatus === 'delivered'
                ? '✅'
                : orderStatus === 'cancelled'
                ? '❌'
                : 'ℹ️'
            }
          </div>
          
          <h2>Hello ${user.name},</h2>
          <p>${statusMessage}</p>
          
          ${
            showTracking && trackingNumber
              ? `
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          `
              : ''
          }
          
          <div class="order-items">
            <h3>Your Order:</h3>
            ${products
              .map(
                (product) => `
              <div class="order-item">
                <span>${product.product?.name || 'Product'} × ${
                  product.quantity
                }</span>
                <span>$${(product.price * product.quantity).toFixed(2)}</span>
              </div>
            `
              )
              .join('')}
            <div class="order-item" style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">
              <span>Total</span>
              <span>$${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Next Steps:</h3>
          <ul>
            ${nextSteps.map((step) => `<li>${step}</li>`).join('')}
          </ul>
          
          <div style="text-align: center; margin-top: 30px;">
            ${
              showTracking
                ? `<a href="${trackOrderUrl}" class="button">Track Your Order</a>`
                : ''
            }
            <a href="${contactUrl}" class="button" style="background-color: #2196F3;">Contact Support</a>
            <a href="${shopUrl}" class="button" style="background-color: #9C27B0;">Continue Shopping</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
    ${statusTitle}
    
    Hello ${user.name},
    
    ${statusMessage}
    
    Order Details:
    - Order #: ${orderId}
    - Date: ${formattedOrderDate}
    - Status: ${orderStatus}
    ${trackingNumber ? `- Tracking #: ${trackingNumber}\n` : ''}
    
    Order Items:
    ${products
      .map(
        (product) =>
          `- ${product.product?.name || 'Product'} × ${product.quantity}: $${(
            product.price * product.quantity
          ).toFixed(2)}`
      )
      .join('\n')}
    
    Total: $${totalPrice.toFixed(2)}
    
    Next Steps:
    ${nextSteps.map((step) => `- ${step}`).join('\n')}
    
    ${process.env.APP_NAME || 'Our Store'}
  `;

    await this.sendEmail({
      to: user.email,
      subject: `${statusTitle} - Order #${orderId}`,
      html,
      text,
    });
  }
}

module.exports = new EmailService();
