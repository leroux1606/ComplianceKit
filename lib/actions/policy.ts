"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePrivacyPolicy, type PrivacyPolicyData } from "@/lib/generators/privacy-policy";
import { generateCookiePolicy, type CookiePolicyData } from "@/lib/generators/cookie-policy";
import { companyInfoSchema, type CompanyInfoInput } from "@/lib/validations";
import type { Policy } from "@prisma/client";

export type PolicyType = "privacy_policy" | "cookie_policy";

/**
 * Generate a policy for a website
 */
export async function generatePolicy(
  websiteId: string,
  type: PolicyType
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Get website with latest scan data
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
    include: {
      scans: {
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          cookies: true,
          scripts: true,
        },
      },
    },
  });

  if (!website) {
    return { error: "Website not found" };
  }

  // Check if company info is complete
  if (!website.companyName || !website.companyAddress || !website.companyEmail) {
    return { error: "Please complete your company information first" };
  }

  const latestScan = website.scans[0];
  
  let content: string;
  
  if (type === "privacy_policy") {
    const policyData: PrivacyPolicyData = {
      companyName: website.companyName,
      companyAddress: website.companyAddress,
      companyEmail: website.companyEmail,
      dpoName: website.dpoName || undefined,
      dpoEmail: website.dpoEmail || undefined,
      websiteUrl: website.url,
      cookies: latestScan?.cookies,
      scripts: latestScan?.scripts,
    };
    content = generatePrivacyPolicy(policyData);
  } else {
    const policyData: CookiePolicyData = {
      companyName: website.companyName,
      companyAddress: website.companyAddress,
      companyEmail: website.companyEmail,
      websiteUrl: website.url,
      cookies: latestScan?.cookies,
      scripts: latestScan?.scripts,
    };
    content = generateCookiePolicy(policyData);
  }

  try {
    // Deactivate previous policies of the same type
    await db.policy.updateMany({
      where: {
        websiteId,
        type,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Get the latest version number
    const latestPolicy = await db.policy.findFirst({
      where: { websiteId, type },
      orderBy: { version: "desc" },
    });

    const newVersion = (latestPolicy?.version || 0) + 1;

    // Create new policy
    const policy = await db.policy.create({
      data: {
        websiteId,
        type,
        content,
        htmlContent: content, // Already HTML
        version: newVersion,
        isActive: true,
      },
    });

    revalidatePath(`/dashboard/websites/${websiteId}`);
    revalidatePath(`/dashboard/websites/${websiteId}/policies`);

    return { success: true, policyId: policy.id };
  } catch (error) {
    console.error("Failed to generate policy:", error);
    return { error: "Failed to generate policy" };
  }
}

/**
 * Get policies for a website
 */
export async function getPolicies(websiteId: string): Promise<Policy[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const policies = await db.policy.findMany({
    where: {
      websiteId,
      website: {
        userId: session.user.id,
      },
    },
    orderBy: { generatedAt: "desc" },
  });

  return policies;
}

/**
 * Get a single policy
 */
export async function getPolicy(policyId: string): Promise<Policy | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const policy = await db.policy.findFirst({
    where: {
      id: policyId,
      website: {
        userId: session.user.id,
      },
    },
  });

  return policy;
}

/**
 * Delete a policy
 */
export async function deletePolicy(policyId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const policy = await db.policy.findFirst({
    where: {
      id: policyId,
      website: {
        userId: session.user.id,
      },
    },
  });

  if (!policy) {
    return { error: "Policy not found" };
  }

  await db.policy.delete({
    where: { id: policyId },
  });

  revalidatePath(`/dashboard/websites/${policy.websiteId}/policies`);
  return { success: true };
}

/**
 * Update company information for a website
 */
export async function updateCompanyInfo(
  websiteId: string,
  values: CompanyInfoInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
  });

  if (!website) {
    return { error: "Website not found" };
  }

  const validatedFields = companyInfoSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  try {
    await db.website.update({
      where: { id: websiteId },
      data: {
        companyName: validatedFields.data.companyName,
        companyAddress: validatedFields.data.companyAddress,
        companyEmail: validatedFields.data.companyEmail,
        dpoName: validatedFields.data.dpoName || null,
        dpoEmail: validatedFields.data.dpoEmail || null,
      },
    });

    revalidatePath(`/dashboard/websites/${websiteId}`);
    revalidatePath(`/dashboard/websites/${websiteId}/settings`);
    revalidatePath(`/dashboard/websites/${websiteId}/policies`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update company info:", error);
    return { error: "Failed to update company information" };
  }
}

/**
 * Get company information for a website
 */
export async function getCompanyInfo(websiteId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
    select: {
      companyName: true,
      companyAddress: true,
      companyEmail: true,
      dpoName: true,
      dpoEmail: true,
    },
  });

  return website;
}

