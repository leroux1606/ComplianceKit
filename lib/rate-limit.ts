/**
 * Rate Limiting Utility
 * Protects API routes from abuse and DDoS attacks
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// In-memory store for rate limiting (use Redis in production for multiple servers)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get identifier for rate limiting (IP address)
 */
function getIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";

  return ip;
}

/**
 * Rate limit middleware
 * @param config Rate limit configuration
 * @returns Middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const identifier = getIdentifier(request);
    const key = `${identifier}:${request.nextUrl.pathname}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    // Create new record if doesn't exist or expired
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, record);
      return null; // Allow request
    }

    // Increment count
    record.count++;

    // Check if exceeded limit
    if (record.count > config.maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000);

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
            "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // Update store
    rateLimitStore.set(key, record);
    return null; // Allow request
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Strict: For sensitive operations (login, registration)
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes

  // Standard: For regular API endpoints
  standard: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute

  // Lenient: For public endpoints
  lenient: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute

  // Public forms: For DSAR, consent submissions
  publicForm: { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 requests per 5 minutes
};

/**
 * Apply rate limiting to API route handler
 * @param handler Original route handler
 * @param config Rate limit configuration
 * @returns Protected route handler
 */
export function withRateLimit<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: RateLimitConfig = RateLimitPresets.standard
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimit(config)(request);

    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    return handler(request, ...args);
  };
}
