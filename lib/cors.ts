/**
 * CORS Configuration and Validation
 * Provides secure CORS headers for API routes
 */

import { NextRequest } from "next/server";

/**
 * Check if origin is allowed
 * For widget embeds, we need to allow customer websites
 * For other APIs, restrict to app domain only
 */
export function isAllowedOrigin(origin: string | null, websiteUrl?: string): boolean {
  if (!origin) return false;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Always allow same origin (our app)
  if (origin === appUrl) return true;

  // For widget routes, allow the registered website's origin
  if (websiteUrl) {
    try {
      const websiteOrigin = new URL(websiteUrl).origin;
      if (origin === websiteOrigin) return true;

      // Also allow www variant
      const wwwVariant = websiteOrigin.replace("://", "://www.");
      const nonWwwVariant = websiteOrigin.replace("://www.", "://");
      if (origin === wwwVariant || origin === nonWwwVariant) return true;
    } catch {
      // Invalid website URL
      return false;
    }
  }

  // In development, allow localhost on any port
  if (process.env.NODE_ENV === "development") {
    try {
      const url = new URL(origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get CORS headers for widget routes (embed scripts, consent API)
 * These need to work cross-origin for customer websites
 */
export function getWidgetCorsHeaders(request: NextRequest, websiteUrl?: string): Record<string, string> {
  const origin = request.headers.get("origin");

  if (origin && isAllowedOrigin(origin, websiteUrl)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // 24 hours
    };
  }

  // If origin not allowed, return restrictive headers
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/**
 * Get CORS headers for API routes (admin APIs)
 * These should only work from our app domain
 */
export function getApiCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (origin && isAllowedOrigin(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }

  // Default to app URL only
  return {
    "Access-Control-Allow-Origin": appUrl,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

/**
 * Get CORS headers for public form routes (DSAR submission)
 * Allow embedding in iframes but validate origin
 */
export function getPublicFormCorsHeaders(request: NextRequest, websiteUrl?: string): Record<string, string> {
  return getWidgetCorsHeaders(request, websiteUrl);
}
