"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bannerConfigSchema, type BannerConfigInput } from "@/lib/validations";
import { generateEmbedCode } from "@/lib/utils";
import { getTeamContext } from "@/lib/team-context";
import { logger } from "@/lib/logger";
import { DEFAULT_BANNER_CONFIG } from "@/lib/banner-defaults";
import type { BannerConfig } from "@prisma/client";

/**
 * Get banner configuration for a website
 */
export async function getBannerConfig(websiteId: string): Promise<BannerConfig | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { ownerId } = await getTeamContext(session.user.id);

  // Verify ownership
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: ownerId,
    },
    include: {
      bannerConfig: true,
    },
  });

  if (!website) {
    return null;
  }

  return website.bannerConfig;
}

/**
 * Save banner configuration
 */
export async function saveBannerConfig(
  websiteId: string,
  values: BannerConfigInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { ownerId } = await getTeamContext(session.user.id);

  // Verify ownership
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: ownerId,
    },
  });

  if (!website) {
    return { error: "Website not found" };
  }

  const validatedFields = bannerConfigSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid configuration" };
  }

  try {
    // Upsert banner config
    await db.bannerConfig.upsert({
      where: { websiteId },
      create: {
        websiteId,
        ...validatedFields.data,
      },
      update: validatedFields.data,
    });

    // Ensure website has embed code
    if (!website.embedCode) {
      await db.website.update({
        where: { id: websiteId },
        data: { embedCode: generateEmbedCode() },
      });
    }

    revalidatePath(`/dashboard/websites/${websiteId}`);
    revalidatePath(`/dashboard/websites/${websiteId}/banner`);

    return { success: true };
  } catch (error) {
    logger.error("banner.save_config_failed", {}, error);
    return { error: "Failed to save configuration" };
  }
}

/**
 * Get default banner configuration
 */
export async function getDefaultBannerConfig(): Promise<BannerConfigInput> {
  return {
    ...DEFAULT_BANNER_CONFIG,
    customCss: "",
    privacyPolicyUrl: undefined,
    cookiePolicyUrl: undefined,
  };
}

/**
 * Get website by embed code (for public widget API)
 */
export async function getWebsiteByEmbedCode(embedCode: string) {
  const website = await db.website.findFirst({
    where: { embedCode },
    include: {
      bannerConfig: true,
    },
  });

  return website;
}

