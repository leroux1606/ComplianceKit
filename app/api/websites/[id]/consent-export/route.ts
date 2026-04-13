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

    const whereClause = {
      websiteId: id,
      ...(from || to
        ? {
            consentedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

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

    const safeName = website.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const date = new Date().toISOString().split("T")[0];
    const filename = `consent-log-${safeName}-${date}.csv`;

    // Stream in batches to avoid loading all records into memory
    const BATCH_SIZE = 1000;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(header + "\r\n"));

          let skip = 0;
          while (true) {
            const batch = await db.consent.findMany({
              where: whereClause,
              orderBy: { consentedAt: "desc" },
              take: BATCH_SIZE,
              skip,
            });

            if (batch.length === 0) break;

            const chunk = batch
              .map((c) => {
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
              })
              .join("\r\n") + "\r\n";

            controller.enqueue(encoder.encode(chunk));
            skip += BATCH_SIZE;
            if (batch.length < BATCH_SIZE) break;
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
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

/** Wrap a value in double-quotes, escaping internal quotes and stripping newlines. */
function csvCell(value: string): string {
  const safe = value
    .replace(/\r/g, " ")   // carriage return breaks CSV row boundaries
    .replace(/\n/g, " ")   // newline breaks CSV row boundaries
    .replace(/"/g, '""');  // RFC 4180: escape double-quotes by doubling
  return `"${safe}"`;
}
