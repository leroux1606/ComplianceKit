/**
 * Runtime environment variable validation.
 *
 * Splits vars into three groups:
 *   required  — app won't function without these; throws on startup
 *   optional  — degrades gracefully if absent (logged as warning)
 *   public    — NEXT_PUBLIC_ vars validated separately
 *
 * Import this file from instrumentation.ts so validation runs once
 * at server startup before any request is served.
 */
import { z } from "zod";

// ── Required ──────────────────────────────────────────────────────────────────
const requiredSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters (generate with: openssl rand -base64 32)"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required for OAuth sign-in"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required for OAuth sign-in"),
  CRON_SECRET: z
    .string()
    .min(16, "CRON_SECRET must be at least 16 characters (generate with: openssl rand -base64 32)"),
});

// ── Optional (warn if missing, don't throw) ───────────────────────────────────
const optionalSchema = z.object({
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_STARTER_PLAN_CODE: z.string().optional(),
  PAYSTACK_PROFESSIONAL_PLAN_CODE: z.string().optional(),
  PAYSTACK_ENTERPRISE_PLAN_CODE: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SECURITY_ALERT_EMAIL: z.string().email().optional(),
  ADMIN_EMAILS: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// ── Feature-specific warnings ─────────────────────────────────────────────────
const FEATURE_WARNINGS: Array<{ key: string; feature: string }> = [
  { key: "RESEND_API_KEY",          feature: "transactional emails (password reset, DSAR, onboarding)" },
  { key: "ANTHROPIC_API_KEY",       feature: "AI-powered policy generation" },
  { key: "PAYSTACK_SECRET_KEY",     feature: "PayStack billing" },
  { key: "STRIPE_SECRET_KEY",       feature: "Stripe billing" },
  { key: "NEXT_PUBLIC_SENTRY_DSN",  feature: "Sentry error tracking" },
];

/**
 * Validate environment variables. Call once at server startup.
 * Throws if required vars are missing; logs warnings for optional ones.
 */
export function validateEnv(): void {
  // Skip in test environment — test runner sets its own vars
  if (process.env.NODE_ENV === "test") return;

  // Required — throw on failure
  const requiredResult = requiredSchema.safeParse(process.env);
  if (!requiredResult.success) {
    const issues = requiredResult.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `\n\n❌ Missing or invalid required environment variables:\n${issues}\n\nCheck your .env.local file against .env.example\n`
    );
  }

  // Optional — warn
  const optionalResult = optionalSchema.safeParse(process.env);
  if (!optionalResult.success) {
    optionalResult.error.issues.forEach((i) => {
      console.warn(`[env] Invalid optional var ${i.path.join(".")}: ${i.message}`);
    });
  }

  // Feature warnings
  FEATURE_WARNINGS.forEach(({ key, feature }) => {
    if (!process.env[key]) {
      console.warn(`[env] ${key} is not set — ${feature} will be disabled`);
    }
  });
}
