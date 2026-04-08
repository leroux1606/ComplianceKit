import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";

/**
 * GET /api/v1/scans/:id
 * Returns scan status and results.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateApiKey(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: scanId } = await params;

  const scan = await db.scan.findFirst({
    where: {
      id: scanId,
      website: { userId: user.id },
    },
    select: {
      id: true,
      status: true,
      score: true,
      startedAt: true,
      completedAt: true,
      error: true,
      createdAt: true,
      website: { select: { id: true, name: true, url: true } },
      cookies: {
        select: {
          id: true,
          name: true,
          domain: true,
          category: true,
          secure: true,
          httpOnly: true,
          sameSite: true,
        },
      },
      findings: {
        select: {
          id: true,
          type: true,
          severity: true,
          title: true,
          description: true,
          recommendation: true,
        },
      },
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  return NextResponse.json({ data: scan });
}
