import Stripe from "stripe";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment to enable USD billing."
    );
  }
  return new Stripe(key, { apiVersion: "2025-03-31.basil" });
}

/**
 * Create a Stripe Checkout Session for a subscription
 */
export async function createStripeCheckoutSession(params: {
  email: string;
  priceId: string;
  planSlug: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const client = getStripeClient();
  return client.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: params.email,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      metadata: {
        userId: params.userId,
        planSlug: params.planSlug,
      },
    },
    metadata: {
      userId: params.userId,
      planSlug: params.planSlug,
    },
  });
}

/**
 * Verify Stripe webhook signature and parse event
 */
export function constructStripeEvent(payload: string, signature: string): Stripe.Event {
  const client = getStripeClient();
  return client.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

/**
 * Retrieve a Stripe Checkout Session (with optional expand)
 */
export async function retrieveStripeCheckoutSession(
  sessionId: string,
  expand?: string[]
) {
  const client = getStripeClient();
  return client.checkout.sessions.retrieve(sessionId, expand ? { expand } : undefined);
}

/**
 * Cancel a Stripe subscription at period end
 */
export async function cancelStripeSubscription(subscriptionId: string) {
  const client = getStripeClient();
  return client.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

/**
 * Resume a cancelled Stripe subscription
 */
export async function resumeStripeSubscription(subscriptionId: string) {
  const client = getStripeClient();
  return client.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
}
