"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendAccountDeletionEmail } from "@/lib/email";
import crypto from "crypto";

export interface UserCompanyDetails {
  companyName?: string | null;
  companyAddress?: string | null;
  companyEmail?: string | null;
  dpoName?: string | null;
  dpoEmail?: string | null;
}

/**
 * Get current user's company details
 */
export async function getUserCompanyDetails(): Promise<UserCompanyDetails | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      companyName: true,
      companyAddress: true,
      companyEmail: true,
      dpoName: true,
      dpoEmail: true,
    },
  });

  return user;
}

/**
 * Update user's company details
 */
export async function updateUserCompanyDetails(details: UserCompanyDetails) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: details,
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

/**
 * Export all user data (GDPR Article 15 - Right of Access & Article 20 - Data Portability)
 */
export async function exportUserData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Fetch ALL user data
  const [user, websites, subscription, invoices] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        companyAddress: true,
        companyEmail: true,
        dpoName: true,
        dpoEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.website.findMany({
      where: { userId },
      include: {
        scans: {
          include: {
            cookies: true,
            scripts: true,
            findings: true,
          },
        },
        policies: true,
        bannerConfig: true,
        consents: {
          take: 100, // Limit to last 100 consents
          orderBy: { consentedAt: "desc" },
        },
        dsarRequests: {
          include: {
            activities: true,
          },
        },
      },
    }),
    db.subscription.findUnique({
      where: { userId },
    }),
    db.invoice.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportVersion: "1.0",
    user,
    websites,
    subscription,
    invoices,
  };

  return {
    success: true,
    data: exportData,
    filename: `compliancekit-data-export-${userId}-${Date.now()}.json`,
  };
}

/**
 * Anonymize user data for legal retention
 * Keeps transaction records but removes PII
 */
async function anonymizeUserData(userId: string) {
  const anonymousId = `deleted-user-${crypto.randomBytes(8).toString("hex")}`;
  const anonymousEmail = `${anonymousId}@anonymized.local`;

  // Update user with anonymized data
  await db.user.update({
    where: { id: userId },
    data: {
      email: anonymousEmail,
      name: "Deleted User",
      password: null,
      image: null,
      companyName: null,
      companyAddress: null,
      companyEmail: null,
      dpoName: null,
      dpoEmail: null,
      anonymizedAt: new Date(),
    },
  });

  // Delete OAuth accounts (no legal retention needed)
  await db.account.deleteMany({
    where: { userId },
  });

  // Delete all sessions
  await db.session.deleteMany({
    where: { userId },
  });

  // Delete all websites and related data (user-created content)
  await db.website.deleteMany({
    where: { userId },
  });

  // Anonymize subscription (keep for tax records)
  await db.subscription.updateMany({
    where: { userId },
    data: {
      paystackCustomerCode: null,
    },
  });

  // Invoices are kept as-is (legal requirement for tax - 7 years)
  // They're linked to anonymized user, no action needed
}

/**
 * Request account deletion (30-day grace period)
 * GDPR Article 17 - Right to Erasure
 */
export async function requestAccountDeletion(reason?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Get user details for email
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { 
      deletedAt: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.deletedAt) {
    return {
      success: false,
      error: "Your account is already scheduled for deletion.",
    };
  }

  // Mark account for deletion (soft delete)
  await db.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      deletionReason: reason || "User requested account deletion",
    },
  });

  // Immediately cancel subscription
  await db.subscription.updateMany({
    where: { userId },
    data: {
      status: "cancelled",
      cancelAtPeriodEnd: true,
      cancelledAt: new Date(),
    },
  });

  // Revoke all sessions (log out user)
  await db.session.deleteMany({
    where: { userId },
  });

  // Send confirmation email
  try {
    await sendAccountDeletionEmail(user.email, user.name);
  } catch (error) {
    console.error("Failed to send account deletion email:", error);
    // Don't fail the deletion request if email fails
  }

  return {
    success: true,
    message:
      "Your account has been scheduled for deletion. You have 30 days to cancel this request by contacting support. After 30 days, your data will be permanently deleted.",
  };
}

/**
 * Cancel account deletion request (within 30-day grace period)
 */
export async function cancelAccountDeletion() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if account is marked for deletion
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true, anonymizedAt: true },
  });

  if (!user?.deletedAt) {
    return {
      success: false,
      error: "Your account is not scheduled for deletion.",
    };
  }

  if (user.anonymizedAt) {
    return {
      success: false,
      error:
        "Your account has already been anonymized and cannot be restored. Please contact support if you believe this is an error.",
    };
  }

  // Check if within 30-day grace period
  const gracePeriodEnd = new Date(user.deletedAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30);

  if (new Date() > gracePeriodEnd) {
    return {
      success: false,
      error:
        "The 30-day grace period has expired. Your account cannot be restored.",
    };
  }

  // Cancel deletion request
  await db.user.update({
    where: { id: userId },
    data: {
      deletedAt: null,
      deletionReason: null,
    },
  });

  revalidatePath("/dashboard/settings");

  return {
    success: true,
    message: "Your account deletion request has been cancelled.",
  };
}

/**
 * Permanently delete or anonymize user account
 * This should be run by a scheduled job (e.g., cron) to process accounts
 * where deletedAt is older than 30 days
 * 
 * NOTE: This is an admin/system function, not directly called by users
 */
export async function permanentlyDeleteUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      deletedAt: true,
      anonymizedAt: true,
      subscription: {
        select: { id: true },
      },
      _count: {
        select: {
          websites: true,
        },
      },
    },
  });

  if (!user || !user.deletedAt) {
    return {
      success: false,
      error: "User not found or not marked for deletion.",
    };
  }

  if (user.anonymizedAt) {
    return {
      success: false,
      error: "User already anonymized.",
    };
  }

  // Check if 30-day grace period has passed
  const gracePeriodEnd = new Date(user.deletedAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30);

  if (new Date() < gracePeriodEnd) {
    return {
      success: false,
      error: "Grace period has not expired yet.",
    };
  }

  // If user has subscription/invoices, anonymize (keep for tax/legal)
  // Otherwise, fully delete
  if (user.subscription) {
    // Has billing history - must keep for legal/tax (anonymized)
    await anonymizeUserData(userId);

    return {
      success: true,
      anonymized: true,
      message: "User data anonymized (billing records retained for legal compliance).",
    };
  } else {
    // No billing history - can fully delete
    await db.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      anonymized: false,
      message: "User account and all data permanently deleted.",
    };
  }
}
