# Session Security Improvements

## Overview

Enhanced session management for ComplianceKit with security-focused authentication controls.

## Security Features Implemented

### 1. **Session Duration Control**

#### Without "Remember Me" (Default - More Secure)
- **Session expires after**: 24 hours from login
- **Cookie behavior**: Persists for up to 24 hours but session is validated server-side
- **Use case**: Standard security for compliance applications

#### With "Remember Me" (User Choice)
- **Session expires after**: 30 days from login
- **Cookie behavior**: Persists for 30 days
- **Use case**: User convenience on trusted devices

### 2. **Idle Timeout Protection**

- **Timeout**: 30 minutes of inactivity
- **Behavior**: Session expires if no activity for 30 minutes, regardless of "Remember Me" setting
- **Security benefit**: Protects against unauthorized access on unattended devices

### 3. **Cookie Security**

- `httpOnly: true` - Prevents XSS attacks from accessing session cookies
- `sameSite: 'lax'` - Protects against CSRF attacks
- `secure: true` (in production) - Only sent over HTTPS
- `maxAge: 30 days` - Cookie persists but session validation is server-side

### 4. **Activity Tracking**

- Tracks last activity timestamp on each request
- Tracks initial login time
- Validates session age and idle time on every request

## User Experience

### Sign In Flow

1. User enters email and password
2. **Optional**: User checks "Remember me for 30 days"
3. If unchecked: session lasts 24 hours
4. If checked: session lasts 30 days
5. Both options: session expires after 30 minutes of inactivity

### When Sessions Expire

Users are redirected to `/sign-in` when:
- Session exceeds duration limit (24 hours or 30 days)
- User is inactive for more than 30 minutes
- Session token is invalid or tampered with

## Security Logging

All authentication events are logged with:
- Timestamp
- User email
- IP address
- User agent
- Remember me preference
- Success/failure status

## Best Practices for ComplianceKit Users

### For Maximum Security (Recommended)
- **Don't** check "Remember me"
- Sign out when finished working
- Use on trusted devices only

### For Convenience (Less Secure)
- Check "Remember me" on personal/trusted devices only
- **Never** check "Remember me" on shared/public computers
- Still sign out manually on sensitive operations

## Configuration

### Adjust Session Duration

Edit `lib/auth.ts`:

```typescript
// Default session (without remember me)
const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

// Remember me session
const sessionDuration = 30 * 24 * 60 * 60 * 1000; // 30 days
```

### Adjust Idle Timeout

Edit `lib/auth.ts`:

```typescript
const idleTimeout = 30 * 60 * 1000; // 30 minutes
```

## Technical Implementation

### JWT Token Structure

```typescript
{
  sub: string;           // User ID
  loginTime: number;     // Timestamp of login
  lastActivity: number;  // Timestamp of last activity
  rememberMe: boolean;   // User's preference
}
```

### Session Validation Flow

```
Request → Check JWT exists → Validate JWT signature
  ↓
Check idle timeout (lastActivity)
  ↓
Check session duration (loginTime + rememberMe preference)
  ↓
Update lastActivity timestamp
  ↓
Allow/Deny request
```

## Compliance Considerations

- **GDPR**: Session data is minimal and necessary for authentication
- **Data retention**: Sessions auto-expire; no persistent session data stored
- **User control**: "Remember me" gives users choice over session duration
- **Audit trail**: All auth events logged for compliance requirements
- **Security**: Follows OWASP session management best practices

## Migration Notes

### From Previous Setup
- Old sessions will be invalidated on first request after upgrade
- Users will need to sign in again
- No database migration required (JWT-based sessions)

## Testing Recommendations

1. **Test session expiry**:
   - Login without "remember me", wait 24 hours
   - Login with "remember me", wait 30 days

2. **Test idle timeout**:
   - Login, wait 30 minutes without activity
   - Verify session expires

3. **Test activity tracking**:
   - Login, make requests within 30 minutes
   - Verify session stays active

4. **Test on multiple devices**:
   - Verify independent sessions
   - Verify "remember me" per device
