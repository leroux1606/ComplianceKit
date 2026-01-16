/**
 * Security Event Logging
 * Logs security-related events for monitoring and audit
 */

export enum SecurityEventType {
  // Authentication
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILED = "login_failed",
  LOGIN_LOCKED = "login_locked",
  LOGOUT = "logout",
  SIGNUP = "signup",
  PASSWORD_CHANGED = "password_changed",

  // Authorization
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  PERMISSION_DENIED = "permission_denied",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",

  // Suspicious Activity
  INVALID_TOKEN = "invalid_token",
  CSRF_DETECTED = "csrf_detected",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",
  XSS_ATTEMPT = "xss_attempt",

  // Data Access
  SENSITIVE_DATA_ACCESS = "sensitive_data_access",
  BULK_DATA_EXPORT = "bulk_data_export",

  // Configuration Changes
  SECURITY_SETTINGS_CHANGED = "security_settings_changed",
  USER_ROLE_CHANGED = "user_role_changed",
  PROFILE_UPDATED = "profile_updated",
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log security event
 * In production, send to logging service (Datadog, Sentry, etc.)
 */
export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Console log for development
  if (process.env.NODE_ENV === "development") {
    console.log("[SECURITY]", JSON.stringify(fullEvent, null, 2));
  }

  // In production, send to logging service
  // Example: sendToDatadog(fullEvent);
  // Example: sendToSentry(fullEvent);

  // For now, just log critical events
  if (!event.success && shouldAlert(event.type)) {
    console.error("[SECURITY ALERT]", JSON.stringify(fullEvent, null, 2));
    // TODO: Send alert notification (email, Slack, PagerDuty)
  }
}

/**
 * Determine if event type should trigger alert
 */
function shouldAlert(type: SecurityEventType): boolean {
  const alertTypes = [
    SecurityEventType.LOGIN_LOCKED,
    SecurityEventType.CSRF_DETECTED,
    SecurityEventType.SQL_INJECTION_ATTEMPT,
    SecurityEventType.XSS_ATTEMPT,
    SecurityEventType.UNAUTHORIZED_ACCESS,
  ];

  return alertTypes.includes(type);
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  type: SecurityEventType,
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  logSecurityEvent({
    type,
    email,
    ipAddress,
    userAgent,
    success,
    metadata,
  });
}

/**
 * Log rate limit event
 */
export function logRateLimitEvent(
  ipAddress: string,
  resource: string,
  userAgent?: string
): void {
  logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    ipAddress,
    userAgent,
    resource,
    success: false,
    message: "Rate limit exceeded",
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  type: SecurityEventType,
  ipAddress: string,
  resource: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  logSecurityEvent({
    type,
    ipAddress,
    resource,
    success: false,
    message,
    metadata,
  });
}

/**
 * Log data access event
 */
export function logDataAccess(
  userId: string,
  resource: string,
  action: string,
  ipAddress?: string,
  success: boolean = true
): void {
  logSecurityEvent({
    type: SecurityEventType.SENSITIVE_DATA_ACCESS,
    userId,
    resource,
    action,
    ipAddress,
    success,
  });
}

/**
 * Sanitize sensitive data from logs
 * Never log passwords, tokens, or PII
 */
export function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "apiKey",
    "creditCard",
    "ssn",
    "authToken",
    "sessionToken",
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Check if key contains sensitive data
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
