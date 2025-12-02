import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getPlanByPaystackCode } from "@/lib/plans";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Verify PayStack webhook signature
 */
function verifySignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
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
      console.error("Invalid PayStack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = event.event;
    const data = event.data;

    console.log(`PayStack webhook received: ${eventType}`);

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
        console.log(`Unhandled PayStack event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayStack webhook error:", error);
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
    console.error(`User not found for email: ${customer.email}`);
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

  console.log(`Subscription created for user: ${user.id}`);
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

  console.log(`Subscription set to not renew for user: ${user.id}`);
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

  console.log(`Subscription disabled for user: ${user.id}`);
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

  console.log(`Subscription enabled for user: ${user.id}`);
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

  // Update subscription period
  const periodEnd = new Date(subscription.currentPeriodEnd);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      status: "active",
      currentPeriodStart: subscription.currentPeriodEnd,
      currentPeriodEnd: periodEnd,
    },
  });

  // Create invoice
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

  console.log(`Charge successful for user: ${user.id}`);
}

/**
 * Handle invoice creation
 */
async function handleInvoiceCreate(data: {
  subscription: { subscription_code: string };
  customer: { email: string };
  amount: number;
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

  // Create pending invoice
  await db.invoice.create({
    data: {
      subscriptionId: subscription.id,
      amount: data.amount / 100,
      currency: "ZAR",
      status: "pending",
      dueDate: new Date(data.due_date),
    },
  });

  console.log(`Invoice created for user: ${user.id}`);
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

  console.log(`Payment failed for user: ${user.id}`);
}

