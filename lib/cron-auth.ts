import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * Verify an incoming cron request against CRON_SECRET using a
 * timing-safe comparison to prevent secret-oracle timing attacks.
 *
 * Returns a 401/500 NextResponse on failure, or null if the request is valid.
 */
export function verifyCronRequest(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET is not configured");
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${cronSecret}`;

  let authorized = false;
  try {
    // timingSafeEqual requires equal-length buffers
    const a = Buffer.from(authHeader);
    const b = Buffer.from(expected);
    authorized = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    authorized = false;
  }

  if (!authorized) {
    console.warn("[Cron] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // valid
}
