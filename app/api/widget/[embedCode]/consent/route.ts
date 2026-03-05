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
    const { visitorId, preferences, consentMethod } = body;

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

    // Validate consentMethod — only accept known values
    const validMethods = ["accept_all", "reject_all", "custom"] as const;
    type ConsentMethod = typeof validMethods[number];
    const sanitizedMethod: ConsentMethod | "unknown" =
      validMethods.includes(consentMethod) ? consentMethod : "unknown";

    // Get IP and User Agent
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Resolve banner config version and active policy version for audit trail (A3)
    const [bannerConfig, activePolicy] = await Promise.all([
      db.bannerConfig.findUnique({
        where: { websiteId: website.id },
        select: { updatedAt: true },
      }),
      db.policy.findFirst({
        where: { websiteId: website.id, isActive: true, type: "privacy_policy" },
        select: { version: true },
        orderBy: { generatedAt: "desc" },
      }),
    ]);
    const bannerConfigVersion = bannerConfig?.updatedAt.toISOString() ?? null;
    const policyVersion = activePolicy?.version ?? null;

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
          consentMethod: sanitizedMethod,
          bannerConfigVersion,
          policyVersion,
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
          consentMethod: sanitizedMethod,
          bannerConfigVersion,
          policyVersion,
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



