/**
 * Subscription Plans Configuration
 * These should match the plans created in PayStack dashboard
 */

export interface PlanFeatures {
  maxWebsites: number;
  maxScansPerMonth: number;
  cookieBanner: boolean;
  policyGenerator: boolean;
  aiPolicyGenerator: boolean;
  dsarManagement: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  teamMembers: number;
  dataRetentionDays: number;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in ZAR monthly (used for Paystack billing)
  yearlyPrice: number; // in ZAR yearly (20% discount, billed annually)
  priceUsd: number; // approximate USD monthly display price
  yearlyPriceUsd: number; // approximate USD yearly display price
  currency: string;
  interval: "monthly" | "yearly";
  paystackPlanCode: string;
  paystackYearlyPlanCode: string; // PayStack annual plan code
  stripePriceId: string; // Stripe monthly price ID
  stripeYearlyPriceId: string; // Stripe annual price ID
  features: PlanFeatures;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    description: "Perfect for small websites and blogs",
    price: 549,
    yearlyPrice: 5270, // 549 * 12 * 0.8
    priceUsd: 29,
    yearlyPriceUsd: 278, // 29 * 12 * 0.8
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: process.env.PAYSTACK_STARTER_PLAN_CODE || "PLN_starter",
    paystackYearlyPlanCode: process.env.PAYSTACK_STARTER_YEARLY_PLAN_CODE || "PLN_starter_yearly",
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    stripeYearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
    features: {
      maxWebsites: 1,
      maxScansPerMonth: 20,
      cookieBanner: true,
      policyGenerator: true,
      aiPolicyGenerator: false,
      dsarManagement: false,
      customBranding: false,
      prioritySupport: false,
      apiAccess: false,
      teamMembers: 1,
      dataRetentionDays: 30,
    },
  },
  {
    id: "professional",
    name: "Professional",
    slug: "professional",
    description: "For growing businesses with multiple websites",
    price: 1499,
    yearlyPrice: 14390, // 1499 * 12 * 0.8
    priceUsd: 79,
    yearlyPriceUsd: 758, // 79 * 12 * 0.8
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: process.env.PAYSTACK_PROFESSIONAL_PLAN_CODE || "PLN_professional",
    paystackYearlyPlanCode: process.env.PAYSTACK_PROFESSIONAL_YEARLY_PLAN_CODE || "PLN_professional_yearly",
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || "",
    stripeYearlyPriceId: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || "",
    features: {
      maxWebsites: 10,
      maxScansPerMonth: 100,
      cookieBanner: true,
      policyGenerator: true,
      aiPolicyGenerator: true,
      dsarManagement: true,
      customBranding: true,
      prioritySupport: false,
      apiAccess: true,
      teamMembers: 5,
      dataRetentionDays: 90,
    },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    slug: "enterprise",
    description: "For large organizations with advanced needs",
    price: 3499,
    yearlyPrice: 33590, // 3499 * 12 * 0.8
    priceUsd: 199,
    yearlyPriceUsd: 1910, // 199 * 12 * 0.8
    currency: "ZAR",
    interval: "monthly",
    paystackPlanCode: process.env.PAYSTACK_ENTERPRISE_PLAN_CODE || "PLN_enterprise",
    paystackYearlyPlanCode: process.env.PAYSTACK_ENTERPRISE_YEARLY_PLAN_CODE || "PLN_enterprise_yearly",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    stripeYearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    features: {
      maxWebsites: -1, // Unlimited
      maxScansPerMonth: -1, // Unlimited
      cookieBanner: true,
      policyGenerator: true,
      aiPolicyGenerator: true,
      dsarManagement: true,
      customBranding: true,
      prioritySupport: true,
      apiAccess: true,
      teamMembers: -1, // Unlimited
      dataRetentionDays: 365,
    },
  },
];

/**
 * Free tier limits (for users without subscription)
 */
export const FREE_TIER: PlanFeatures = {
  maxWebsites: 1,
  maxScansPerMonth: 3,
  cookieBanner: true,
  policyGenerator: false,
  aiPolicyGenerator: false,
  dsarManagement: true, // GDPR compliance requires handling data requests
  customBranding: false,
  prioritySupport: false,
  apiAccess: false,
  teamMembers: 1,
  dataRetentionDays: 7,
};

/**
 * Get plan by ID or slug
 */
export function getPlanBySlug(slug: string): Plan | undefined {
  return PLANS.find((p) => p.slug === slug || p.id === slug);
}

/**
 * Get plan by PayStack plan code
 */
export function getPlanByPaystackCode(code: string): Plan | undefined {
  return PLANS.find((p) => p.paystackPlanCode === code);
}

/**
 * Check if a feature is available for a plan
 */
export function hasFeature(
  features: PlanFeatures,
  feature: keyof PlanFeatures
): boolean {
  const value = features[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
}

/**
 * Check if user has reached limit
 */
export function isWithinLimit(
  features: PlanFeatures,
  limitKey: "maxWebsites" | "maxScansPerMonth" | "teamMembers",
  currentCount: number
): boolean {
  const limit = features[limitKey];
  if (limit === -1) return true; // Unlimited
  return currentCount < limit;
}

/**
 * Format feature value for display
 */
export function formatFeatureValue(value: number | boolean): string {
  if (typeof value === "boolean") return value ? "✓" : "✗";
  if (value === -1) return "Unlimited";
  return value.toString();
}



