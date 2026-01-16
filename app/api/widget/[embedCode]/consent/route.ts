import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWidgetCorsHeaders } from "@/lib/cors";
import { withRateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitize";

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  const { embedCode } = await params;

  // Get website to validate origin
  const website = await db.website.findFirst({
    where: { embedCode },
    select: { url: true },
  });

  const corsHeaders = getWidgetCorsHeaders(request, website?.url);
  return new NextResponse(null, { headers: corsHeaders });
}

export const POST = withRateLimit(async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    const { embedCode } = await params;
    const body = await request.json();
    const { visitorId, preferences } = body;

    // Find website by embed code first (needed for CORS validation)
    const website = await db.website.findFirst({
      where: { embedCode },
    });

    if (!website) {
      const corsHeaders = getWidgetCorsHeaders(request);
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Get CORS headers with website URL for validation
    const corsHeaders = getWidgetCorsHeaders(request, website.url);

    if (!visitorId || !preferences) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanitize visitor ID
    const sanitizedVisitorId = sanitizeInput(visitorId).substring(0, 100);

    // Get IP and User Agent
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Upsert consent
    const existingConsent = await db.consent.findFirst({
      where: {
        websiteId: website.id,
        visitorId: sanitizedVisitorId,
      },
    });

    if (existingConsent) {
      await db.consent.update({
        where: { id: existingConsent.id },
        data: {
          preferences,
          ipAddress,
          userAgent,
        },
      });
    } else {
      await db.consent.create({
        data: {
          websiteId: website.id,
          visitorId: sanitizedVisitorId,
          preferences,
          ipAddress,
          userAgent,
        },
      });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Consent error:", error);
    const corsHeaders = getWidgetCorsHeaders(request);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}, RateLimitPresets.lenient);



