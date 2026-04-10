"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import { logAuthEvent, SecurityEventType } from "@/lib/security-log";
import { AuthError } from "next-auth";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * Get client IP address from headers
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  return forwardedFor?.split(",")[0] || realIp || "unknown";
}

/**
 * Get user agent from headers
 */
async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get("user-agent") || "unknown";
}

export async function signUp(values: SignUpInput) {
  const validatedFields = signUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = validatedFields.data;
  const now = new Date();

  // Sanitize inputs
  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedName = sanitizeText(name);

  // Get request info for logging
  const ipAddress = await getClientIp();
  const userAgent = await getUserAgent();

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    logAuthEvent(
      SecurityEventType.SIGNUP,
      sanitizedEmail,
      ipAddress,
      userAgent,
      false,
      { reason: "email_exists" }
    );
    return { error: "Email already in use" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user — record GDPR consent and DPA acceptance timestamps (Art. 7, 28)
  // Age is enforced via Terms of Service (s.3.1: service is for users 18+), not a checkbox
  await db.user.create({
    data: {
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      consentedAt: now,
      dpaAcceptedAt: now,
    },
  });

  // Log successful signup
  logAuthEvent(
    SecurityEventType.SIGNUP,
    sanitizedEmail,
    ipAddress,
    userAgent,
    true
  );

  // Send Day 0 welcome email — fire-and-forget, never blocks signup
  sendWelcomeEmail({ to: sanitizedEmail, name: sanitizedName }).catch(() => {});

  // Sign in the user
  try {
    await signIn("credentials", {
      email: sanitizedEmail,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong" };
    }
    throw error;
  }

  return { success: true };
}

export async function signInWithCredentials(
  email: string,
  password: string,
  rememberMe: boolean = false
) {
  // Sanitize inputs
  const sanitizedEmail = sanitizeEmail(email);

  // Get request info
  const ipAddress = await getClientIp();
  const userAgent = await getUserAgent();

  const { isAccountLocked, recordFailedAttempt, recordSuccessfulLogin } = await import("@/lib/auth-security");

  // Check if account is locked
  const lockStatus = await isAccountLocked(sanitizedEmail, ipAddress);

  if (lockStatus.locked) {
    logAuthEvent(
      SecurityEventType.LOGIN_LOCKED,
      sanitizedEmail,
      ipAddress,
      userAgent,
      false,
      { remainingTime: lockStatus.remainingTime }
    );

    return {
      error: `Account temporarily locked. Too many failed attempts. Please try again in ${lockStatus.remainingTime} seconds.`,
    };
  }

  try {
    await signIn("credentials", {
      email: sanitizedEmail,
      password,
      rememberMe: rememberMe.toString(),
      redirectTo: "/dashboard",
    });

    // Note: signIn() throws a NEXT_REDIRECT on success (standard Next.js
    // server-action redirect pattern). The lines below only run if Auth.js
    // changes that behaviour in a future version.
    await recordSuccessfulLogin(sanitizedEmail, ipAddress);

    logAuthEvent(
      SecurityEventType.LOGIN_SUCCESS,
      sanitizedEmail,
      ipAddress,
      userAgent,
      true,
      { rememberMe }
    );

    return { success: true };
  } catch (error) {
    // Auth.js throws NEXT_REDIRECT on successful sign-in — rethrow it
    // immediately so the browser navigates. Only record a failed attempt
    // when the error is actually an authentication failure.
    if (error instanceof AuthError) {
      const failureStatus = await recordFailedAttempt(sanitizedEmail, ipAddress);

      logAuthEvent(
        SecurityEventType.LOGIN_FAILED,
        sanitizedEmail,
        ipAddress,
        userAgent,
        false,
        { attemptsRemaining: failureStatus.attemptsRemaining }
      );

      switch (error.type) {
        case "CredentialsSignin":
          if (failureStatus.locked) {
            return {
              error: `Invalid credentials. Account locked for ${failureStatus.remainingTime} seconds.`,
            };
          }
          return {
            error: `Invalid credentials. ${failureStatus.attemptsRemaining} attempts remaining.`,
          };
        default:
          return { error: "Something went wrong" };
      }
    }

    // Redirect throw or unexpected error — rethrow without recording failure.
    // For successful logins, clear any prior lockout record.
    recordSuccessfulLogin(sanitizedEmail, ipAddress).catch(() => {});

    throw error;
  }
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}




