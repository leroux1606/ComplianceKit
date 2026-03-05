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
 * Send DSAR confirmation email to the requester (A1)
 */
export async function sendDsarConfirmationEmail(params: {
  to: string;
  requesterName: string | null;
  requestTypeLabel: string;
  referenceId: string;
  dueDate: Date;
  websiteName: string;
  companyName: string | null;
}) {
  const { to, requesterName, requestTypeLabel, referenceId, dueDate, websiteName, companyName } = params;
  const displayName = requesterName || 'there';
  const displayCompany = companyName || websiteName;
  const shortRef = referenceId.slice(0, 8).toUpperCase();
  const dueDateStr = dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@compliancekit.app';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .ref-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 18px; letter-spacing: 2px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Request Has Been Received</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>We have received your data rights request and it has been forwarded to <strong>${displayCompany}</strong> for processing.</p>

            <p><strong>Your reference number:</strong></p>
            <div class="ref-box">${shortRef}</div>
            <p style="font-size:13px;color:#64748b;">Please quote this reference in any follow-up correspondence.</p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 0;color:#64748b;">Request type</td><td style="padding:8px 0;font-weight:bold;">${requestTypeLabel}</td></tr>
              <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 0;color:#64748b;">Submitted to</td><td style="padding:8px 0;">${displayCompany}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Response due by</td><td style="padding:8px 0;font-weight:bold;">${dueDateStr}</td></tr>
            </table>

            <p>Under GDPR, ${displayCompany} must respond to your request within <strong>30 days</strong>. If you do not hear back by ${dueDateStr}, you have the right to lodge a complaint with your local data protection authority.</p>

            <p>If you have any questions about your request, please contact ${displayCompany} directly and quote your reference number <strong>${shortRef}</strong>.</p>
          </div>
          <div class="footer">
            <p>This confirmation was sent by ComplianceKit on behalf of ${displayCompany}</p>
            <p>Questions about this service? <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Your Data Request Has Been Received — Reference: ${shortRef}

Hi ${displayName},

We have received your ${requestTypeLabel} request and forwarded it to ${displayCompany} for processing.

Reference number: ${shortRef}
Request type:     ${requestTypeLabel}
Submitted to:     ${displayCompany}
Response due by:  ${dueDateStr}

Under GDPR, ${displayCompany} must respond within 30 days. If you do not hear back by ${dueDateStr}, you may lodge a complaint with your local data protection authority.

Please quote reference ${shortRef} in any follow-up correspondence.

---
This confirmation was sent by ComplianceKit on behalf of ${displayCompany}
  `.trim();

  return sendEmail({
    to,
    subject: `Your data request has been received — Ref: ${shortRef}`,
    html,
    text,
  });
}

/**
 * Send DSAR notification email to the website owner (A2)
 */
export async function sendDsarOwnerNotificationEmail(params: {
  to: string;
  requesterName: string | null;
  requesterEmail: string;
  requestTypeLabel: string;
  referenceId: string;
  dueDate: Date;
  websiteName: string;
  dashboardUrl: string;
}) {
  const { to, requesterName, requesterEmail, requestTypeLabel, referenceId, dueDate, websiteName, dashboardUrl } = params;
  const shortRef = referenceId.slice(0, 8).toUpperCase();
  const dueDateStr = dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const displayRequester = requesterName ? `${requesterName} (${requesterEmail})` : requesterEmail;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #0f172a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Data Subject Request</h1>
            <p style="margin:0;opacity:0.85;">Action required — respond within 30 days</p>
          </div>
          <div class="content">
            <p>A new data subject request has been submitted through your <strong>${websiteName}</strong> DSAR form.</p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 0;color:#64748b;width:140px;">Reference</td><td style="padding:8px 0;font-family:monospace;font-weight:bold;">${shortRef}</td></tr>
              <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 0;color:#64748b;">Request type</td><td style="padding:8px 0;font-weight:bold;">${requestTypeLabel}</td></tr>
              <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 0;color:#64748b;">From</td><td style="padding:8px 0;">${displayRequester}</td></tr>
              <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:8px 0;color:#64748b;">Website</td><td style="padding:8px 0;">${websiteName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Due by</td><td style="padding:8px 0;font-weight:bold;color:#dc2626;">${dueDateStr}</td></tr>
            </table>

            <div class="alert">
              <strong>GDPR Article 12 — Action Required</strong><br>
              You must respond to this request by <strong>${dueDateStr}</strong> (30 days from submission). Failure to respond is a breach of GDPR and may result in regulatory action.
            </div>

            <p style="text-align:center;">
              <a href="${dashboardUrl}" class="button">View Request in Dashboard</a>
            </p>

            <p>You can manage this request, add notes, and record your response in your ComplianceKit dashboard.</p>
          </div>
          <div class="footer">
            <p>This notification was sent by ComplianceKit</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
New Data Subject Request — Action Required

A new ${requestTypeLabel} request has been submitted via ${websiteName}.

Reference:    ${shortRef}
Request type: ${requestTypeLabel}
From:         ${displayRequester}
Website:      ${websiteName}
Due by:       ${dueDateStr}

GDPR REQUIREMENT: You must respond by ${dueDateStr} (30 days from submission).

Manage this request in your dashboard:
${dashboardUrl}

---
This notification was sent by ComplianceKit
  `.trim();

  return sendEmail({
    to,
    subject: `Action required: New ${requestTypeLabel} request — ${websiteName} (Ref: ${shortRef})`,
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
