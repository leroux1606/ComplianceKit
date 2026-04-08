import { NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Validate an API key from the Authorization header.
 * Returns the user if valid, null otherwise.
 *
 * Expected header: Authorization: Bearer ck_live_...
 */
export async function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7).trim();
  if (!key) return null;

  const user = await db.user.findUnique({
    where: { apiKey: key, deletedAt: null },
    select: {
      id: true,
      email: true,
      subscription: { select: { status: true, paystackPlanCode: true } },
    },
  });

  if (!user) return null;

  // API access requires an active paid subscription with apiAccess feature
  // (Professional or Enterprise)
  const isActive = user.subscription?.status === "active";
  if (!isActive) return null;

  const planCode = user.subscription!.paystackPlanCode.replace("stripe:", "");
  const { PLANS } = await import("@/lib/plans");
  const plan = PLANS.find(
    (p) => p.paystackPlanCode === user.subscription!.paystackPlanCode || p.slug === planCode
  );

  if (!plan?.features.apiAccess) return null;

  return user;
}
