import { NextResponse } from "next/server";

/**
 * Lightweight health check endpoint for uptime monitors.
 * Does NOT hit the database — just confirms the Next.js runtime is alive.
 * Uptime monitors should call this every 5 minutes.
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        // Don't let CDN or browser cache a health response
        "Cache-Control": "no-store",
      },
    }
  );
}
