# ComplianceKit - Security Documentation

**Last Updated:** January 2026

This document outlines the security measures implemented in ComplianceKit to protect user data, prevent attacks, and ensure GDPR compliance.

---

## 🔒 Security Overview

ComplianceKit implements multiple layers of security protection:

1. **Authentication Security** - Secure login with account lockout
2. **Rate Limiting** - Protection against brute force and DDoS attacks
3. **Input Sanitization** - XSS and injection attack prevention
4. **CORS Protection** - Secure cross-origin resource sharing
5. **Security Headers** - Browser-level security enforcement
6. **Audit Logging** - Security event tracking and monitoring
7. **Data Protection** - Encryption and secure storage

---

## 🛡️ Implemented Security Measures

### 1. Authentication Security

#### Password Requirements
- **Minimum length:** 8 characters
- **Required:** Uppercase letter, lowercase letter, number
- **Hashing:** bcrypt with salt (10 rounds)

#### Account Lockout Protection
- **Max failed attempts:** 5 attempts per 15 minutes
- **Lockout duration:** 15 minutes after 5 failed attempts
- **Tracking:** Per email + IP address combination
- **Reset:** Automatic after lockout expires or successful login

**Location:** `lib/auth-security.ts`

#### Session Management
- **Strategy:** JWT (JSON Web Tokens)
- **Provider:** NextAuth.js 5.0
- **Storage:** Secure HTTP-only cookies
- **Timeout:** Session expires based on token expiry

**Location:** `lib/auth.ts`

---

### 2. Rate Limiting

Rate limiting protects all API endpoints from abuse:

| Endpoint Type | Limit | Window | Preset |
|--------------|-------|--------|--------|
| **Authentication** (login/signup) | 5 requests | 15 minutes | `strict` |
| **Public Forms** (DSAR, consent) | 10 requests | 5 minutes | `publicForm` |
| **API Endpoints** | 30 requests | 1 minute | `standard` |
| **Public Resources** | 100 requests | 1 minute | `lenient` |

#### Rate Limit Headers
All rate-limited responses include:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - When the limit resets
- `Retry-After` - Seconds until retry (on 429 errors)

**Location:** `lib/rate-limit.ts`

**Applied to:**
- `app/api/dsar/[embedCode]/route.ts` - DSAR submission
- `app/api/widget/[embedCode]/consent/route.ts` - Consent recording
- `lib/auth-actions.ts` - Authentication actions

---

### 3. Input Sanitization

All user inputs are sanitized to prevent XSS and injection attacks:

#### Sanitization Functions

**`sanitizeHtml(input)`**
- Escapes HTML entities: `<`, `>`, `"`, `'`, `/`
- Prevents XSS attacks
- Use for: User-generated content displayed as text

**`sanitizeText(input)`**
- Removes control characters
- Normalizes whitespace
- Limits length to 10,000 characters
- Use for: General text inputs (names, descriptions)

**`sanitizeEmail(email)`**
- Lowercase normalization
- Removes invalid characters
- Basic validation
- Use for: Email addresses

**`sanitizeUrl(url)`**
- Protocol validation (http/https only)
- URL parsing and reconstruction
- Use for: User-provided URLs

**`sanitizeRichText(html)`**
- Allows safe HTML tags only
- Removes `<script>`, `<iframe>` tags
- Strips event handlers (`onclick`, etc.)
- Removes `javascript:` protocol
- Use for: Policy documents, rich text content

**Location:** `lib/sanitize.ts`

**Applied in:**
- `lib/auth-actions.ts` - User signup/login
- `app/api/dsar/[embedCode]/route.ts` - DSAR submissions
- `app/api/widget/[embedCode]/consent/route.ts` - Consent data

---

### 4. CORS (Cross-Origin Resource Sharing)

#### Admin API Routes
- **Allowed Origin:** App domain only (`NEXT_PUBLIC_APP_URL`)
- **Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Credentials:** Allowed (cookies)

#### Widget Embed Routes
- **Allowed Origins:** App domain + registered website domains
- **Methods:** GET, POST, OPTIONS
- **Credentials:** Allowed
- **Validation:** Origin must match registered website URL

