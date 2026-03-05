import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Verify website ownership
    const website = await db.website.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, name: true },
    });

    if (!website) {
      return new NextResponse("Website not found", { status: 404 });
    }

    // Optional date range filters from query params
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const consents = await db.consent.findMany({
      where: {
        websiteId: id,
        ...(from || to
          ? {
              consentedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { consentedAt: "desc" },
    });

    // Build CSV
    const header = [
      "visitor_id",
      "consented_at",
      "updated_at",
      "consent_method",
      "policy_version",
      "banner_version",
      "necessary",
      "analytics",
      "marketing",
      "functional",
      "ip_address",
      "user_agent",
    ].join(",");

    const rows = consents.map((c) => {
      const prefs = (c.preferences as Record<string, boolean>) ?? {};
      return [
        csvCell(c.visitorId),
        csvCell(c.consentedAt.toISOString()),
        csvCell(c.updatedAt.toISOString()),
        csvCell(c.consentMethod),
        csvCell(c.policyVersion?.toString() ?? ""),
        csvCell(c.bannerConfigVersion ?? ""),
        csvCell(String(prefs.necessary ?? "")),
        csvCell(String(prefs.analytics ?? "")),
        csvCell(String(prefs.marketing ?? "")),
        csvCell(String(prefs.functional ?? "")),
        csvCell(c.ipAddress ?? ""),
        csvCell(c.userAgent ?? ""),
      ].join(",");
    });

    const csv = [header, ...rows].join("\r\n");

    const safeName = website.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const filename = `consent-log-${safeName}-${date}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Consent export error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}

/** Wrap a value in double-quotes and escape any internal double-quotes. */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
