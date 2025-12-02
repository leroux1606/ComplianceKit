import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
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
        { status: 404, headers: corsHeaders }
      );
    }

    const config = website.bannerConfig || {
      theme: "light",
      position: "bottom",
      primaryColor: "#0f172a",
      textColor: "#ffffff",
      buttonStyle: "rounded",
      animation: "slide",
      customCss: null,
    };

    return NextResponse.json(
      {
        websiteId: website.id,
        config: {
          theme: config.theme,
          position: config.position,
          primaryColor: config.primaryColor,
          textColor: config.textColor,
          buttonStyle: config.buttonStyle,
          animation: config.animation,
          customCss: config.customCss,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Widget config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

