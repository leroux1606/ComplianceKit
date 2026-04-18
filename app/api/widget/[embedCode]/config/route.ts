import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWidgetCorsHeaders } from "@/lib/cors";
import { logger } from "@/lib/logger";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: getWidgetCorsHeaders(request) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    const { embedCode } = await params;

    const website = await db.website.findFirst({
      where: { embedCode },
      include: {
        bannerConfig: true,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404, headers: getWidgetCorsHeaders(request) }
      );
    }

    const corsHeaders = getWidgetCorsHeaders(request, website.url);

    const config = website.bannerConfig || {
      theme: "light",
      position: "bottom",
      primaryColor: "#0f172a",
      textColor: "#ffffff",
      buttonStyle: "rounded",
      animation: "slide",
      customCss: null,
      privacyPolicyUrl: null,
      cookiePolicyUrl: null,
      consentModeV2: true,
      withdrawalButtonPosition: "bottom-right",
    };

    return NextResponse.json(
      {
        websiteId: website.id,
        privacyPolicyUrl: config.privacyPolicyUrl ?? null,
        cookiePolicyUrl: config.cookiePolicyUrl ?? null,
        consentModeV2: config.consentModeV2 ?? true,
        config: {
          theme: config.theme,
          position: config.position,
          primaryColor: config.primaryColor,
          textColor: config.textColor,
          buttonStyle: config.buttonStyle,
          animation: config.animation,
          customCss: config.customCss,
          withdrawalButtonPosition: config.withdrawalButtonPosition ?? "bottom-right",
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error("widget.config.error", {}, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getWidgetCorsHeaders(request) }
    );
  }
}