#### Public Form Routes
- **Allowed Origins:** Same as widget routes
- **Methods:** GET, POST, OPTIONS
- **Validation:** Embed code + origin matching

**Location:** `lib/cors.ts`

**Applied in:**
- `app/api/widget/[embedCode]/consent/route.ts`
- Future: All widget-related routes

---

### 5. Security Headers

Comprehensive security headers are set globally:

| Header | Value | Purpose |
|--------|-------|---------|
| **X-Frame-Options** | `SAMEORIGIN` | Prevents clickjacking |
| **X-Content-Type-Options** | `nosniff` | Prevents MIME sniffing |
| **X-XSS-Protection** | `1; mode=block` | Legacy XSS protection |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Controls referrer info |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Limits browser features |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS |
| **Content-Security-Policy** | See below | Prevents XSS, injection |

#### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://js.paystack.co;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob:;
connect-src 'self' https://accounts.google.com https://api.paystack.co;
frame-src 'self' https://accounts.google.com https://js.paystack.co;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
upgrade-insecure-requests;
```

**Location:** `next.config.ts`

---

### 6. Security Event Logging

All security-related events are logged for monitoring and audit:

#### Logged Events

**Authentication:**
- Login success/failure
- Account lockouts
- Signup events
- Logout events

**Authorization:**
- Unauthorized access attempts
- Permission denied events

**Security Violations:**
- Rate limit exceeded
- Invalid tokens
- CSRF detection
- SQL injection attempts
- XSS attempts

**Data Access:**
- Sensitive data access
- Bulk data exports
- Configuration changes

#### Log Format

```json
{
  "type": "login_failed",
  "timestamp": "2026-01-16T10:30:00.000Z",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "success": false,
  "metadata": {
    "attemptsRemaining": 3
  }
}
```

**Location:** `lib/security-log.ts`

**Alerts:** Critical events trigger console errors (TODO: integrate with alerting service)

---

### 7. Request Size Limits

**Server Actions:** Maximum 2MB payload (`next.config.ts`)

**API Routes:** Limited by Next.js defaults (4MB)

**Future Enhancement:** Add explicit body parsing limits to all API routes

---

## 🔐 Data Protection

### Password Storage
- **Algorithm:** bcrypt
- **Salt rounds:** 10
- **Never stored in plaintext**

### Session Tokens
- **Type:** JWT
- **Storage:** HTTP-only cookies
- **Flags:** Secure (HTTPS only), SameSite
- **Expiry:** Configurable (default: 30 days)

### Database Security
- **ORM:** Prisma (prevents SQL injection)
- **Connection:** SSL/TLS enforced in production
- **Credentials:** Environment variables only

### Sensitive Data Handling
- Passwords never logged
- API keys redacted in logs
- PII minimized in error messages

---

## 🚨 Vulnerability Prevention

### SQL Injection
**Protection:** Prisma ORM with parameterized queries
**Status:** ✅ Protected

### Cross-Site Scripting (XSS)
**Protection:**
- Input sanitization (`lib/sanitize.ts`)
- CSP headers
- HTML entity encoding

**Status:** ✅ Protected

### Cross-Site Request Forgery (CSRF)
**Protection:** NextAuth.js CSRF tokens
**Status:** ✅ Protected

### Brute Force Attacks
**Protection:**
- Rate limiting
- Account lockout
- Progressive delays

**Status:** ✅ Protected

### DDoS Attacks
**Protection:**
- Rate limiting
- Request size limits
- TODO: Add Cloudflare or similar CDN

**Status:** 🟡 Partially Protected

### Clickjacking
**Protection:** X-Frame-Options header
**Status:** ✅ Protected

### Man-in-the-Middle (MITM)
**Protection:**
- HSTS header
- HTTPS enforcement
- Secure cookie flags

**Status:** ✅ Protected (in production with HTTPS)

---

## 📋 Security Checklist for Deployment

Before deploying to production:

### Environment Variables
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Use production database with SSL
- [ ] Never commit `.env` files

### HTTPS Configuration
- [ ] Enable HTTPS on hosting platform
- [ ] Configure SSL certificate
- [ ] Redirect HTTP to HTTPS
- [ ] Verify HSTS header works

### Database
- [ ] Enable SSL/TLS connections
- [ ] Use connection pooling
- [ ] Set up automated backups
- [ ] Limit database user permissions

### API Keys & Secrets
- [ ] Use production PayStack keys
- [ ] Rotate secrets regularly
- [ ] Store in secure environment variables
- [ ] Never expose in client-side code

### OAuth Configuration
- [ ] Update Google OAuth redirect URIs
- [ ] Verify all OAuth callbacks work
- [ ] Test authentication flow end-to-end

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Review security logs regularly
- [ ] Set up alerts for security events

### Additional Hardening
- [ ] Add Cloudflare or CDN for DDoS protection
- [ ] Implement API key rotation schedule
- [ ] Add email verification flow
- [ ] Set up security headers testing (securityheaders.com)
- [ ] Run security audit (npm audit)
- [ ] Consider penetration testing for launch

---

## 🔧 Security Configuration Files

| File | Purpose |
|------|---------|
| `lib/rate-limit.ts` | Rate limiting implementation |
| `lib/auth-security.ts` | Account lockout system |
| `lib/sanitize.ts` | Input sanitization utilities |
| `lib/cors.ts` | CORS configuration |
| `lib/security-log.ts` | Security event logging |
| `lib/auth.ts` | NextAuth configuration |
| `lib/auth-actions.ts` | Authentication actions with security |
| `next.config.ts` | Security headers configuration |
| `middleware.ts` | Route protection middleware |

---

## 🐛 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@compliancekit.com (TODO: set up this email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and provide updates as we address the issue.

---

## 📚 Security Best Practices for Developers

### When Adding New Features:

1. **Always sanitize user input**
   ```typescript
   import { sanitizeInput, sanitizeEmail } from "@/lib/sanitize";
   const safe = sanitizeInput(userInput);
   ```

2. **Add rate limiting to public endpoints**
   ```typescript
   export const POST = withRateLimit(handler, RateLimitPresets.standard);
   ```

3. **Validate all inputs with Zod**
   ```typescript
   const schema = z.object({ ... });
   const validated = schema.safeParse(input);
   ```

4. **Log security events**
   ```typescript
   import { logSecurityEvent, SecurityEventType } from "@/lib/security-log";
   logSecurityEvent({ type: SecurityEventType.UNAUTHORIZED_ACCESS, ... });
   ```

5. **Use CORS helpers for widget routes**
   ```typescript
   import { getWidgetCorsHeaders } from "@/lib/cors";
   const headers = getWidgetCorsHeaders(request, websiteUrl);
   ```

6. **Never log sensitive data**
   ```typescript
   import { sanitizeForLog } from "@/lib/security-log";
   console.log(sanitizeForLog(data)); // Redacts passwords, tokens
   ```

---

## 🔄 Future Security Enhancements

Priority order for additional security features:

1. **Email Verification** - Verify email addresses on signup
2. **2FA/MFA** - Two-factor authentication for admin accounts
3. **IP Whitelisting** - For admin access (optional)
4. **API Key Management** - For programmatic access
5. **Webhook Signature Verification** - Already done for PayStack
6. **File Upload Security** - If/when file uploads are added
7. **Redis Rate Limiting** - For multi-server deployments
8. **Security Headers Testing** - Automated CI/CD checks
9. **Dependency Scanning** - Automated vulnerability scanning
10. **Penetration Testing** - Professional security audit

---

## ✅ Security Compliance

ComplianceKit meets security requirements for:

- ✅ **GDPR** - Data protection and privacy
- ✅ **OWASP Top 10** - Common vulnerability protection
- 🟡 **SOC 2** - Requires additional monitoring (partial)
- 🟡 **ISO 27001** - Requires full ISMS (partial)

---

## 📖 Additional Resources

- [OWASP Security Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Prisma Security Guide](https://www.prisma.io/docs/guides/database/advanced-database-tasks/data-validation)

---

**ComplianceKit Security Team**
Last Review: January 2026
Next Review: Quarterly
