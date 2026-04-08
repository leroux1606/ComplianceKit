import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { db } from "@/lib/db";

/**
 * GET /api/v1/policies
 * Returns all active policies for the authenticated user's websites.
 * Optional query params: ?websiteId=xxx&type=privacy_policy
 */
export async function GET(request: NextRequest) {
  const user = await validateApiKey(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const websiteId = searchParams.get("websiteId");
  const type = searchParams.get("type");

  const policies = await db.policy.findMany({
    where: {
      isActive: true,
      website: { userId: user.id },
      ...(websiteId ? { websiteId } : {}),
      ...(type ? { type } : {}),
    },
    select: {
      id: true,
      type: true,
      language: true,
      version: true,
      generatedAt: true,
      updatedAt: true,
      website: { select: { id: true, name: true, url: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: policies });
}
