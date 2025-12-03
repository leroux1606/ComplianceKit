import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public API to fetch a policy by website embed code
 * GET /api/policy/[embedCode]?type=privacy_policy|cookie_policy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    const { embedCode } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "privacy_policy";

    if (!["privacy_policy", "cookie_policy"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid policy type" },
        { status: 400 }
      );
    }

    // Find website by embed code
    const website = await db.website.findUnique({
      where: { embedCode },
      select: {
        id: true,
        url: true,
        policies: {
          where: {
            type,
            isActive: true,
          },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 }
      );
    }

    const policy = website.policies[0];

    if (!policy) {
      return NextResponse.json(
        { error: "No active policy found" },
        { status: 404 }
      );
    }

    // Check if HTML format is requested
    const format = searchParams.get("format") || "json";

    if (format === "html") {
      return new NextResponse(policy.htmlContent || policy.content, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return NextResponse.json({
      id: policy.id,
      type: policy.type,
      version: policy.version,
      content: policy.content,
      htmlContent: policy.htmlContent,
      generatedAt: policy.generatedAt,
    });
  } catch (error) {
    console.error("Error fetching policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



