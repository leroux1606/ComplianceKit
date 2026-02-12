"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
