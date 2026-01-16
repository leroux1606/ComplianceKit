"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logDataAccess, logSecurityEvent, SecurityEventType } from "@/lib/security-log";
import { headers } from "next/headers";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";
import bcrypt from "bcryptjs";

/**
 * Get client IP address
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  return forwardedFor?.split(",")[0] || realIp || "unknown";
}

/**
 * Export all user data (GDPR Right to Data Portability)
 * Returns complete data in machine-readable JSON format
 */
export async function exportUserData() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized - Please log in" };
    }

    const userId = session.user.id;
    const ipAddress = await getClientIp();

    // Log data export request
    logDataAccess(userId, "user_data_export", "export_all", ipAddress, true);

    // Fetch all user data
    const [user, websites, subscription, invoices] = await Promise.all([
      // User account data
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Website data (including scans, policies, DSARs)
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
          consents: true,
          dsarRequests: {
            include: {
              activities: true,
              attachments: true,
            },
          },
        },
      }),

      // Subscription data
      db.subscription.findUnique({
        where: { userId },
      }),

      // Invoice data
      db.subscription
        .findUnique({
          where: { userId },
          include: {
            invoices: true,
          },
        })
        .then((sub) => sub?.invoices || []),
    ]);

    if (!user) {
      return { error: "User not found" };
    }

    // Compile complete data export
    const dataExport = {
      exportDate: new Date().toISOString(),
      exportFormat: "JSON",
      dataSubject: {
        userId: user.id,
        email: user.email,
      },
      personalData: {
        account: user,
        subscription: subscription || null,
        invoices: invoices,
      },
      websites: websites.map((website) => ({
        id: website.id,
        name: website.name,
        url: website.url,
        description: website.description,
        status: website.status,
        embedCode: website.embedCode,
        companyInfo: {
          companyName: website.companyName,
          companyAddress: website.companyAddress,
          companyEmail: website.companyEmail,
          dpoName: website.dpoName,
          dpoEmail: website.dpoEmail,
        },
        createdAt: website.createdAt,
        updatedAt: website.updatedAt,
        lastScanAt: website.lastScanAt,
        scans: website.scans,
        policies: website.policies,
        bannerConfig: website.bannerConfig,
        consents: website.consents.length, // Count only (visitor data is pseudonymous)
        dsarRequests: website.dsarRequests,
      })),
      exportMetadata: {
        version: "1.0",
        exportedBy: "ComplianceKit GDPR Data Export",
        legalBasis: "GDPR Article 20 - Right to Data Portability",
        format: "JSON (machine-readable)",
      },
    };

    return {
      success: true,
      data: dataExport,
      message: "Data export completed successfully",
    };
  } catch (error) {
    console.error("Data export error:", error);
    return { error: "Failed to export data. Please try again or contact support." };
  }
}

/**
 * Delete user account and all associated data (GDPR Right to Erasure / "Right to be Forgotten")
 * Permanently deletes all user data from the system
 */
export async function deleteUserAccount(confirmationEmail: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return { error: "Unauthorized - Please log in" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const ipAddress = await getClientIp();

    // Verify email confirmation matches
    if (confirmationEmail.toLowerCase().trim() !== userEmail.toLowerCase()) {
      return { error: "Email confirmation does not match. Account not deleted." };
    }

    // Log account deletion request
    logSecurityEvent({
      type: SecurityEventType.SENSITIVE_DATA_ACCESS,
      userId,
      email: userEmail,
      ipAddress,
      resource: "account_deletion",
      action: "delete",
      success: true,
      message: "User requested account deletion",
    });

    // Delete all user data in correct order (respecting foreign key constraints)
    // Prisma cascade delete will handle most of this automatically

    await db.user.delete({
      where: { id: userId },
    });

    // Note: All related data (websites, scans, policies, DSARs, etc.) will be
    // cascade deleted automatically due to our schema's onDelete: Cascade settings

    console.log(`[GDPR] Account deletion completed for user: ${userId}`);

    return {
      success: true,
      message: "Your account and all associated data have been permanently deleted. We're sorry to see you go.",
    };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { error: "Failed to delete account. Please contact support for assistance." };
  }
}

/**
 * Get data retention information for user
 * Shows what data is stored and how long it's retained
 */
export async function getDataRetentionInfo() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized - Please log in" };
    }

    const userId = session.user.id;

    // Get counts of stored data
    const [websiteCount, scanCount, policyCount, dsarCount, consentCount] = await Promise.all([
      db.website.count({ where: { userId } }),
      db.scan.count({
        where: {
          website: { userId },
        },
      }),
      db.policy.count({
        where: {
          website: { userId },
        },
      }),
      db.dataSubjectRequest.count({
        where: {
          website: { userId },
        },
      }),
      db.consent.count({
        where: {
          website: { userId },
        },
      }),
    ]);

    const retentionInfo = {
      dataCategories: [
        {
          category: "Account Data",
          description: "Your profile, email, and authentication information",
          retentionPeriod: "Active account + 30 days after deletion",
          itemCount: 1,
          canDelete: true,
        },
        {
          category: "Website Data",
          description: "Websites you've added to ComplianceKit",
          retentionPeriod: "Active account or until manually deleted",
          itemCount: websiteCount,
          canDelete: true,
        },
        {
          category: "Scan Data",
          description: "Website scan results, cookies, and scripts",
          retentionPeriod: "12 months or until manually deleted",
          itemCount: scanCount,
          canDelete: true,
        },
        {
          category: "Generated Policies",
          description: "Privacy and cookie policies you've generated",
          retentionPeriod: "Active account or until manually deleted",
          itemCount: policyCount,
          canDelete: true,
        },
        {
          category: "DSAR Records",
          description: "Data Subject Access Requests processed",
          retentionPeriod: "3 years (legal requirement)",
          itemCount: dsarCount,
          canDelete: false,
          legalBasis: "Legal obligation under GDPR Article 30",
        },
        {
          category: "Consent Records",
          description: "Visitor consent tracking for your websites",
          retentionPeriod: "2 years or until consent withdrawn",
          itemCount: consentCount,
          canDelete: true,
        },
      ],
      totalDataPoints: websiteCount + scanCount + policyCount + dsarCount + consentCount,
    };

    return {
      success: true,
      data: retentionInfo,
    };
  } catch (error) {
    console.error("Data retention info error:", error);
    return { error: "Failed to retrieve data retention information" };
  }
}

