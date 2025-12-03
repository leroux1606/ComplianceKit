import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    const { embedCode } = await params;
    const body = await request.json();
    const { visitorId, preferences } = body;

    if (!visitorId || !preferences) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find website by embed code
    const website = await db.website.findFirst({
      where: { embedCode },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404, headers: corsHeaders }
      );
    }

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
        visitorId,
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
          visitorId,
          preferences,
          ipAddress,
          userAgent,
        },
      });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Consent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}



