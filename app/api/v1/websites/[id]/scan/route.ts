import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { executeScan } from "@/lib/scan-runner";

/**
 * POST /api/v1/websites/:id/scan
 * Triggers a new scan for a website.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateApiKey(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: websiteId } = await params;

  const website = await db.website.findFirst({
    where: { id: websiteId, userId: user.id },
  });

  if (!website) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  // Check for already running scan
  const runningScan = await db.scan.findFirst({
    where: { websiteId, status: { in: ["queued", "running"] } },
  });

  if (runningScan) {
    return NextResponse.json(
      { error: "A scan is already in progress", scanId: runningScan.id },
      { status: 409 }
    );
  }

  const scan = await db.scan.create({
    data: {
      websiteId,
      status: "queued",
      startedAt: new Date(),
    },
    select: { id: true, status: true, createdAt: true },
  });

  // Fire-and-forget — client should poll GET /api/v1/scans/:id for status
  executeScan(scan.id, websiteId, website.url).catch(() => {/* background */});

  return NextResponse.json({ data: scan }, { status: 202 });
}
