import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getPlanByPaystackCode, PLANS } from "@/lib/plans";
import { logger } from "@/lib/logger";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Verify PayStack webhook signature
 */
function verifySignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  try {
    // Use timing-safe comparison to prevent HMAC oracle timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    // timingSafeEqual throws if buffers differ in length (malformed signature)
    return false;
  }
}

/**
 * PayStack Webhook Handler
 * Handles subscription events from PayStack
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !verifySignature(payload, signature)) {
      logger.warn("webhook.paystack.invalid_signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = event.event;
    const data = event.data;

    logger.info("webhook.paystack.received", { eventType });

    switch (eventType) {
      case "subscription.create":
        await handleSubscriptionCreate(data);
        break;

      case "subscription.not_renew":
        await handleSubscriptionNotRenew(data);
        break;

      case "subscription.disable":
        await handleSubscriptionDisable(data);
        break;

      case "subscription.enable":
        await handleSubscriptionEnable(data);
        break;

      case "charge.success":
        await handleChargeSuccess(data);
        break;

      case "invoice.create":
        await handleInvoiceCreate(data);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(data);
        break;

      default:
        logger.warn("webhook.paystack.unhandled", { eventType });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("webhook.paystack.error", {}, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreate(data: {
  subscription_code: string;
  customer: { email: string; customer_code: string };
  plan: { plan_code: string };
  next_payment_date: string;
}) {
  const { subscription_code, customer, plan, next_payment_date } = data;

  // Find user by email
  const user = await db.user.findUnique({
    where: { email: customer.email },
  });

  if (!user) {
    logger.warn("webhook.paystack.user_not_found", { email: customer.email });
    return;
  }

  const planConfig = getPlanByPaystackCode(plan.plan_code);
  const periodEnd = new Date(next_payment_date);

  await db.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      planId: planConfig?.id || plan.plan_code,
      paystackPlanCode: plan.plan_code,
      paystackSubCode: subscription_code,
      paystackCustomerCode: customer.customer_code,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    },
    update: {
      paystackSubCode: subscription_code,
      paystackCustomerCode: customer.customer_code,
      status: "active",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    },
  });

  logger.info("webhook.paystack.subscription_created", { userId: user.id });
}

/**
 * Handle subscription not renewing (cancelled)
 */
async function handleSubscriptionNotRenew(data: {
  subscription_code: string;
  customer: { email: string };
}) {
  const user = await db.user.findUnique({
    where: { email: data.customer.email },
  });

  if (!user) return;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  logger.info("webhook.paystack.subscription_not_renew", { userId: user.id });
}

/**
 * Handle subscription disabled
 */
async function handleSubscriptionDisable(data: {
  subscription_code: string;
  customer: { email: string };
}) {
  const user = await db.user.findUnique({
    where: { email: data.customer.email },
  });

  if (!user) return;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  logger.info("webhook.paystack.subscription_disabled", { userId: user.id });
}

/**
 * Handle subscription enabled
 */
async function handleSubscriptionEnable(data: {
  subscription_code: string;
  customer: { email: string };
  next_payment_date: string;
}) {
  const user = await db.user.findUnique({
    where: { email: data.customer.email },
  });

  if (!user) return;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status: "active",
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      currentPeriodEnd: new Date(data.next_payment_date),
    },
  });

  logger.info("webhook.paystack.subscription_enabled", { userId: user.id });
}

/**
 * Handle successful charge (renewal payment)
 */
async function handleChargeSuccess(data: {
  reference: string;
  amount: number;
  currency: string;
  customer: { email: string };
  paid_at: string;
  metadata?: { userId?: string };
}) {
  const user = await db.user.findUnique({
    where: { email: data.customer.email },
  });

  if (!user) return;

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) return;

  // Update subscription period — respect plan interval (monthly vs yearly)
  const isYearly = PLANS.some(p => p.paystackYearlyPlanCode === subscription.paystackPlanCode);
  const periodEnd = new Date(subscription.currentPeriodEnd);
  if (isYearly) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status: "active",
      currentPeriodStart: subscription.currentPeriodEnd,
      currentPeriodEnd: periodEnd,
    },
  });

  // Idempotency: skip if this charge reference was already recorded
  const existing = await db.invoice.findFirst({
    where: { paystackRef: data.reference },
  });
  if (!existing) {
    await db.invoice.create({
      data: {
        subscriptionId: subscription.id,
        paystackRef: data.reference,
        amount: data.amount / 100,
        currency: data.currency,
        status: "paid",
        paidAt: new Date(data.paid_at),
        dueDate: subscription.currentPeriodEnd,
      },
    });
  }

  logger.info("webhook.paystack.charge_success", { userId: user.id });
}

/**
 * Handle invoice creation
 */
async function handleInvoiceCreate(data: {
  subscription: { subscription_code: string };
  customer: { email: string };
  amount: number;
  currency: string;
  due_date: string;
}) {
  const user = await db.user.findUnique({
    where: { email: data.customer.email },
  });

  if (!user) return;

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) return;

  // Idempotency: skip if a pending invoice already exists for this due date
  const dueDate = new Date(data.due_date);
  const existing = await db.invoice.findFirst({
    where: { subscriptionId: subscription.id, dueDate },
  });
  if (!existing) {
    await db.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: data.amount / 100,
        currency: data.currency,
        status: "pending",
        dueDate,
      },
    });
  }

  logger.info("webhook.paystack.invoice_created", { userId: user.id });
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(data: {
  subscription: { subscription_code: string };
  customer: { email: string };
}) {
  const user = await db.user.findUnique({
    where: { email: data.customer.email },
  });

  if (!user) return;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status: "past_due",
    },
  });

  logger.warn("webhook.paystack.payment_failed", { userId: user.id });
}



