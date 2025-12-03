/**
 * PayStack API Integration
 * Documentation: https://paystack.com/docs/api/
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface PaystackSubscription {
  id: number;
  subscription_code: string;
  customer: PaystackCustomer;
  plan: {
    id: number;
    plan_code: string;
    name: string;
    amount: number;
    interval: string;
  };
  status: string;
  next_payment_date: string;
  created_at: string;
}

interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  customer: PaystackCustomer;
}

interface PaystackPlan {
  id: number;
  plan_code: string;
  name: string;
  amount: number;
  interval: string;
  currency: string;
}

/**
 * Make authenticated request to PayStack API
 */
async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `PayStack API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Initialize a transaction for subscription
 */
export async function initializeTransaction(params: {
  email: string;
  amount: number; // in kobo/cents
  plan?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await paystackRequest<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return response.data;
}

/**
 * Verify a transaction
 */
export async function verifyTransaction(reference: string) {
  const response = await paystackRequest<PaystackTransaction>(
    `/transaction/verify/${reference}`
  );
  return response.data;
}

/**
 * Create or get a customer
 */
export async function createCustomer(params: {
  email: string;
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await paystackRequest<PaystackCustomer>("/customer", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

/**
 * Get customer by email
 */
export async function getCustomer(emailOrCode: string) {
  const response = await paystackRequest<PaystackCustomer>(
    `/customer/${emailOrCode}`
  );
  return response.data;
}

/**
 * Create a subscription
 */
export async function createSubscription(params: {
  customer: string; // customer email or code
  plan: string; // plan code
  authorization?: string; // authorization code from previous transaction
  start_date?: string;
}) {
  const response = await paystackRequest<PaystackSubscription>("/subscription", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

/**
 * Get subscription details
 */
export async function getSubscription(idOrCode: string) {
  const response = await paystackRequest<PaystackSubscription>(
    `/subscription/${idOrCode}`
  );
  return response.data;
}

/**
 * Enable a subscription
 */
export async function enableSubscription(params: {
  code: string;
  token: string;
}) {
  const response = await paystackRequest<{ status: string }>("/subscription/enable", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

/**
 * Disable a subscription
 */
export async function disableSubscription(params: {
  code: string;
  token: string;
}) {
  const response = await paystackRequest<{ status: string }>("/subscription/disable", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

/**
 * Generate a subscription management link
 */
export async function generateSubscriptionLink(subscriptionCode: string) {
  const response = await paystackRequest<{ link: string }>(
    `/subscription/${subscriptionCode}/manage/link`
  );
  return response.data;
}

/**
 * List all plans
 */
export async function listPlans() {
  const response = await paystackRequest<PaystackPlan[]>("/plan");
  return response.data;
}

/**
 * Get a plan
 */
export async function getPlan(idOrCode: string) {
  const response = await paystackRequest<PaystackPlan>(`/plan/${idOrCode}`);
  return response.data;
}

/**
 * Create a plan (usually done once via dashboard, but available programmatically)
 */
export async function createPlan(params: {
  name: string;
  amount: number; // in kobo/cents
  interval: "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually";
  currency?: string;
  description?: string;
}) {
  const response = await paystackRequest<PaystackPlan>("/plan", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

/**
 * Format amount from kobo to currency display
 */
export function formatAmount(amountInKobo: number, currency: string = "ZAR"): string {
  const amount = amountInKobo / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Convert amount to kobo
 */
export function toKobo(amount: number): number {
  return Math.round(amount * 100);
}



