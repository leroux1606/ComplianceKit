"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { websiteSchema, type WebsiteInput } from "@/lib/validations";
import { normalizeUrl, generateEmbedCode } from "@/lib/utils";
import { validateScanUrl } from "@/lib/ssrf-check";
import { checkPlanLimit } from "@/lib/actions/subscription";
import { getTeamContext, canWrite } from "@/lib/team-context";
import type { Website, Scan, Policy, BannerConfig } from "@prisma/client";

// Types for website with relations
export type WebsiteWithCounts = Website & {
  _count: {
    scans: number;
    policies: number;
  };
};

export type ScanSummary = Pick<Scan, "id" | "status" | "score" | "ccpaScore" | "createdAt" | "completedAt" | "error"> & {
  cookies: { category: string | null }[];
  scripts: { category: string | null }[];
  findings: { severity: string }[];
};

export type WebsiteWithDetails = Website & {
  scans: ScanSummary[];
  policies: Policy[];
  bannerConfig: BannerConfig | null;
  _count: {
    scans: number;
    policies: number;
    consents: number;
  };
};

export async function getWebsites(): Promise<WebsiteWithCounts[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { ownerId } = await getTeamContext(session.user.id);

  const websites = await db.website.findMany({
    where: { userId: ownerId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { scans: true, policies: true },
      },
    },
  });

  return websites;
}

export async function getWebsite(id: string): Promise<WebsiteWithDetails | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { ownerId } = await getTeamContext(session.user.id);

  const website = await db.website.findFirst({
    where: {
      id,
      userId: ownerId,
    },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          score: true,
          ccpaScore: true,
          createdAt: true,
          completedAt: true,
          error: true,
          // Only fetch the fields ScanHistory actually needs — avoids over-fetching
          // full Cookie/Script/Finding records (10+ fields each) just for counts
          cookies: { select: { category: true } },
          scripts: { select: { category: true } },
          findings: { select: { severity: true } },
        },
      },
      policies: {
        where: { isActive: true },
        orderBy: { generatedAt: "desc" },
      },
      bannerConfig: true,
      _count: {
        select: { scans: true, policies: true, consents: true },
      },
    },
  });

  if (!website) {
    return null;
  }

  return website;
}

export async function createWebsite(values: WebsiteInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { ownerId, role } = await getTeamContext(session.user.id);
  if (!canWrite(role)) return { error: "Read-only access. Ask the account owner to add websites." };

  // Check plan limits
  const limitCheck = await checkPlanLimit("websites");
  if (!limitCheck.allowed) {
    return { 
      error: `You've reached your plan limit of ${limitCheck.limit} website${limitCheck.limit !== 1 ? 's' : ''}. Please upgrade to add more.`,
      limitReached: true
    };
  }

  const validatedFields = websiteSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, url, description } = validatedFields.data;
  const normalizedUrl = normalizeUrl(url);

  // Reject private/internal network addresses
  const ssrfCheck = await validateScanUrl(normalizedUrl);
  if (!ssrfCheck.safe) {
    return { error: `Invalid URL: ${ssrfCheck.reason}` };
  }

  // Check if website with same URL already exists for this account
  const existingWebsite = await db.website.findFirst({
    where: {
      userId: ownerId,
      url: normalizedUrl,
    },
  });

  if (existingWebsite) {
    return { error: "You already have a website with this URL" };
  }

  try {
    const website = await db.website.create({
      data: {
        userId: ownerId,
        name,
        url: normalizedUrl,
        description: description || null,
        scanSchedule: values.scanSchedule || "none",
        embedCode: generateEmbedCode(),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/websites");

    return { success: true, websiteId: website.id };
  } catch (error) {
    console.error("Failed to create website:", error);
    return { error: "Failed to create website" };
  }
}

export async function updateWebsite(id: string, values: Partial<WebsiteInput>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { ownerId, role } = await getTeamContext(session.user.id);
  if (!canWrite(role)) return { error: "Read-only access." };

  // Verify ownership
  const existingWebsite = await db.website.findFirst({
    where: {
      id,
      userId: ownerId,
    },
  });

  if (!existingWebsite) {
    return { error: "Website not found" };
  }

  const updateData: Record<string, unknown> = {};

  if (values.name !== undefined) {
    updateData.name = values.name;
  }

  if (values.url !== undefined) {
    const normalizedUrl = normalizeUrl(values.url);
    const ssrfCheck = await validateScanUrl(normalizedUrl);
    if (!ssrfCheck.safe) {
      return { error: `Invalid URL: ${ssrfCheck.reason}` };
    }
    updateData.url = normalizedUrl;
  }

  if (values.description !== undefined) {
    updateData.description = values.description || null;
  }

  if (values.scanSchedule !== undefined) {
    updateData.scanSchedule = values.scanSchedule;
    if (values.scanSchedule === "none") {
      updateData.nextScheduledScanAt = null;
    } else {
      const next = new Date();
      if (values.scanSchedule === "weekly") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      updateData.nextScheduledScanAt = next;
    }
  }

  try {
    await db.website.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/websites");
    revalidatePath(`/dashboard/websites/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update website:", error);
    return { error: "Failed to update website" };
  }
}

export async function deleteWebsite(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { ownerId, role } = await getTeamContext(session.user.id);
  if (role !== "owner") return { error: "Only the account owner can delete websites." };

  // Verify ownership
  const existingWebsite = await db.website.findFirst({
    where: {
      id,
      userId: ownerId,
    },
  });

  if (!existingWebsite) {
    return { error: "Website not found" };
  }

  try {
    await db.website.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/websites");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete website:", error);
    return { error: "Failed to delete website" };
  }
}

export async function getWebsiteStats() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { ownerId } = await getTeamContext(session.user.id);

  const [websiteCount, policyCount, scanCount, consentCount, bannerConfigCount, firstWebsite] =
    await Promise.all([
      db.website.count({ where: { userId: ownerId } }),
      db.policy.count({ where: { website: { userId: ownerId } } }),
      db.scan.count({ where: { website: { userId: ownerId } } }),
      db.consent.count({ where: { website: { userId: ownerId } } }),
      db.bannerConfig.count({ where: { website: { userId: ownerId } } }),
      db.website.findFirst({
        where: { userId: ownerId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }),
    ]);

  return {
    websiteCount,
    policyCount,
    scanCount,
    consentCount,
    bannerConfigCount,
    firstWebsiteId: firstWebsite?.id ?? null,
  };
}

