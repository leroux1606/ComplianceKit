"use server";

import { auth } from "@/lib/auth";
import { getPlanBySlug } from "@/lib/plans";
import { createStripeCheckoutSession } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Initialize a Stripe Checkout Session for a subscription plan
 */
export async function initializeStripeCheckout(planSlug: string) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  const plan = getPlanBySlug(planSlug);

  if (!plan) {
    return { error: "Invalid plan" };
  }

  if (!plan.stripePriceId) {
    return { error: "USD billing not yet configured for this plan. Please use ZAR payment." };
  }

  try {
    const checkoutSession = await createStripeCheckoutSession({
      email: session.user.email,
      priceId: plan.stripePriceId,
      planSlug: plan.slug,
      userId: session.user.id,
      successUrl: `${APP_URL}/dashboard/billing/stripe-callback?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${APP_URL}/dashboard/billing/checkout?plan=${plan.slug}`,
    });

    return { success: true, checkoutUrl: checkoutSession.url };
  } catch (error) {
    console.error("Failed to initialize Stripe checkout:", error);
    return { error: "Failed to initialize USD payment. Please try again." };
  }
}
