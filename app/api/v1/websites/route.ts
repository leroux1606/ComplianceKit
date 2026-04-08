import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";

/**
 * GET /api/v1/websites
 * Returns all websites for the authenticated API key owner.
 */
export async function GET(request: NextRequest) {
  const user = await validateApiKey(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const websites = await db.website.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      url: true,
      status: true,
      lastScanAt: true,
      lastScanStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: websites });
}
