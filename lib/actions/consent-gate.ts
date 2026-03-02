"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Accepts the Terms of Service and Privacy Policy for an OAuth user.
 * Called from the /consent gate page that catches Google sign-ups.
 * GDPR Art. 7 — records affirmative consent timestamp.
 */
export async function acceptOAuthConsent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const now = new Date();

  await db.user.update({
    where: { id: session.user.id },
    data: {
      consentedAt: now,
      ageVerifiedAt: now,
    },
  });

  redirect("/dashboard");
}
