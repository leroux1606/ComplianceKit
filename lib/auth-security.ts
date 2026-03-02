/**
 * Authentication Security — database-backed brute-force protection.
 * The previous in-memory Map was silently reset on every serverless cold-start,
 * making the 5-attempt lockout ineffective on Vercel.
 */

import { db } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms
const ATTEMPT_WINDOW  = 15 * 60 * 1000;

function getIdentifier(email: string, ipAddress: string): string {
  return `${email.toLowerCase()}:${ipAddress}`;
}

export async function isAccountLocked(
  email: string,
  ipAddress: string
): Promise<{ locked: boolean; remainingTime?: number; attemptsRemaining?: number }> {
  const identifier = getIdentifier(email, ipAddress);

  try {
    const record = await db.loginAttemptRecord.findUnique({ where: { identifier } });

    if (!record) return { locked: false, attemptsRemaining: MAX_ATTEMPTS };

    const now = Date.now();

    if (record.lockedUntil && record.lockedUntil.getTime() > now) {
      return {
        locked: true,
        remainingTime: Math.ceil((record.lockedUntil.getTime() - now) / 1000),
      };
    }

    // Attempt window expired — clean up stale record
    if (now - record.firstAttempt.getTime() > ATTEMPT_WINDOW) {
      await db.loginAttemptRecord.delete({ where: { identifier } }).catch(() => {});
      return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
    }

    return { locked: false, attemptsRemaining: Math.max(0, MAX_ATTEMPTS - record.count) };
  } catch {
    // Fail open so a DB outage doesn't lock all users out
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS };
  }
}

export async function recordFailedAttempt(
  email: string,
  ipAddress: string
): Promise<{ locked: boolean; remainingTime?: number; attemptsRemaining: number }> {
  const identifier = getIdentifier(email, ipAddress);
  const now = new Date();

  try {
    const existing = await db.loginAttemptRecord.findUnique({ where: { identifier } });

    if (!existing || Date.now() - existing.firstAttempt.getTime() > ATTEMPT_WINDOW) {
      await db.loginAttemptRecord.upsert({
        where: { identifier },
        create: { identifier, count: 1, firstAttempt: now, lastAttempt: now },
        update: { count: 1, firstAttempt: now, lastAttempt: now, lockedUntil: null },
      });
      return { locked: false, attemptsRemaining: MAX_ATTEMPTS - 1 };
    }

    const newCount = existing.count + 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION)
      : null;

    await db.loginAttemptRecord.update({
      where: { identifier },
      data: { count: newCount, lastAttempt: now, lockedUntil },
    });

    if (lockedUntil) {
      return {
        locked: true,
        remainingTime: Math.ceil(LOCKOUT_DURATION / 1000),
        attemptsRemaining: 0,
      };
    }

    return { locked: false, attemptsRemaining: MAX_ATTEMPTS - newCount };
  } catch {
    return { locked: false, attemptsRemaining: 0 };
  }
}

export async function recordSuccessfulLogin(email: string, ipAddress: string): Promise<void> {
  const identifier = getIdentifier(email, ipAddress);
  await db.loginAttemptRecord.delete({ where: { identifier } }).catch(() => {});
}

export async function unlockAccount(email: string, ipAddress: string): Promise<void> {
  const identifier = getIdentifier(email, ipAddress);
  await db.loginAttemptRecord.delete({ where: { identifier } }).catch(() => {});
}
