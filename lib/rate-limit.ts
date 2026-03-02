/**
 * Rate Limiting Utility — database-backed
 * Uses PostgreSQL via Prisma so limits are enforced across all serverless instances.
 * Previously in-memory Maps were silently bypassed on Vercel (each invocation = fresh state).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
      // Fail open — don't block requests if the rate limit table is unavailable
      console.error("Rate limit DB error:", err);
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
