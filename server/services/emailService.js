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

  async sendOrderConfirmationEmail(orderData) {
    const {
      user,
      _id: orderId,
      orderStatus = 'confirmed',
      paymentStatus = 'paid',
      createdAt: orderDate,
      products = [],
      shippingAddress,
      totalPrice,
      shippingCost,
      paymentMethod,
      trackingNumber,
    } = orderData;

    // Calculate subtotal
    const subtotal = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Format order date
    const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate track order URL (replace with your actual URL)
    const trackOrderUrl = trackingNumber
      ? `${process.env.FRONTEND_URL}/track-order/${orderId}`
      : null;
    const shopUrl = process.env.FRONTEND_URL;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f7fafc;
                color: #2d3748;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
            }
            
            .header {
                background-color: #48bb78;
                color: white;
                text-align: center;
                padding: 40px 20px;
            }
            
            .checkmark {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: white;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: #48bb78;
                font-weight: bold;
            }
            
            .header h1 {
                font-size: 28px;
                margin: 0 0 10px 0;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
                margin: 5px 0;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .order-info {
                background-color: #edf2f7;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .order-info h2 {
                font-size: 18px;
                margin-bottom: 15px;
                color: #2d3748;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .info-row:last-child {
                margin-bottom: 0;
            }
            
            .badge {
                background-color: #48bb78;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .badge.pending {
                background-color: #ed8936;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section h2 {
                font-size: 20px;
                margin-bottom: 15px;
                color: #2d3748;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 5px;
            }
            
            .product-item {
                background-color: #f7fafc;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .product-info h3 {
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .product-info p {
                font-size: 14px;
                color: #718096;
                margin: 0;
            }
            
            .product-price {
                font-weight: bold;
                font-size: 16px;
            }
            
            .address {
                line-height: 1.8;
            }
            
            .summary {
                background-color: #edf2f7;
                padding: 20px;
                border-radius: 8px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            
            .summary-total {
                border-top: 2px solid #cbd5e0;
                padding-top: 10px;
                margin-top: 10px;
                font-weight: bold;
                font-size: 18px;
            }
            
            .next-steps {
                background-color: #ebf8ff;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3182ce;
            }
            
            .next-steps h3 {
                color: #2c5282;
                margin-bottom: 15px;
            }
            
            .next-steps ul {
                list-style: none;
                color: #2c5282;
                margin: 0;
                padding: 0;
            }
            
            .next-steps li {
                margin-bottom: 8px;
            }
            
            .next-steps li::before {
                content: "• ";
                font-weight: bold;
            }
            
            .button {
                display: inline-block;
                background-color: #3182ce;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 10px 10px 10px 0;
            }
            
            .button.secondary {
                background-color: white;
                color: #3182ce;
                border: 2px solid #3182ce;
            }
            
            .footer {
                background-color: #4a5568;
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .footer h3 {
                margin-bottom: 10px;
            }
            
            .footer p {
                margin-bottom: 5px;
            }
            
            .footer a {
                color: #63b3ed;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="checkmark">✓</div>
                <h1>Order Confirmed!</h1>
                <p>Thank you for your purchase. Your order has been successfully placed.</p>
                <p><strong>Order ID: ${orderId}</strong></p>
            </div>

            <div class="content">
                <div class="order-info">
                    <h2>Order Status</h2>
                    <div class="info-row">
                        <span>Current Status:</span>
                        <span class="badge ${
                          orderStatus === 'pending' ? 'pending' : ''
                        }">${orderStatus}</span>
                    </div>
                    <div class="info-row">
                        <span>Payment Status:</span>
                        <span class="badge ${
                          paymentStatus === 'pending' ? 'pending' : ''
                        }">${paymentStatus}</span>
                    </div>
                    <div class="info-row">
                        <span>Order Date:</span>
                        <span>${formattedDate}</span>
                    </div>
                </div>

                <div class="section">
                    <h2>Order Items</h2>
                    ${products
                      .map(
                        (product) => `
                        <div class="product-item">
                            <div class="product-info">
                                <h3>${product.product?.name || 'Product'}</h3>
                                <p>Quantity: ${product.quantity}</p>
                                <p>Price: $${product.price.toFixed(2)} each</p>
                            </div>
                            <div class="product-price">$${(
                              product.price * product.quantity
                            ).toFixed(2)}</div>
                        </div>
                    `
                      )
                      .join('')}
                </div>

                <div class="section">
                    <h2>Shipping Address</h2>
                    <div class="address">
                        ${shippingAddress.street}<br>
                        ${shippingAddress.city}, ${shippingAddress.state} ${
      shippingAddress.zipCode
    }<br>
                        ${shippingAddress.country}
                    </div>
                </div>

                <div class="section">
                    <h2>Order Summary</h2>
                    <div class="summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        ${
                          shippingCost
                            ? `
                        <div class="summary-row">
                            <span>Shipping:</span>
                            <span>$${shippingCost.toFixed(2)}</span>
                        </div>
                        `
                            : ''
                        }
                        <div class="summary-row summary-total">
                            <span>Total:</span>
                            <span>$${totalPrice.toFixed(2)}</span>
                        </div>
                        <p style="margin-top: 15px; font-size: 14px; color: #718096;">
                            Payment Method: ${
                              paymentMethod === 'stripe'
                                ? 'Credit Card (Stripe)'
                                : paymentMethod === 'paystack'
                                ? 'Paystack'
                                : paymentMethod === 'card'
                                ? 'Credit/Debit Card'
                                : paymentMethod === 'bank_transfer'
                                ? 'Bank Transfer'
                                : paymentMethod
                            }
                        </p>
                    </div>
                </div>

                <div class="section">
                    <div class="next-steps">
                        <h3>What's Next?</h3>
                        <ul>
                            <li>You'll receive tracking information once your order ships</li>
                            <li>Estimated delivery: 3-5 business days</li>
                            <li>We'll send updates on your order status</li>
                        </ul>
                    </div>
                </div>

                <div class="section" style="text-align: center;">
                    ${
                      trackOrderUrl
                        ? `<a href="${trackOrderUrl}" class="button">Track Your Order</a>`
                        : ''
                    }
                    ${
                      shopUrl
                        ? `<a href="${shopUrl}" class="button secondary">Continue Shopping</a>`
                        : ''
                    }
                </div>
            </div>

            <div class="footer">
                <h3>Need Help?</h3>
                <p>If you have any questions about your order, please contact us:</p>
                <p>Email: <a href="mailto:${
                  process.env.SUPPORT_EMAIL || 'support@example.com'
                }">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a></p>
                <p>Phone: ${
                  process.env.SUPPORT_PHONE || '+1 (555) 123-4567'
                }</p>
                <br>
                <p style="font-size: 12px; opacity: 0.8;">
                    This email was sent to ${user.email}.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

    const text = `
    Order Confirmed!
    
    Hello ${user.name}!
    
    Thank you for your purchase. Your order has been successfully placed.
    
    Order ID: ${orderId}
    Order Date: ${formattedDate}
    Status: ${orderStatus}
    Payment Status: ${paymentStatus}
    
    Order Items:
    ${products
      .map(
        (product) =>
          `- ${product.product?.name || 'Product'} (Qty: ${
            product.quantity
          }) - $${(product.price * product.quantity).toFixed(2)}`
      )
      .join('\n')}
    
    Shipping Address:
    ${shippingAddress.street}
    ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}
    ${shippingAddress.country}
    
    Order Summary:
    Subtotal: $${subtotal.toFixed(2)}
    ${shippingCost ? `Shipping: $${shippingCost.toFixed(2)}` : ''}
    Total: $${totalPrice.toFixed(2)}
    Payment Method: ${
      paymentMethod === 'stripe'
        ? 'Credit Card (Stripe)'
        : paymentMethod === 'paystack'
        ? 'Paystack'
        : paymentMethod === 'card'
        ? 'Credit/Debit Card'
        : paymentMethod === 'bank_transfer'
        ? 'Bank Transfer'
        : paymentMethod
    }
    
    What's Next?
    - You'll receive tracking information once your order ships
    - Estimated delivery: 3-5 business days
    - We'll send updates on your order status
    
    ${trackOrderUrl ? `Track your order: ${trackOrderUrl}` : ''}
    
    If you have any questions, contact us at ${
      process.env.SUPPORT_EMAIL || 'support@example.com'
    }
    
    ${process.env.APP_NAME || 'Our Store'}
  `;

    await this.sendEmail({
      to: user.email,
      subject: `Order Confirmation - Order #${orderId}`,
      html,
      text,
    });
  }

  async sendOrderFailedEmail(orderData) {
    const {
      user,
      _id: orderId,
      createdAt: orderDate,
      products = [],
      totalPrice,
      paymentStatus,
      paymentMethod,
      failureReason = 'Payment processing failed',
    } = orderData;

    // Format order date
    const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate URLs (replace with your actual URLs)
    const retryOrderUrl = `${process.env.FRONTEND_URL}/checkout?retry_order=${orderId}`;
    const shopUrl = process.env.FRONTEND_URL;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f7fafc;
                color: #2d3748;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
            }
            
            .header {
                background-color: #f56565;
                color: white;
                text-align: center;
                padding: 40px 20px;
            }
            
            .error-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: white;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: #f56565;
                font-weight: bold;
            }
            
            .header h1 {
                font-size: 28px;
                margin: 0 0 10px 0;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
                margin: 5px 0;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .alert-box {
                background-color: #fed7d7;
                border: 1px solid #fc8181;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .alert-box h2 {
                font-size: 18px;
                margin-bottom: 15px;
                color: #c53030;
            }
            
            .alert-box p {
                color: #742a2a;
                margin: 0;
            }
            
            .order-info {
                background-color: #edf2f7;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .order-info h2 {
                font-size: 18px;
                margin-bottom: 15px;
                color: #2d3748;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .info-row:last-child {
                margin-bottom: 0;
            }
            
            .section {
                margin-bottom: 30px;
            }
            
            .section h2 {
                font-size: 20px;
                margin-bottom: 15px;
                color: #2d3748;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 5px;
            }
            
            .product-item {
                background-color: #f7fafc;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .product-info h3 {
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .product-info p {
                font-size: 14px;
                color: #718096;
                margin: 0;
            }
            
            .product-price {
                font-weight: bold;
                font-size: 16px;
            }
            
            .next-steps {
                background-color: #e6fffa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #38b2ac;
            }
            
            .next-steps h3 {
                color: #285e61;
                margin-bottom: 15px;
            }
            
            .next-steps ul {
                list-style: none;
                color: #285e61;
                margin: 0;
                padding: 0;
            }
            
            .next-steps li {
                margin-bottom: 8px;
            }
            
            .next-steps li::before {
                content: "• ";
                font-weight: bold;
            }
            
            .button {
                display: inline-block;
                background-color: #f56565;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 10px 10px 10px 0;
            }
            
            .button.secondary {
                background-color: white;
                color: #3182ce;
                border: 2px solid #3182ce;
            }
            
            .footer {
                background-color: #4a5568;
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .footer h3 {
                margin-bottom: 10px;
            }
            
            .footer p {
                margin-bottom: 5px;
            }
            
            .footer a {
                color: #63b3ed;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="error-icon">✗</div>
                <h1>Order Failed</h1>
                <p>We encountered an issue processing your order.</p>
                <p><strong>Order ID: ${orderId}</strong></p>
            </div>

            <div class="content">
                <div class="alert-box">
                    <h2>What went wrong?</h2>
                    <p>${
                      failureReason ||
                      'There was an issue processing your payment. Please check your payment method and try again.'
                    }</p>
                </div>

                <div class="order-info">
                    <h2>Order Details</h2>
                    <div class="info-row">
                        <span>Order Date:</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="info-row">
                        <span>Payment Status:</span>
                        <span>${paymentStatus}</span>
                    </div>
                    <div class="info-row">
                        <span>Payment Method:</span>
                        <span>${
                          paymentMethod === 'stripe'
                            ? 'Credit Card (Stripe)'
                            : paymentMethod === 'paystack'
                            ? 'Paystack'
                            : paymentMethod === 'card'
                            ? 'Credit/Debit Card'
                            : paymentMethod === 'bank_transfer'
                            ? 'Bank Transfer'
                            : paymentMethod
                        }</span>
                    </div>
                    <div class="info-row">
                        <span>Total Amount:</span>
                        <span>$${totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div class="section">
                    <h2>Items in Your Order</h2>
                    ${products
                      .map(
                        (product) => `
                        <div class="product-item">
                            <div class="product-info">
                                <h3>${product.product?.name || 'Product'}</h3>
                                <p>Quantity: ${product.quantity}</p>
                                <p>Price: $${product.price.toFixed(2)} each</p>
                            </div>
                            <div class="product-price">$${(
                              product.price * product.quantity
                            ).toFixed(2)}</div>
                        </div>
                    `
                      )
                      .join('')}
                </div>

                <div class="section">
                    <div class="next-steps">
                        <h3>What can you do?</h3>
                        <ul>
                            <li>Check your payment method and billing information</li>
                            <li>Ensure you have sufficient funds in your account</li>
                            <li>Try a different payment method</li>
                            <li>Contact your bank if the issue persists</li>
                            <li>Reach out to our support team for assistance</li>
                        </ul>
                    </div>
                </div>

                <div class="section" style="text-align: center;">
                    ${
                      retryOrderUrl
                        ? `<a href="${retryOrderUrl}" class="button">Try Again</a>`
                        : ''
                    }
                    ${
                      shopUrl
                        ? `<a href="${shopUrl}" class="button secondary">Continue Shopping</a>`
                        : ''
                    }
                </div>
            </div>

            <div class="footer">
                <h3>Need Help?</h3>
                <p>If you continue to experience issues, please contact our support team:</p>
                <p>Email: <a href="mailto:${
                  process.env.SUPPORT_EMAIL || 'support@example.com'
                }">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a></p>
                <p>Phone: ${
                  process.env.SUPPORT_PHONE || '+1 (555) 123-4567'
                }</p>
                <br>
                <p style="font-size: 12px; opacity: 0.8;">
                    This email was sent to ${user.email}.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

    const text = `
    Order Failed
    
    Hello ${user.name},
    
    We encountered an issue processing your order.
    
    Order ID: ${orderId}
    Order Date: ${formattedDate}
    Payment Status: ${paymentStatus}
    Total Amount: $${totalPrice.toFixed(2)}
    Payment Method: ${
      paymentMethod === 'stripe'
        ? 'Credit Card (Stripe)'
        : paymentMethod === 'paystack'
        ? 'Paystack'
        : paymentMethod === 'card'
        ? 'Credit/Debit Card'
        : paymentMethod === 'bank_transfer'
        ? 'Bank Transfer'
        : paymentMethod
    }
    
    What went wrong?
    ${
      failureReason ||
      'There was an issue processing your payment. Please check your payment method and try again.'
    }
    
    Items in Your Order:
    ${products
      .map(
        (product) =>
          `- ${product.product?.name || 'Product'} (Qty: ${
            product.quantity
          }) - $${(product.price * product.quantity).toFixed(2)}`
      )
      .join('\n')}
    
    What can you do?
    - Check your payment method and billing information
    - Ensure you have sufficient funds in your account
    - Try a different payment method
    - Contact your bank if the issue persists
    - Reach out to our support team for assistance
    
    ${retryOrderUrl ? `Try again: ${retryOrderUrl}` : ''}
    
    If you continue to experience issues, contact us at ${
      process.env.SUPPORT_EMAIL || 'support@example.com'
    }
    
    ${process.env.APP_NAME || 'Our Store'}
  `;

    await this.sendEmail({
      to: user.email,
      subject: `Order Failed - Order #${orderId}`,
      html,
      text,
    });
  }
}

module.exports = new EmailService();
