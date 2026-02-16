/**
 * Email utility for sending transactional emails
 * Using Resend for production-ready email delivery
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend or fallback to console logging in development
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;

  // In development or if no API key, log to console
  if (!resendApiKey || process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL (Development Mode)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(text || 'Check HTML content');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    // Use Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'ComplianceKit <noreply@compliancekit.app>',
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0f172a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>We received a request to reset your password for your ComplianceKit account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>This email was sent by ComplianceKit</p>
            <p>If you have questions, contact support at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@compliancekit.app'}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Password Reset Request

Hi there,

We received a request to reset your password for your ComplianceKit account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

---
This email was sent by ComplianceKit
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - ComplianceKit',
    html,
    text,
  });
}

/**
 * Send account deletion confirmation email
 */
export async function sendAccountDeletionEmail(email: string, userName?: string | null) {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@compliancekit.app';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Account Deletion Requested</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your ComplianceKit account has been scheduled for deletion as requested.</p>
            
            <div class="info-box">
              <strong>🕐 30-Day Grace Period</strong>
              <p style="margin: 10px 0 0 0;">You have <strong>30 days</strong> to change your mind. If you want to cancel this deletion request, please contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a> within the next 30 days.</p>
            </div>

            <h3>What happens next:</h3>
            <ul>
              <li><strong>Immediate:</strong> Your account is deactivated and you cannot log in</li>
              <li><strong>Immediate:</strong> Any active subscription has been cancelled</li>
              <li><strong>After 30 days:</strong> Your personal data will be permanently deleted</li>
              <li><strong>Legal retention:</strong> Some data (invoices, tax records) will be anonymized and retained for legal compliance (7 years)</li>
            </ul>

            <h3>Data Deletion Details (GDPR Article 17):</h3>
            <p>After the 30-day grace period, we will:</p>
            <ul>
              <li>Delete all your personal information (name, email, profile data)</li>
              <li>Delete all your websites, scans, and generated policies</li>
              <li>Delete all cookie consent records</li>
              <li>Anonymize billing records (required by tax law - 7 years retention)</li>
            </ul>

            <div class="info-box">
              <strong>💾 Data Export</strong>
              <p style="margin: 10px 0 0 0;">Before your account was marked for deletion, we recommend exporting your data. If you need a copy of your data, please contact support immediately.</p>
            </div>

            <p>If you did not request this deletion, please contact us immediately at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          </div>
          <div class="footer">
            <p>This email was sent by ComplianceKit</p>
            <p>Privacy inquiries: ${process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@compliancekit.app'}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Account Deletion Requested

Hi ${userName || 'there'},

Your ComplianceKit account has been scheduled for deletion as requested.

30-DAY GRACE PERIOD
You have 30 days to change your mind. If you want to cancel this deletion request, 
please contact our support team at ${supportEmail} within the next 30 days.

WHAT HAPPENS NEXT:
- Immediate: Your account is deactivated and you cannot log in
- Immediate: Any active subscription has been cancelled
- After 30 days: Your personal data will be permanently deleted
- Legal retention: Some data (invoices, tax records) will be anonymized and 
  retained for legal compliance (7 years)

DATA DELETION DETAILS (GDPR Article 17):
After the 30-day grace period, we will:
- Delete all your personal information (name, email, profile data)
- Delete all your websites, scans, and generated policies
- Delete all cookie consent records
- Anonymize billing records (required by tax law - 7 years retention)

DATA EXPORT:
Before your account was marked for deletion, we recommend exporting your data. 
If you need a copy of your data, please contact support immediately.

If you did not request this deletion, please contact us immediately at ${supportEmail}.

---
This email was sent by ComplianceKit
Privacy inquiries: ${process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@compliancekit.app'}
  `;

  return sendEmail({
    to: email,
    subject: '⚠️ Account Deletion Scheduled - ComplianceKit',
    html,
    text,
  });
}