/**
 * Update user profile (name and image)
 * GDPR Article 16 - Right to Rectification
 */
export async function updateUserProfile(data: { name?: string; image?: string }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized - Please log in" };
    }

    const userId = session.user.id;
    const ipAddress = await getClientIp();

    // Sanitize inputs
    const updateData: { name?: string; image?: string } = {};

    if (data.name !== undefined) {
      const sanitizedName = sanitizeText(data.name).trim();
      if (sanitizedName.length < 2) {
        return { error: "Name must be at least 2 characters long" };
      }
      if (sanitizedName.length > 100) {
        return { error: "Name must be less than 100 characters" };
      }
      updateData.name = sanitizedName;
    }

    if (data.image !== undefined) {
      // Allow null/empty to remove image
      updateData.image = data.image.trim() || null;
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    // Log profile update
    logSecurityEvent({
      type: SecurityEventType.PROFILE_UPDATED,
      userId,
      email: updatedUser.email,
      ipAddress,
      resource: "user_profile",
      action: "update",
      success: true,
      message: `Profile updated: ${Object.keys(updateData).join(", ")}`,
    });

    return {
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

/**
 * Update user email
 * GDPR Article 16 - Right to Rectification
 * Note: Email change requires re-verification
 */
export async function updateUserEmail(newEmail: string, currentPassword: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return { error: "Unauthorized - Please log in" };
    }

    const userId = session.user.id;
    const currentEmail = session.user.email;
    const ipAddress = await getClientIp();

    // Sanitize and validate new email
    const sanitizedEmail = sanitizeEmail(newEmail).toLowerCase().trim();

    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return { error: "Invalid email format" };
    }

    if (sanitizedEmail === currentEmail) {
      return { error: "New email must be different from current email" };
    }

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Verify current password for security
    if (!user.password) {
      return { error: "Cannot change email for OAuth accounts. Please contact support." };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      logSecurityEvent({
        type: SecurityEventType.LOGIN_FAILED,
        userId,
        email: currentEmail,
        ipAddress,
        resource: "email_change",
        action: "verify_password",
        success: false,
        message: "Invalid password during email change attempt",
      });
      return { error: "Current password is incorrect" };
    }

    // Check if new email is already in use
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return { error: "This email is already registered. Please use a different email." };
    }

    // Update email and mark as unverified
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        email: sanitizedEmail,
        emailVerified: null, // Require re-verification
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    // Log email change
    logSecurityEvent({
      type: SecurityEventType.PROFILE_UPDATED,
      userId,
      email: sanitizedEmail,
      ipAddress,
      resource: "user_email",
      action: "update",
      success: true,
      message: `Email changed from ${currentEmail} to ${sanitizedEmail}`,
    });

    return {
      success: true,
      user: updatedUser,
      message: "Email updated successfully. Please verify your new email address.",
    };
  } catch (error: any) {
    console.error("Email update error:", error);

    // Handle unique constraint violation
    if (error?.code === "P2002") {
      return { error: "This email is already registered" };
    }

    return { error: "Failed to update email. Please try again." };
  }
}

/**
 * Update user password
 * GDPR Article 16 - Right to Rectification
 */
export async function updateUserPassword(currentPassword: string, newPassword: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return { error: "Unauthorized - Please log in" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const ipAddress = await getClientIp();

    // Validate new password
    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters long" };
    }

    if (newPassword.length > 100) {
      return { error: "Password is too long" };
    }

    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" };
    }

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Check if user has password (not OAuth user)
    if (!user.password) {
      return { error: "Cannot change password for OAuth accounts (Google sign-in)" };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      logSecurityEvent({
        type: SecurityEventType.LOGIN_FAILED,
        userId,
        email: userEmail,
        ipAddress,
        resource: "password_change",
        action: "verify_password",
        success: false,
        message: "Invalid password during password change attempt",
      });
      return { error: "Current password is incorrect" };
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return { error: "New password must be different from current password" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log password change
    logSecurityEvent({
      type: SecurityEventType.PASSWORD_CHANGED,
      userId,
      email: userEmail,
      ipAddress,
      resource: "user_password",
      action: "update",
      success: true,
      message: "Password changed successfully",
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Password update error:", error);
    return { error: "Failed to update password. Please try again." };
  }
}
