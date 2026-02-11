# Password Reset Feature

## Overview

Complete password reset functionality for ComplianceKit users who have forgotten their passwords.

## Features Implemented

### 1. **Forgot Password Flow**
- User enters their email address
- System sends a password reset email
- Email contains a secure one-time link
- Link expires in 1 hour

### 2. **Reset Password Flow**
- User clicks link in email
- System verifies the token is valid and not expired
- User enters new password (minimum 8 characters)
- Password is securely hashed and updated
- Token is deleted after use (one-time use)

### 3. **Security Features**

#### Email Enumeration Protection
- Always returns success message whether email exists or not
- Prevents attackers from discovering valid email addresses
- Adds artificial delay for non-existent emails to prevent timing attacks

#### Secure Token Generation
- Uses cryptographically secure random tokens (32 bytes)
- Tokens are hashed before storage (SHA-256)
- Original token sent in email, hashed version stored in database
- Tokens expire after 1 hour

#### OAuth Account Protection
- Users who signed up with Google cannot reset password
- They don't have a password to reset
- System still returns success message (enumeration protection)

#### Password Requirements
- Minimum 8 characters (enforced)
- Securely hashed with bcrypt (10 rounds)

## User Flow

### Forgot Password
1. User clicks "Forgot password?" on sign-in page
2. User enters email address
3. System sends reset email if account exists
4. User sees success message (always, even if email doesn't exist)

### Reset Password
1. User clicks link in email
2. System verifies token is valid and not expired
3. User enters new password twice (must match)
4. Password is updated
5. User redirected to sign-in page
6. User signs in with new password

## Email Configuration

### Development Mode (Default)
- Emails are logged to console instead of sent
- No API key required
- Reset links are fully functional
- Check terminal output for reset links

### Production Mode (Resend)
Add to your `.env.local`:

```bash
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="ComplianceKit <noreply@yourdomain.com>"
NEXT_PUBLIC_SUPPORT_EMAIL="support@yourdomain.com"
```

#### Get Resend API Key
1. Sign up at https://resend.com
2. Verify your domain or use Resend's test domain
3. Generate an API key
4. Add to `.env.local`

#### Domain Setup (Production)
1. Add your domain in Resend dashboard
2. Add DNS records (DKIM, SPF, DMARC)
3. Verify domain
4. Update `EMAIL_FROM` with your domain

## Testing

### Test in Development

1. **Request Password Reset**
   ```
   1. Go to http://localhost:3000/sign-in
   2. Click "Forgot password?"
   3. Enter your email
   4. Check terminal for email output
   5. Copy the reset link from console
   ```

2. **Reset Password**
   ```
   1. Paste reset link in browser
   2. Enter new password (min 8 chars)
   3. Confirm password
   4. Click "Reset Password"
   5. Sign in with new password
   ```

### Test Token Expiry
```bash
# The token expires in 1 hour
# To test expiry, manually update the database:

# Connect to your database and run:
UPDATE verification_tokens 
SET expires = NOW() - INTERVAL '1 hour' 
WHERE identifier = 'user@example.com';

# Then try to use the reset link - should fail
```

### Test Invalid Token
```
1. Request a password reset
2. Use the reset link
3. Try to use the same link again
   → Should fail (token deleted after use)
```

## Database Schema

Uses the existing `VerificationToken` model:

```prisma
model VerificationToken {
  identifier String   // User's email
  token      String   @unique // Hashed reset token
  expires    DateTime // Token expiry (1 hour)
  
  @@unique([identifier, token])
}
```

## API Endpoints

### Server Actions

#### `requestPasswordReset(email: string)`
- Generates reset token
- Sends reset email
- Returns success message

#### `verifyResetToken(token: string)`
- Validates token
- Checks expiry
- Returns email if valid

#### `resetPassword(token: string, newPassword: string)`
- Verifies token
- Validates password strength
- Updates user password
- Deletes used token

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| Forgot Password | `/forgot-password` | Request reset link |
| Reset Password | `/reset-password?token=xxx` | Set new password |

## Security Considerations

### ✅ Implemented Protections

- **Token Security**: 32-byte cryptographically random tokens
- **Token Hashing**: Tokens hashed before storage (SHA-256)
- **Token Expiry**: 1 hour expiration
- **One-Time Use**: Tokens deleted after use
- **Email Enumeration**: Protection via consistent responses
- **Timing Attacks**: Protection via artificial delays
- **Password Hashing**: bcrypt with 10 rounds
- **OAuth Protection**: No reset for OAuth-only accounts

### ⚠️ Additional Recommendations

1. **Rate Limiting**: Add rate limiting to prevent abuse
   - Limit password reset requests per email (e.g., 3 per hour)
   - Limit requests per IP address

2. **HTTPS Only**: In production, ensure HTTPS for all pages
   - Reset links should only work over HTTPS

3. **Email Verification**: Consider requiring email verification before allowing password reset

4. **Security Logging**: Log all password reset attempts
   - Track failed attempts
   - Alert on suspicious activity

5. **Multi-Factor Authentication**: Consider adding MFA for enhanced security

## Monitoring

### Logs to Watch

In development, check console for:
```
📧 EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Subject: Reset Your Password - ComplianceKit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

In production, monitor:
- Email delivery rates
- Failed reset attempts
- Token expiry patterns
- Unusual activity (many resets from same IP)

## Troubleshooting

### Email Not Received

**Development:**
- Check terminal output for email content
- Copy reset link directly from console

**Production:**
- Check Resend dashboard for delivery status
- Verify domain DNS records
- Check spam folder
- Verify email address is correct

### "Invalid or Expired Reset Link"

**Causes:**
- Token expired (> 1 hour old)
- Token already used
- Token doesn't exist
- Token was manually deleted

**Solution:**
- Request a new password reset link

### "Password Must Be at Least 8 Characters"

**Solution:**
- Use a stronger password
- Minimum 8 characters required

## Future Enhancements

- [ ] Add rate limiting
- [ ] Add password strength indicator
- [ ] Add "recently used passwords" check
- [ ] Add email verification before reset
- [ ] Add security question option
- [ ] Add SMS-based reset option
- [ ] Add audit trail for password changes
- [ ] Add notification email after password change
- [ ] Add "Was this you?" security check

## Support

For issues with password reset:
1. Check development console logs
2. Verify email configuration
3. Test token generation/validation
4. Check database for verification tokens
5. Review security logs for failed attempts
