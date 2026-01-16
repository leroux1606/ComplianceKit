/**
 * Authentication Security
 * Protects against brute force attacks with login attempt tracking
 */

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// In-memory store for login attempts (use Redis in production)
const loginAttempts = new Map<string, LoginAttempt>();

// Configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    // Remove if lockout expired and no recent attempts
    if (attempt.lockedUntil && now > attempt.lockedUntil && now - attempt.lastAttempt > ATTEMPT_WINDOW) {
      loginAttempts.delete(key);
    }
    // Remove if no lockout and attempts are old
    if (!attempt.lockedUntil && now - attempt.lastAttempt > ATTEMPT_WINDOW) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Get identifier for login attempt tracking
 * Uses combination of email and IP for better security
 */
function getIdentifier(email: string, ipAddress: string): string {
  return `${email.toLowerCase()}:${ipAddress}`;
}

/**
 * Check if account is locked
 * @param email User email
 * @param ipAddress Request IP address
 * @returns Object with locked status and time remaining
 */
export function isAccountLocked(email: string, ipAddress: string): {
  locked: boolean;
  remainingTime?: number;
  attemptsRemaining?: number;
} {
  const identifier = getIdentifier(email, ipAddress);
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
  }

  const now = Date.now();

  // Check if locked
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const remainingTime = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { locked: true, remainingTime };
  }

  // Check if attempt window expired
  if (now - attempt.firstAttempt > ATTEMPT_WINDOW) {
    loginAttempts.delete(identifier);
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
  }

  // Not locked, return remaining attempts
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempt.count);
  return { locked: false, attemptsRemaining };
}

/**
 * Record failed login attempt
 * @param email User email
 * @param ipAddress Request IP address
 * @returns Updated lock status
 */
export function recordFailedAttempt(email: string, ipAddress: string): {
  locked: boolean;
  remainingTime?: number;
  attemptsRemaining: number;
} {
  const identifier = getIdentifier(email, ipAddress);
  const now = Date.now();

  let attempt = loginAttempts.get(identifier);

  if (!attempt || now - attempt.firstAttempt > ATTEMPT_WINDOW) {
    // First attempt or window expired, create new record
    attempt = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    loginAttempts.set(identifier, attempt);
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS - 1 };
  }

  // Increment attempt count
  attempt.count++;
  attempt.lastAttempt = now;

  // Check if should lock
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(identifier, attempt);

    const remainingTime = Math.ceil(LOCKOUT_DURATION / 1000);
    return { locked: true, remainingTime, attemptsRemaining: 0 };
  }

  loginAttempts.set(identifier, attempt);
  const attemptsRemaining = MAX_ATTEMPTS - attempt.count;
  return { locked: false, attemptsRemaining };
}

/**
 * Record successful login (reset attempts)
 * @param email User email
 * @param ipAddress Request IP address
 */
export function recordSuccessfulLogin(email: string, ipAddress: string): void {
  const identifier = getIdentifier(email, ipAddress);
  loginAttempts.delete(identifier);
}

/**
 * Manually unlock account (admin override)
 * @param email User email
 * @param ipAddress Request IP address
 */
export function unlockAccount(email: string, ipAddress: string): void {
  const identifier = getIdentifier(email, ipAddress);
  loginAttempts.delete(identifier);
}

/**
 * Get login attempt info for monitoring
 * @param email User email
 * @param ipAddress Request IP address
 */
export function getLoginAttemptInfo(email: string, ipAddress: string): LoginAttempt | null {
  const identifier = getIdentifier(email, ipAddress);
  return loginAttempts.get(identifier) || null;
}

/**
 * Get all active lockouts (for admin monitoring)
 */
export function getActiveLockouts(): Array<{
  identifier: string;
  count: number;
  lockedUntil: number;
}> {
  const now = Date.now();
  const lockouts: Array<{
    identifier: string;
    count: number;
    lockedUntil: number;
  }> = [];

  for (const [identifier, attempt] of loginAttempts.entries()) {
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      lockouts.push({
        identifier,
        count: attempt.count,
        lockedUntil: attempt.lockedUntil,
      });
    }
  }

  return lockouts;
}
