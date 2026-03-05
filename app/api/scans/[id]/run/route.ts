import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeScan } from "@/lib/scan-runner";

/**
 * POST /api/scans/[id]/run
 *
 * Executes a queued scan. Called fire-and-forget from the client immediately
 * after triggerScan() creates the queued record. The client does not wait for
 * this response — it polls /api/scans/[id]/status for progress instead.
 *
 * Only processes scans in "queued" status to prevent double-execution.
 */
export async function POST(
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
      status: "queued",
      website: { userId: session.user.id },
    },
    include: { website: true },
  });

  if (!scan) {
    return NextResponse.json(
      { error: "Scan not found or already running" },
      { status: 404 }
    );
  }

  // Run the scan. The client has already moved on (fire-and-forget), so this
  // response is never read — but we still return 200 on completion for
  // debugging purposes (e.g. curl, Inngest migration).
  await executeScan(scan.id, scan.websiteId, scan.website.url);

  return NextResponse.json({ success: true });
}
