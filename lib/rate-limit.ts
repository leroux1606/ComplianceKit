/**
 * Rate Limiting Utility — database-backed with in-memory fallback
 * Primary: PostgreSQL via Prisma, enforced across all serverless instances.
 * Fallback: per-instance in-memory window used when the DB is unavailable.
 *   Each serverless instance enforces its own conservative limit independently.
 *   This caps blast radius during DB outages without requiring shared state.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logSecurityEvent, SecurityEventType } from "@/lib/security-log";

// ── In-memory fallback ──────────────────────────────────────────────────────
// Conservative limits: lower than normal presets so the fallback is tight.
const FALLBACK_WINDOW_MS = 60_000;  // 1 minute
const FALLBACK_MAX_REQUESTS = 20;   // per instance per key

const memoryFallback = new Map<string, { count: number; resetAt: number }>();

function checkMemoryFallback(key: string): boolean {
  const now = Date.now();

  // Probabilistic cleanup to prevent unbounded memory growth on long-lived instances
  if (memoryFallback.size > 500) {
    for (const [k, v] of memoryFallback) {
      if (v.resetAt < now) memoryFallback.delete(k);
    }
  }

  const entry = memoryFallback.get(key);
  if (!entry || entry.resetAt < now) {
    memoryFallback.set(key, { count: 1, resetAt: now + FALLBACK_WINDOW_MS });
    return true;
  }

  entry.count += 1;
  return entry.count <= FALLBACK_MAX_REQUESTS;
}
// ───────────────────────────────────────────────────────────────────────────

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

function getIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0] || realIp || "unknown";
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const identifier = getIdentifier(request);
    const key = `${identifier}:${request.nextUrl.pathname}`;
    const now = new Date();
    const resetAt = new Date(now.getTime() + config.windowMs);

    try {
      // Upsert: create or increment atomically
      const record = await db.rateLimitRecord.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: {
          count: {
            // Reset counter if the existing window has expired
            increment: 1,
          },
        },
      });

      // If the window has expired, reset the record
      if (record.resetAt < now) {
        await db.rateLimitRecord.update({
          where: { key },
          data: { count: 1, resetAt },
        });
        return null;
      }

      if (record.count > config.maxRequests) {
        const resetIn = Math.ceil((record.resetAt.getTime() - now.getTime()) / 1000);
        return NextResponse.json(
          {
            error: "Too many requests",
            message: `Rate limit exceeded. Please try again in ${resetIn} seconds.`,
            retryAfter: resetIn,
          },
          {
            status: 429,
            headers: {
              "Retry-After": resetIn.toString(),
              "X-RateLimit-Limit": config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": record.resetAt.toISOString(),
            },
          }
        );
      }

      return null;
    } catch (err) {
      // DB unavailable — log a critical security alert and apply in-memory fallback.
      // The fallback is intentionally conservative (20 req/min per instance) to cap
      // blast radius without requiring shared state.
      console.error("Rate limit DB error (switched to in-memory fallback):", err);

      logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_DB_ERROR,
        ipAddress: identifier,
        resource: request.nextUrl.pathname,
        success: false,
        message: "Rate limit DB unavailable — in-memory fallback active",
        metadata: { error: (err as Error).message },
      });

      const allowed = checkMemoryFallback(key);
      if (!allowed) {
        return NextResponse.json(
          { error: "Too many requests", message: "Rate limit exceeded." },
          { status: 429 }
        );
      }
      return null;
    }
  };
}

export const RateLimitPresets = {
  strict:     { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  standard:   { windowMs: 60 * 1000,      maxRequests: 30 },
  lenient:    { windowMs: 60 * 1000,      maxRequests: 100 },
  publicForm: { windowMs: 5 * 60 * 1000,  maxRequests: 10 },
};

export function withRateLimit<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: RateLimitConfig = RateLimitPresets.standard
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimit(config)(request);
    if (rateLimitResponse) return rateLimitResponse;
    return handler(request, ...args);
  };
}
