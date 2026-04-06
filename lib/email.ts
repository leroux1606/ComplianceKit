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
 * Send security alert email to the operator (F2)
 * Called fire-and-forget from logSecurityEvent — must not throw.
 */
export async function sendSecurityAlertEmail(params: {
  eventType: string;
  message?: string;
  ipAddress?: string;
  userId?: string;
  email?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}): Promise<void> {
  const alertTo = process.env.SECURITY_ALERT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'security@compliancekit.app';
  const { eventType, message, ipAddress, userId, email, resource, metadata, timestamp } = params;

  const rows = [
    ['Event type', eventType],
    ['Time (UTC)', timestamp],
    ipAddress ? ['IP address', ipAddress] : null,
    userId ? ['User ID', userId] : null,
    email ? ['Email', email] : null,
    resource ? ['Resource', resource] : null,
    message ? ['Message', message] : null,
    metadata ? ['Metadata', JSON.stringify(metadata, null, 2)] : null,
  ].filter(Boolean) as [string, string][];

  const tableRows = rows
    .map(([label, value]) => `<tr><td style="padding:6px 10px;color:#64748b;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 10px;font-family:monospace;word-break:break-all;">${value}</td></tr>`)
    .join('');

  const textRows = rows.map(([label, value]) => `${label.padEnd(14)}: ${value}`).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); color: white; padding: 24px 30px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: bold; font-family: monospace; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; background: white; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; }
          td { border-bottom: 1px solid #f1f5f9; }
          tr:last-child td { border-bottom: none; }
          .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <p style="margin:0 0 6px 0;font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:1px;">ComplianceKit Security Alert</p>
            <h2 style="margin:0;">${eventType.replace(/_/g, ' ')}</h2>
          </div>
          <div class="content">
            <p>A critical security event was detected on your ComplianceKit instance.</p>
            <span class="badge">${eventType}</span>
            <table>${tableRows}</table>
            <p style="font-size:13px;color:#64748b;">Review your security logs and investigate if this activity was unexpected.</p>
          </div>
          <div class="footer">
            <p>ComplianceKit Security Monitoring</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
COMPLIANCEKIT SECURITY ALERT
=============================
Event: ${eventType}

${textRows}

Review your security logs and investigate if this activity was unexpected.
  `.trim();

  try {
    await sendEmail({
      to: alertTo,
      subject: `[SECURITY ALERT] ${eventType.replace(/_/g, ' ')} — ComplianceKit`,
      html,
      text,
    });
  } catch (err) {
    // Never throw from a security alert — we don't want the alert mechanism to break the app
    console.error('[SECURITY] Failed to send alert email:', err);
  }
}

// ---------------------------------------------------------------------------
// Onboarding email sequence (D5)
// ---------------------------------------------------------------------------

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'https://compliancekit.app';

const emailShell = (headerBg: string, headerContent: string, body: string) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: ${headerBg}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #0f172a; color: white !important; padding: 13px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
      .step { display: flex; gap: 12px; margin: 12px 0; }
      .step-num { background: #0f172a; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; }
      .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 13px; }
      .feature-row { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
      .feature-row:last-child { border-bottom: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">${headerContent}</div>
      <div class="content">${body}</div>
      <div class="footer">
        <p>ComplianceKit &mdash; GDPR compliance made simple</p>
        <p><a href="${appUrl()}/dashboard" style="color:#64748b;">Go to your dashboard</a> &nbsp;|&nbsp; <a href="mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@compliancekit.app'}" style="color:#64748b;">Contact support</a></p>
      </div>
    </div>
  </body>
</html>`.trim();

/**
 * Day 0 — Welcome email sent immediately on signup.
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string | null;
}): Promise<void> {
  const { to, name } = params;
  const firstName = name?.split(' ')[0] || 'there';
  const dashboardUrl = `${appUrl()}/dashboard`;
  const addSiteUrl = `${appUrl()}/dashboard/websites/new`;

  const html = emailShell(
    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    `<h1 style="margin:0 0 6px 0;">Welcome to ComplianceKit</h1>
     <p style="margin:0;opacity:0.8;">Your GDPR compliance journey starts here</p>`,
    `<p>Hi ${firstName},</p>
     <p>You're all set. ComplianceKit will help you get your website GDPR-compliant in three simple steps:</p>

     <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e2e8f0;">
       <div class="step"><span class="step-num">1</span><div><strong>Add your website</strong><br><span style="color:#64748b;font-size:14px;">Enter your URL — takes 30 seconds</span></div></div>
       <div class="step"><span class="step-num">2</span><div><strong>Run a compliance scan</strong><br><span style="color:#64748b;font-size:14px;">We'll detect every cookie and tracker on your site</span></div></div>
       <div class="step"><span class="step-num">3</span><div><strong>Install the consent banner</strong><br><span style="color:#64748b;font-size:14px;">One code snippet — your visitors are covered</span></div></div>
     </div>

     <p style="text-align:center;"><a href="${addSiteUrl}" class="button">Add your first website</a></p>

     <p style="font-size:14px;color:#64748b;">The whole process takes about 10 minutes. If you get stuck at any point, just reply to this email — we're here to help.</p>`
  );

  const text = `Welcome to ComplianceKit, ${firstName}!

Get GDPR-compliant in 3 steps:

1. Add your website — ${addSiteUrl}
2. Run a compliance scan (we detect every cookie and tracker)
3. Install the consent banner (one code snippet)

Start here: ${dashboardUrl}

Reply to this email if you need any help.

— The ComplianceKit team`;

  try {
    await sendEmail({ to, subject: `Welcome to ComplianceKit — let's get you compliant`, html, text });
  } catch (err) {
    console.error('[Onboarding] Failed to send welcome email:', err);
  }
}

/**
 * Day 1 nudge — sent if the user has not yet run a scan.
 */
export async function sendOnboardingDay1Email(params: {
  to: string;
  name: string | null;
  websiteId?: string | null;
}): Promise<void> {
  const { to, name, websiteId } = params;
  const firstName = name?.split(' ')[0] || 'there';
  const scanUrl = websiteId
    ? `${appUrl()}/dashboard/websites/${websiteId}/scan`
    : `${appUrl()}/dashboard/websites`;

  const html = emailShell(
    'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
    `<h1 style="margin:0;">Have you scanned your website yet?</h1>`,
    `<p>Hi ${firstName},</p>
     <p>You signed up for ComplianceKit yesterday — great first step. The next one is a compliance scan.</p>
     <p>The scan takes about 60 seconds and will show you:</p>
     <ul>
       <li>Every cookie and tracker your site sets</li>
       <li>Which ones require consent under GDPR</li>
       <li>Your current compliance score</li>
     </ul>
     <p style="text-align:center;"><a href="${scanUrl}" class="button">Run my first scan</a></p>
     <p style="font-size:14px;color:#64748b;">Scans run automatically — no technical knowledge needed.</p>`
  );

  const text = `Hi ${firstName},

You signed up for ComplianceKit yesterday. The next step is to run a compliance scan — it takes about 60 seconds.

The scan will show you every cookie and tracker your site sets, which ones require consent, and your compliance score.

Run your first scan here: ${scanUrl}

— The ComplianceKit team`;

  try {
    await sendEmail({ to, subject: `Your compliance scan is waiting — takes 60 seconds`, html, text });
  } catch (err) {
    console.error('[Onboarding] Failed to send Day 1 email:', err);
  }
}

/**
 * Day 3 nudge — sent if the banner has not been installed (no consents recorded).
 */
export async function sendOnboardingDay3Email(params: {
  to: string;
  name: string | null;
  websiteId?: string | null;
}): Promise<void> {
  const { to, name, websiteId } = params;
  const firstName = name?.split(' ')[0] || 'there';
  const embedUrl = websiteId
    ? `${appUrl()}/dashboard/websites/${websiteId}/embed`
    : `${appUrl()}/dashboard/websites`;

  const html = emailShell(
    'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    `<h1 style="margin:0;">Your cookie banner is ready to install</h1>`,
    `<p>Hi ${firstName},</p>
     <p>Your consent banner is configured and ready to go live. All that's left is pasting one line of code into your website.</p>

     <div style="background:white;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #e2e8f0;">
       <p style="margin:0 0 8px 0;font-size:14px;font-weight:bold;">How to install:</p>
       <ol style="margin:0;padding-left:20px;font-size:14px;color:#374151;">
         <li style="margin-bottom:6px;">Go to your website's embed page</li>
         <li style="margin-bottom:6px;">Copy the script tag</li>
         <li style="margin-bottom:6px;">Paste it into the <code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;">&lt;head&gt;</code> of every page</li>
         <li>Visit your site in a private window to confirm it works</li>
       </ol>
     </div>

     <p style="text-align:center;"><a href="${embedUrl}" class="button">Get my embed code</a></p>

     <p style="font-size:14px;color:#64748b;">Works with WordPress, Shopify, React, and any other platform. Takes under 5 minutes.</p>`
  );

  const text = `Hi ${firstName},

Your ComplianceKit consent banner is configured and ready to go live.

Install it in 4 steps:
1. Go to your embed page: ${embedUrl}
2. Copy the script tag
3. Paste it into the <head> of every page on your site
4. Visit your site in a private window to confirm it works

That's it — your visitors will be covered under GDPR.

— The ComplianceKit team`;

  try {
    await sendEmail({ to, subject: `Your cookie banner is ready — install it in 5 minutes`, html, text });
  } catch (err) {
    console.error('[Onboarding] Failed to send Day 3 email:', err);
  }
}

/**
 * Day 7 nudge — sent to users still on the free plan, showing Pro value.
 */
export async function sendOnboardingDay7Email(params: {
  to: string;
  name: string | null;
}): Promise<void> {
  const { to, name } = params;
  const firstName = name?.split(' ')[0] || 'there';
  const pricingUrl = `${appUrl()}/pricing`;

  const html = emailShell(
    'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    `<h1 style="margin:0;">Here's what Pro unlocks for your compliance</h1>`,
    `<p>Hi ${firstName},</p>
     <p>You've been using ComplianceKit for a week. Here's what upgrading to a paid plan adds:</p>

     <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e2e8f0;">
       <div class="feature-row"><strong>Up to 10 websites</strong> — manage all your client sites in one dashboard</div>
       <div class="feature-row"><strong>90-day consent records</strong> — store records long enough for any audit window</div>
       <div class="feature-row"><strong>DSAR management</strong> — receive and track data subject access requests</div>
       <div class="feature-row"><strong>Consent record export</strong> — download CSV logs to show a DPA on demand</div>
       <div class="feature-row"><strong>Unlimited policy generation</strong> — refresh policies whenever your setup changes</div>
     </div>

     <p>The Starter plan is <strong>$16/month</strong> (billed as R299 via Paystack). That's less than a parking ticket — and it protects you from fines that can run into thousands.</p>

     <p style="text-align:center;"><a href="${pricingUrl}" class="button">See all plans</a></p>

     <p style="font-size:14px;color:#64748b;">No long-term commitment. Cancel any time from your account settings.</p>`
  );

  const text = `Hi ${firstName},

You've been using ComplianceKit for a week. Here's what upgrading to a paid plan adds:

- Up to 10 websites — manage all your client sites in one place
- 90-day consent records — long enough for any audit window
- DSAR management — receive and track data subject requests
- Consent record export — CSV download for DPA investigations
- Unlimited policy generation

The Starter plan is $16/month (billed as R299 via Paystack).

See all plans: ${pricingUrl}

No long-term commitment — cancel any time.

— The ComplianceKit team`;

  try {
    await sendEmail({ to, subject: `What a week of ComplianceKit Pro looks like`, html, text });
  } catch (err) {
    console.error('[Onboarding] Failed to send Day 7 email:', err);
  }
}

/**
 * Send DSAR response email to the requester when request is completed (A3)
 */
export async function sendDsarResponseEmail(params: {
  to: string;
  requesterName: string | null;
  requestTypeLabel: string;
  referenceId: string;
  websiteName: string;
  companyName: string | null;
  responseContent: string;
}): Promise<void> {
  const { to, requesterName, requestTypeLabel, referenceId, websiteName, companyName, responseContent } = params;
  const displayName = requesterName || 'there';
  const displayCompany = companyName || websiteName;
  const shortRef = referenceId.slice(0, 8).toUpperCase();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@compliancekit.app';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .response-box { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Request Has Been Completed</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p><strong>${displayCompany}</strong> has responded to your <strong>${requestTypeLabel}</strong> request (Ref: ${shortRef}).</p>

            <p><strong>Response from ${displayCompany}:</strong></p>
            <div class="response-box">${responseContent}</div>

            <p>If you are not satisfied with this response, you have the right to lodge a complaint with your local data protection authority.</p>
            <p>If you have further questions, please contact ${displayCompany} directly and quote your reference number <strong>${shortRef}</strong>.</p>
          </div>
          <div class="footer">
            <p>This message was sent by ComplianceKit on behalf of ${displayCompany}</p>
            <p>Questions about this service? <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Your ${requestTypeLabel} Request Has Been Completed — Ref: ${shortRef}

Hi ${displayName},

${displayCompany} has responded to your request.

Their response:
${responseContent}

If you are not satisfied with this response, you have the right to lodge a complaint with your local data protection authority.

Please quote reference ${shortRef} in any follow-up correspondence.

---
This message was sent by ComplianceKit on behalf of ${displayCompany}
  `.trim();

  try {
    await sendEmail({
      to,
      subject: `Your data request has been completed — Ref: ${shortRef}`,
      html,
      text,
    });
  } catch (err) {
    console.error('[DSAR] Failed to send response email:', err);
  }
}

/**
 * Send DSAR rejection email to the requester (A4)
 */
export async function sendDsarRejectionEmail(params: {
  to: string;
  requesterName: string | null;
  requestTypeLabel: string;
  referenceId: string;
  websiteName: string;
  companyName: string | null;
  reason: string;
}): Promise<void> {
  const { to, requesterName, requestTypeLabel, referenceId, websiteName, companyName, reason } = params;
  const displayName = requesterName || 'there';
  const displayCompany = companyName || websiteName;
  const shortRef = referenceId.slice(0, 8).toUpperCase();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@compliancekit.app';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .reason-box { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; }
          .info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Request Could Not Be Fulfilled</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p><strong>${displayCompany}</strong> has reviewed your <strong>${requestTypeLabel}</strong> request (Ref: ${shortRef}) and was unable to fulfil it for the following reason:</p>

            <div class="reason-box">${reason}</div>

            <div class="info">
              <strong>Your rights under GDPR</strong><br>
              If you believe this decision is incorrect, you have the right to lodge a complaint with your local data protection authority (e.g. ICO in the UK, CNIL in France, or the Information Regulator in South Africa).
            </div>

            <p>If you have further questions, please contact ${displayCompany} directly and quote your reference number <strong>${shortRef}</strong>.</p>
          </div>
          <div class="footer">
            <p>This message was sent by ComplianceKit on behalf of ${displayCompany}</p>
            <p>Questions about this service? <a href="mailto:${supportEmail}">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Your ${requestTypeLabel} Request — Ref: ${shortRef}

Hi ${displayName},

${displayCompany} has reviewed your request and was unable to fulfil it.

Reason:
${reason}

YOUR RIGHTS: If you believe this decision is incorrect, you have the right to lodge a complaint with your local data protection authority.

Please quote reference ${shortRef} in any follow-up correspondence.

---
This message was sent by ComplianceKit on behalf of ${displayCompany}
  `.trim();

  try {
    await sendEmail({
      to,
      subject: `Update on your data request — Ref: ${shortRef}`,
      html,
      text,
    });
  } catch (err) {
    console.error('[DSAR] Failed to send rejection email:', err);
  }
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
