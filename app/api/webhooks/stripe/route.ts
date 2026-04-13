import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getPlanBySlug } from "@/lib/plans";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = constructStripeEvent(payload, signature);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planSlug = session.metadata?.planSlug;

  if (!userId || !planSlug) {
    console.error("Missing metadata in Stripe checkout session:", session.id);
    return;
  }

  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    console.error("Unknown plan slug in Stripe metadata:", planSlug);
    return;
  }

  const subscriptionId = session.subscription as string;
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      paystackPlanCode: `stripe:${plan.slug}`,
      paystackSubCode: subscriptionId,
      paystackCustomerCode: session.customer as string,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      planId: plan.id,
      paystackPlanCode: `stripe:${plan.slug}`,
      paystackSubCode: subscriptionId,
      paystackCustomerCode: session.customer as string,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    },
  });

  console.log(`Stripe subscription activated for user: ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const dbSub = await db.subscription.findUnique({ where: { userId } });
  if (!dbSub) return;

  // billing_cycle_anchor_config not available in all API versions;
  // fall back to DB period end if Stripe doesn't supply it
  const rawPeriodEnd = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  const periodEnd = rawPeriodEnd
    ? new Date(rawPeriodEnd * 1000)
    : dbSub.currentPeriodEnd;

  await db.subscription.update({
    where: { userId },
    data: {
      status: subscription.status === "active" ? "active" : subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: periodEnd,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.subscription.update({
    where: { userId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  }).catch(() => null); // ignore if not found
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Stripe "basil" API restructured Invoice; use unknown cast for cross-version safety
  const raw = invoice as unknown as Record<string, unknown>;
  const subscriptionId = (raw.subscription ?? raw.subscription_details) as string | undefined;
  if (!subscriptionId) return;

  const dbSub = await db.subscription.findFirst({
    where: { paystackSubCode: subscriptionId },
  });
  if (!dbSub) return;

  const periodEnd = new Date(dbSub.currentPeriodEnd);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.subscription.update({
    where: { id: dbSub.id },
    data: {
      status: "active",
      currentPeriodStart: dbSub.currentPeriodEnd,
      currentPeriodEnd: periodEnd,
    },
  });

  const amountPaid = (raw.amount_paid as number | undefined) ?? 0;
  const currency = (raw.currency as string | undefined) ?? "usd";

  // Idempotency: skip if this invoice was already recorded
  const existingInvoice = await db.invoice.findFirst({
    where: { paystackRef: invoice.id },
  });
  if (!existingInvoice) {
    await db.invoice.create({
      data: {
        subscriptionId: dbSub.id,
        paystackRef: invoice.id,
        amount: amountPaid / 100,
        currency: currency.toUpperCase(),
        status: "paid",
        paidAt: new Date(),
        dueDate: dbSub.currentPeriodEnd,
      },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const raw = invoice as unknown as Record<string, unknown>;
  const subscriptionId = (raw.subscription ?? raw.subscription_details) as string | undefined;
  if (!subscriptionId) return;

  await db.subscription.updateMany({
    where: { paystackSubCode: subscriptionId },
    data: { status: "past_due" },
  });
}
