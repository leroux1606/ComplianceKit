import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// A scan stuck in "running" for longer than this is assumed to have timed out
const STALE_RUNNING_MS = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/scans/[id]/status
 *
 * Lightweight poll endpoint. Returns the current status, score, and error for
 * a scan. The ScanButton component calls this every 3 seconds after kicking
 * off a scan via /api/scans/[id]/run.
 *
 * If the scan has been "running" for more than 5 minutes it is presumed to
 * have been killed by the serverless timeout — the record is updated to
 * "failed" and that status is returned so the UI can recover gracefully.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: scanId } = await params;

  const scan = await db.scan.findFirst({
    where: {
      id: scanId,
      website: { userId: session.user.id },
    },
    select: {
      id: true,
      status: true,
      score: true,
      error: true,
      startedAt: true,
      websiteId: true,
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  // Detect stale running scans (serverless timeout killed the run route)
  if (
    scan.status === "running" &&
    scan.startedAt &&
    Date.now() - scan.startedAt.getTime() > STALE_RUNNING_MS
  ) {
    const timeoutError = "Scan timed out. Please try again.";
    await db.scan
      .update({
        where: { id: scan.id },
        data: { status: "failed", error: timeoutError, completedAt: new Date() },
      })
      .catch(() => {});
    await db.website
      .update({
        where: { id: scan.websiteId },
        data: { status: "error", lastScanAt: new Date(), lastScanStatus: "failed" },
      })
      .catch(() => {});

    return NextResponse.json({ status: "failed", error: timeoutError });
  }

  return NextResponse.json({
    status: scan.status,
    score: scan.score,
    error: scan.error,
  });
}
