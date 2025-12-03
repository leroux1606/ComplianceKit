"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  dsarSubmissionSchema, 
  dsarUpdateSchema,
  type DsarSubmissionInput,
  type DsarUpdateInput 
} from "@/lib/validations";
import { calculateDueDate, type DsarStatus, type DsarActivityAction } from "@/lib/dsar/types";
import { requireFeature } from "@/lib/actions/subscription";
import type { DataSubjectRequest, DsarActivity } from "@prisma/client";

export type DsarWithRelations = DataSubjectRequest & {
  activities: DsarActivity[];
  website: { name: string; url: string };
};

export type DsarListItem = DataSubjectRequest & {
  website: { name: string };
  _count: { activities: number };
};

/**
 * Submit a new DSAR (public endpoint, no auth required)
 */
export async function submitDsar(
  embedCode: string,
  values: DsarSubmissionInput
) {
  const validatedFields = dsarSubmissionSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  // Find website by embed code
  const website = await db.website.findUnique({
    where: { embedCode },
    include: { user: { include: { subscription: true } } },
  });

  if (!website) {
    return { error: "Website not found" };
  }

  // Check if website owner has DSAR feature
  // For now, allow all submissions but mark for upgrade if needed
  const hasFeature = website.user.subscription?.status === "active";

  const { requestType, requesterEmail, requesterName, requesterPhone, description, additionalInfo } = 
    validatedFields.data;

  try {
    const dsar = await db.dataSubjectRequest.create({
      data: {
        websiteId: website.id,
        requestType,
        requesterEmail,
        requesterName: requesterName || null,
        requesterPhone: requesterPhone || null,
        description,
        additionalInfo: additionalInfo || null,
        dueDate: calculateDueDate(),
        status: "pending",
        priority: "normal",
      },
    });

    // Create initial activity
    await db.dsarActivity.create({
      data: {
        dsarId: dsar.id,
        action: "created",
        description: `DSAR submitted by ${requesterEmail}`,
        performedBy: "requester",
        metadata: { requestType },
      },
    });

    // TODO: Send verification email to requester
    // TODO: Send notification to website owner

    return { 
      success: true, 
      dsarId: dsar.id,
      verificationToken: dsar.verificationToken,
      message: hasFeature 
        ? "Your request has been submitted. Please check your email to verify."
        : "Your request has been submitted."
    };
  } catch (error) {
    console.error("Failed to submit DSAR:", error);
    return { error: "Failed to submit request. Please try again." };
  }
}

/**
 * Verify a DSAR submission
 */
export async function verifyDsar(verificationToken: string) {
  const dsar = await db.dataSubjectRequest.findUnique({
    where: { verificationToken },
  });

  if (!dsar) {
    return { error: "Invalid verification token" };
  }

  if (dsar.verifiedAt) {
    return { error: "Request already verified" };
  }

  try {
    await db.dataSubjectRequest.update({
      where: { id: dsar.id },
      data: {
        verifiedAt: new Date(),
        status: "verified",
      },
    });

    await db.dsarActivity.create({
      data: {
        dsarId: dsar.id,
        action: "verified",
        description: "Email verification completed",
        performedBy: "requester",
      },
    });

    revalidatePath("/dashboard/dsar");

    return { success: true };
  } catch (error) {
    console.error("Failed to verify DSAR:", error);
    return { error: "Verification failed" };
  }
}

/**
 * Get all DSARs for user's websites
 */
