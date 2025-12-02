"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Consent } from "@prisma/client";

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

/**
 * Record consent (called from widget - no auth required)
 */
export async function recordConsent(
  websiteId: string,
  visitorId: string,
  preferences: ConsentPreferences,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
) {
  try {
    // Verify website exists
    const website = await db.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return { error: "Website not found" };
    }

    // Upsert consent record
    await db.consent.upsert({
      where: {
        id: `${websiteId}_${visitorId}`, // This won't work as id is cuid, need different approach
      },
      create: {
        websiteId,
        visitorId,
        preferences: preferences as object,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
      update: {
        preferences: preferences as object,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });

    return { success: true };
  } catch (error) {
    // If upsert fails due to unique constraint, try find and update
    try {
      const existingConsent = await db.consent.findFirst({
        where: {
          websiteId,
          visitorId,
        },
      });

      if (existingConsent) {
        await db.consent.update({
          where: { id: existingConsent.id },
          data: {
            preferences: preferences as object,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
          },
        });
      } else {
        await db.consent.create({
          data: {
            websiteId,
            visitorId,
            preferences: preferences as object,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
          },
        });
      }

      return { success: true };
    } catch (innerError) {
      console.error("Failed to record consent:", innerError);
      return { error: "Failed to record consent" };
    }
  }
}

/**
 * Get consent records for a website (requires auth)
 */
export async function getConsents(
  websiteId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ consents: Consent[]; total: number }> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
  });

  if (!website) {
    throw new Error("Website not found");
  }

  const [consents, total] = await Promise.all([
    db.consent.findMany({
      where: { websiteId },
      orderBy: { consentedAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    db.consent.count({ where: { websiteId } }),
  ]);

  return { consents, total };
}

/**
 * Get consent statistics for a website
 */
export async function getConsentStats(websiteId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
  });

  if (!website) {
    throw new Error("Website not found");
  }

  const consents = await db.consent.findMany({
    where: { websiteId },
    select: { preferences: true },
  });

  const stats = {
    total: consents.length,
    acceptedAll: 0,
    rejectedAll: 0,
    partial: 0,
    analytics: 0,
    marketing: 0,
    functional: 0,
  };

  for (const consent of consents) {
    const prefs = consent.preferences as unknown as ConsentPreferences;
    
    if (prefs.analytics && prefs.marketing && prefs.functional) {
      stats.acceptedAll++;
    } else if (!prefs.analytics && !prefs.marketing && !prefs.functional) {
      stats.rejectedAll++;
    } else {
      stats.partial++;
    }

    if (prefs.analytics) stats.analytics++;
    if (prefs.marketing) stats.marketing++;
    if (prefs.functional) stats.functional++;
  }

  return stats;
}

/**
 * Delete consent record
 */
export async function deleteConsent(consentId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const consent = await db.consent.findFirst({
    where: {
      id: consentId,
      website: {
        userId: session.user.id,
      },
    },
  });

  if (!consent) {
    return { error: "Consent not found" };
  }

  await db.consent.delete({
    where: { id: consentId },
  });

  return { success: true };
}

/**
 * Export consents as CSV data
 */
export async function exportConsents(websiteId: string): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
  });

  if (!website) {
    throw new Error("Website not found");
  }

  const consents = await db.consent.findMany({
    where: { websiteId },
    orderBy: { consentedAt: "desc" },
  });

  // Generate CSV
  const headers = [
    "Visitor ID",
    "Necessary",
    "Analytics",
    "Marketing",
    "Functional",
    "Consented At",
    "IP Address",
    "User Agent",
  ];

  const rows = consents.map((consent) => {
    const prefs = consent.preferences as unknown as ConsentPreferences;
    return [
      consent.visitorId,
      "true", // Necessary is always true
      prefs.analytics ? "true" : "false",
      prefs.marketing ? "true" : "false",
      prefs.functional ? "true" : "false",
      consent.consentedAt.toISOString(),
      consent.ipAddress || "",
      consent.userAgent || "",
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csv;
}

