"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

/**
 * Get the current user's API key (masked)
 */
export async function getApiKey() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { apiKey: true },
  });

  return user?.apiKey ?? null;
}

/**
 * Generate a new API key for the current user.
 * Returns the full key once — it won't be shown again in plaintext
 * (we store the full key here, but mask it in the UI after first reveal).
 */
export async function generateApiKey() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Check subscription has apiAccess
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true, paystackPlanCode: true },
  });

  const isActive = subscription?.status === "active";
  if (!isActive) {
    return { error: "An active subscription is required to use the API." };
  }

  const { PLANS } = await import("@/lib/plans");
  const planCode = subscription!.paystackPlanCode.replace("stripe:", "");
  const plan = PLANS.find(
    (p) =>
      p.paystackPlanCode === subscription!.paystackPlanCode ||
      p.slug === planCode
  );

  if (!plan?.features.apiAccess) {
    return {
      error:
        "API access requires the Professional or Enterprise plan. Please upgrade.",
    };
  }

  const key = `ck_live_${randomBytes(24).toString("hex")}`;

  await db.user.update({
    where: { id: session.user.id },
    data: { apiKey: key },
  });

  revalidatePath("/dashboard/settings");

  return { key };
}

/**
 * Revoke the current user's API key.
 */
export async function revokeApiKey() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: session.user.id },
    data: { apiKey: null },
  });

  revalidatePath("/dashboard/settings");

  return { success: true };
}
