"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { websiteSchema, type WebsiteInput } from "@/lib/validations";
import { normalizeUrl, generateEmbedCode } from "@/lib/utils";
import { checkPlanLimit } from "@/lib/actions/subscription";
import type { Website, Scan, Policy, BannerConfig, Cookie, Script, Finding } from "@prisma/client";

// Types for website with relations
export type WebsiteWithCounts = Website & {
  _count: {
    scans: number;
    policies: number;
  };
};

export type ScanWithRelations = Scan & {
  cookies: Cookie[];
  scripts: Script[];
  findings: Finding[];
};

export type WebsiteWithDetails = Website & {
  scans: ScanWithRelations[];
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

  const websites = await db.website.findMany({
    where: { userId: session.user.id },
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

  const website = await db.website.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          cookies: true,
          scripts: true,
          findings: true,
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

  // Check plan limits
  // TEMPORARILY DISABLED FOR DEBUGGING
  // const limitCheck = await checkPlanLimit("websites");
  // if (!limitCheck.allowed) {
  //   return { 
  //     error: `You've reached your plan limit of ${limitCheck.limit} website${limitCheck.limit !== 1 ? 's' : ''}. Please upgrade to add more.`,
  //     limitReached: true
  //   };
  // }

  const validatedFields = websiteSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, url, description } = validatedFields.data;
  const normalizedUrl = normalizeUrl(url);

  // Check if website with same URL already exists for this user
  const existingWebsite = await db.website.findFirst({
    where: {
      userId: session.user.id,
      url: normalizedUrl,
    },
  });

  if (existingWebsite) {
    return { error: "You already have a website with this URL" };
  }

  try {
    const website = await db.website.create({
      data: {
        userId: session.user.id,
        name,
        url: normalizedUrl,
        description: description || null,
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

  // Verify ownership
  const existingWebsite = await db.website.findFirst({
    where: {
      id,
      userId: session.user.id,
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
    updateData.url = normalizeUrl(values.url);
  }

  if (values.description !== undefined) {
    updateData.description = values.description || null;
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

  // Verify ownership
  const existingWebsite = await db.website.findFirst({
    where: {
      id,
      userId: session.user.id,
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

  const [websiteCount, policyCount, scanCount, consentCount] = await Promise.all([
    db.website.count({ where: { userId: session.user.id } }),
    db.policy.count({ where: { website: { userId: session.user.id } } }),
    db.scan.count({ where: { website: { userId: session.user.id } } }),
    db.consent.count({ where: { website: { userId: session.user.id } } }),
  ]);

  return { websiteCount, policyCount, scanCount, consentCount };
}

