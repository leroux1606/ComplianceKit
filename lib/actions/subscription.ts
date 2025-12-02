"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  initializeTransaction,
  verifyTransaction,
  generateSubscriptionLink,
  createCustomer,
  getCustomer,
  toKobo,
} from "@/lib/paystack";
import { PLANS, FREE_TIER, getPlanBySlug, type PlanFeatures } from "@/lib/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Get user's current subscription and features
 */
export async function getUserSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription || subscription.status !== "active") {
    return {
      subscription: null,
      plan: null,
      features: FREE_TIER,
      isActive: false,
    };
  }

  const plan = PLANS.find((p) => p.paystackPlanCode === subscription.paystackPlanCode);

  return {
    subscription,
    plan,
    features: plan?.features || FREE_TIER,
    isActive: true,
  };
}

/**
 * Get user's plan features
 */
export async function getUserFeatures(): Promise<PlanFeatures> {
  const result = await getUserSubscription();
  return result?.features || FREE_TIER;
}

/**
 * Initialize subscription checkout
 */
export async function initializeSubscription(planSlug: string) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  const plan = getPlanBySlug(planSlug);

  if (!plan) {
    return { error: "Invalid plan" };
  }

  try {
    // Create or get PayStack customer
    let customer;
    try {
      customer = await getCustomer(session.user.email);
    } catch {
      customer = await createCustomer({
        email: session.user.email,
        first_name: session.user.name?.split(" ")[0] || undefined,
        last_name: session.user.name?.split(" ").slice(1).join(" ") || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
    }

    // Initialize transaction with plan
    const transaction = await initializeTransaction({
      email: session.user.email,
      amount: toKobo(plan.price),
      plan: plan.paystackPlanCode,
      callback_url: `${APP_URL}/dashboard/billing/callback`,
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        planSlug: plan.slug,
        customerCode: customer.customer_code,
      },
    });

    return {
      success: true,
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    };
  } catch (error) {
    console.error("Failed to initialize subscription:", error);
    return { error: "Failed to initialize payment. Please try again." };
  }
}

/**
 * Verify payment and activate subscription
 */
export async function verifyPaymentAndActivate(reference: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const transaction = await verifyTransaction(reference);

    if (transaction.status !== "success") {
      return { error: "Payment was not successful" };
    }

    // Get plan from metadata or transaction
    const metadata = (transaction as unknown as { metadata?: { planSlug?: string; customerCode?: string } }).metadata;
    const planSlug = metadata?.planSlug;
    const plan = planSlug ? getPlanBySlug(planSlug) : null;

    if (!plan) {
      return { error: "Invalid plan" };
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create or update subscription
    await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: plan.id,
        paystackPlanCode: plan.paystackPlanCode,
        paystackCustomerCode: metadata?.customerCode || null,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: plan.id,
        paystackPlanCode: plan.paystackPlanCode,
        paystackCustomerCode: metadata?.customerCode || null,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });

    // Create invoice record
    await db.invoice.create({
      data: {
        subscriptionId: (await db.subscription.findUnique({
          where: { userId: session.user.id },
        }))!.id,
        paystackRef: reference,
        amount: transaction.amount / 100, // Convert from kobo
        currency: transaction.currency,
        status: "paid",
        paidAt: new Date(transaction.paid_at),
        dueDate: now,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/billing");

    return { success: true };
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return { error: "Failed to verify payment. Please contact support." };
  }
}

/**
 * Cancel subscription (at period end)
 */
export async function cancelSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription) {
    return { error: "No active subscription found" };
  }

  try {
    await db.subscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/dashboard/billing");

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return { error: "Failed to cancel subscription" };
  }
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription || !subscription.cancelAtPeriodEnd) {
    return { error: "No cancelled subscription to resume" };
  }

  try {
    await db.subscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });

    revalidatePath("/dashboard/billing");

    return { success: true };
  } catch (error) {
    console.error("Failed to resume subscription:", error);
    return { error: "Failed to resume subscription" };
  }
}

/**
 * Get subscription management link from PayStack
 */
export async function getManagementLink() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.paystackSubCode) {
    return { error: "No active subscription found" };
  }

  try {
    const result = await generateSubscriptionLink(subscription.paystackSubCode);
    return { success: true, link: result.link };
  } catch (error) {
    console.error("Failed to get management link:", error);
    return { error: "Failed to get management link" };
  }
}

/**
 * Get user's invoices
 */
export async function getUserInvoices() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  return subscription?.invoices || [];
}

/**
 * Check if user can perform action based on plan limits
 */
export async function checkPlanLimit(
  limitType: "websites" | "scans"
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { allowed: false, limit: 0, current: 0 };
  }

  const features = await getUserFeatures();

  if (limitType === "websites") {
    const count = await db.website.count({
      where: { userId: session.user.id },
    });
    const limit = features.maxWebsites;
    return {
      allowed: limit === -1 || count < limit,
      limit: limit === -1 ? Infinity : limit,
      current: count,
    };
  }

  if (limitType === "scans") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await db.scan.count({
      where: {
        website: { userId: session.user.id },
        createdAt: { gte: startOfMonth },
      },
    });
    const limit = features.maxScansPerMonth;
    return {
      allowed: limit === -1 || count < limit,
      limit: limit === -1 ? Infinity : limit,
      current: count,
    };
  }

  return { allowed: true, limit: -1, current: 0 };
}

/**
 * Redirect to pricing if feature not available
 */
export async function requireFeature(feature: keyof PlanFeatures) {
  const features = await getUserFeatures();
  const value = features[feature];
  const hasAccess = typeof value === "boolean" ? value : value > 0;

  if (!hasAccess) {
    redirect("/pricing?upgrade=true");
  }
}