export async function getDsarList(): Promise<DsarListItem[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check feature access
  await requireFeature("dsarManagement");

  const dsars = await db.dataSubjectRequest.findMany({
    where: {
      website: { userId: session.user.id },
    },
    include: {
      website: { select: { name: true } },
      _count: { select: { activities: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return dsars;
}

/**
 * Get DSARs for a specific website
 */
export async function getWebsiteDsars(websiteId: string): Promise<DsarListItem[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dsars = await db.dataSubjectRequest.findMany({
    where: {
      websiteId,
      website: { userId: session.user.id },
    },
    include: {
      website: { select: { name: true } },
      _count: { select: { activities: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return dsars;
}

/**
 * Get a single DSAR with full details
 */
export async function getDsar(dsarId: string): Promise<DsarWithRelations | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dsar = await db.dataSubjectRequest.findFirst({
    where: {
      id: dsarId,
      website: { userId: session.user.id },
    },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      website: { select: { name: true, url: true } },
    },
  });

  return dsar;
}

/**
 * Update a DSAR
 */
export async function updateDsar(dsarId: string, values: DsarUpdateInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = dsarUpdateSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const dsar = await db.dataSubjectRequest.findFirst({
    where: {
      id: dsarId,
      website: { userId: session.user.id },
    },
  });

  if (!dsar) {
    return { error: "DSAR not found" };
  }

  const { status, priority, assignedTo, internalNotes, responseContent } = validatedFields.data;

  try {
    const updateData: Record<string, unknown> = {};
    const activities: { action: DsarActivityAction; description: string }[] = [];

    if (status && status !== dsar.status) {
      updateData.status = status;
      activities.push({
        action: "status_changed",
        description: `Status changed from ${dsar.status} to ${status}`,
      });

      if (status === "completed") {
        updateData.completedAt = new Date();
        activities.push({
          action: "completed",
          description: "Request marked as completed",
        });
      }
    }

    if (priority && priority !== dsar.priority) {
      updateData.priority = priority;
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
      if (assignedTo) {
        activities.push({
          action: "assigned",
          description: `Request assigned to team member`,
        });
      }
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
      activities.push({
        action: "note_added",
        description: "Internal notes updated",
      });
    }

    if (responseContent !== undefined) {
      updateData.responseContent = responseContent;
      activities.push({
        action: "response_drafted",
        description: "Response content drafted",
      });
    }

    await db.dataSubjectRequest.update({
      where: { id: dsarId },
      data: updateData,
    });

    // Create activity records
    for (const activity of activities) {
      await db.dsarActivity.create({
        data: {
          dsarId,
          action: activity.action,
          description: activity.description,
          performedBy: session.user.id,
        },
      });
    }

    revalidatePath("/dashboard/dsar");
    revalidatePath(`/dashboard/dsar/${dsarId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update DSAR:", error);
    return { error: "Failed to update request" };
  }
}

/**
 * Add a note to a DSAR
 */
export async function addDsarNote(dsarId: string, note: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dsar = await db.dataSubjectRequest.findFirst({
    where: {
      id: dsarId,
      website: { userId: session.user.id },
    },
  });

  if (!dsar) {
    return { error: "DSAR not found" };
  }

  try {
    await db.dsarActivity.create({
      data: {
        dsarId,
        action: "note_added",
        description: note,
        performedBy: session.user.id,
      },
    });

    revalidatePath(`/dashboard/dsar/${dsarId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to add note:", error);
    return { error: "Failed to add note" };
  }
}

/**
 * Complete a DSAR and send response
 */
export async function completeDsar(dsarId: string, responseContent: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dsar = await db.dataSubjectRequest.findFirst({
    where: {
      id: dsarId,
      website: { userId: session.user.id },
    },
  });

  if (!dsar) {
    return { error: "DSAR not found" };
  }

  try {
    await db.dataSubjectRequest.update({
      where: { id: dsarId },
      data: {
        status: "completed",
        responseContent,
        completedAt: new Date(),
      },
    });

    await db.dsarActivity.create({
      data: {
        dsarId,
        action: "completed",
        description: "Request completed and response sent",
        performedBy: session.user.id,
      },
    });

    // TODO: Send response email to requester

    revalidatePath("/dashboard/dsar");
    revalidatePath(`/dashboard/dsar/${dsarId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to complete DSAR:", error);
    return { error: "Failed to complete request" };
  }
}

/**
 * Reject a DSAR
 */
export async function rejectDsar(dsarId: string, reason: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const dsar = await db.dataSubjectRequest.findFirst({
    where: {
      id: dsarId,
      website: { userId: session.user.id },
    },
  });

  if (!dsar) {
    return { error: "DSAR not found" };
  }

  try {
    await db.dataSubjectRequest.update({
      where: { id: dsarId },
      data: {
        status: "rejected",
        responseContent: reason,
        completedAt: new Date(),
      },
    });

    await db.dsarActivity.create({
      data: {
        dsarId,
        action: "rejected",
        description: `Request rejected: ${reason}`,
        performedBy: session.user.id,
      },
    });

    // TODO: Send rejection email to requester

    revalidatePath("/dashboard/dsar");
    revalidatePath(`/dashboard/dsar/${dsarId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to reject DSAR:", error);
    return { error: "Failed to reject request" };
  }
}

/**
 * Get DSAR statistics
 */
export async function getDsarStats() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    db.dataSubjectRequest.count({
      where: { website: { userId: session.user.id } },
    }),
    db.dataSubjectRequest.count({
      where: { 
        website: { userId: session.user.id },
        status: { in: ["pending", "verified"] },
      },
    }),
    db.dataSubjectRequest.count({
      where: { 
        website: { userId: session.user.id },
        status: "in_progress",
      },
    }),
    db.dataSubjectRequest.count({
      where: { 
        website: { userId: session.user.id },
        status: "completed",
      },
    }),
    db.dataSubjectRequest.count({
      where: { 
        website: { userId: session.user.id },
        status: { notIn: ["completed", "rejected"] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return { total, pending, inProgress, completed, overdue };
}



