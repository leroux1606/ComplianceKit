"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTeamInviteEmail } from "@/lib/email";
import { getUserFeatures } from "@/lib/actions/subscription";
import { isWithinLimit } from "@/lib/plans";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TeamMemberWithUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedAt: Date;
  acceptedAt: Date | null;
  user: { id: string; name: string | null; image: string | null } | null;
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get all team members for the current user's account.
 */
export async function getTeamMembers(): Promise<TeamMemberWithUser[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.teamMember.findMany({
    where: { ownerId: session.user.id, status: { not: "revoked" } },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      invitedAt: true,
      acceptedAt: true,
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { invitedAt: "desc" },
  });
}

/**
 * Get all accounts the current user is an active member of.
 */
export async function getMyTeamMemberships() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.teamMember.findMany({
    where: { userId: session.user.id, status: "active" },
    select: {
      id: true,
      role: true,
      owner: { select: { id: true, name: true, email: true, companyName: true } },
    },
    orderBy: { acceptedAt: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Invite
// ---------------------------------------------------------------------------

export async function inviteTeamMember(email: string, role: "admin" | "viewer") {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { error: "Unauthorized" };

  // Must not invite yourself
  if (email.toLowerCase() === session.user.email.toLowerCase()) {
    return { error: "You cannot invite yourself." };
  }

  // Check plan allows team members
  const features = await getUserFeatures();
  const existingCount = await db.teamMember.count({
    where: { ownerId: session.user.id, status: { not: "revoked" } },
  });

  // features.teamMembers includes the owner themselves, so limit is teamMembers - 1 for invitees
  const maxInvites = features.teamMembers === -1 ? Infinity : features.teamMembers - 1;
  if (maxInvites <= 0) {
    return { error: "Your plan does not support team members. Upgrade to Professional or Enterprise." };
  }
  if (!isWithinLimit(features, "teamMembers", existingCount + 1)) {
    return {
      error: `You have reached your team member limit (${features.teamMembers - 1} invitee${features.teamMembers - 1 !== 1 ? "s" : ""} on your plan). Upgrade to add more.`,
    };
  }

  // Upsert: re-invite if previously revoked
  let member = await db.teamMember.findFirst({
    where: { ownerId: session.user.id, email: email.toLowerCase() },
  });

  if (member) {
    if (member.status === "active") {
      return { error: "This person is already a team member." };
    }
    if (member.status === "pending") {
      return { error: "An invitation is already pending for this email." };
    }
    // Re-invite revoked member
    member = await db.teamMember.update({
      where: { id: member.id },
      data: {
        role,
        status: "pending",
        inviteToken: crypto.randomUUID(),
        invitedAt: new Date(),
        acceptedAt: null,
      },
    });
  } else {
    member = await db.teamMember.create({
      data: {
        ownerId: session.user.id,
        email: email.toLowerCase(),
        role,
      },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendTeamInviteEmail({
    to: email,
    inviterName: session.user.name || session.user.email,
    inviterEmail: session.user.email,
    role,
    acceptUrl: `${appUrl}/accept-invite?token=${member.inviteToken}`,
  }).catch((err) => console.error("[Team] Invite email failed:", err));

  revalidatePath("/dashboard/team");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Accept invite
// ---------------------------------------------------------------------------

export async function acceptTeamInvite(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to accept this invitation." };

  const member = await db.teamMember.findUnique({
    where: { inviteToken: token },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  if (!member) return { error: "Invitation not found or already used." };
  if (member.status !== "pending") return { error: "This invitation has already been accepted or revoked." };

  // Cannot accept your own team invite
  if (member.ownerId === session.user.id) return { error: "You cannot accept your own invitation." };

  await db.teamMember.update({
    where: { id: member.id },
    data: {
      userId: session.user.id,
      status: "active",
      acceptedAt: new Date(),
      // Update email to match the actual user's email in case they signed up differently
      email: session.user.email!.toLowerCase(),
    },
  });

  revalidatePath("/dashboard/team");
  return { success: true, ownerName: member.owner.name || member.owner.email };
}

// ---------------------------------------------------------------------------
// Manage members
// ---------------------------------------------------------------------------

export async function updateMemberRole(memberId: string, role: "admin" | "viewer") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const member = await db.teamMember.findFirst({
    where: { id: memberId, ownerId: session.user.id },
  });
  if (!member) return { error: "Member not found." };

  await db.teamMember.update({ where: { id: memberId }, data: { role } });
  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function revokeTeamMember(memberId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const member = await db.teamMember.findFirst({
    where: { id: memberId, ownerId: session.user.id },
  });
  if (!member) return { error: "Member not found." };

  await db.teamMember.update({
    where: { id: memberId },
    data: { status: "revoked", userId: null },
  });

  revalidatePath("/dashboard/team");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Account switching
// ---------------------------------------------------------------------------

/**
 * Switch to viewing another account. Sets a cookie that all data queries read.
 * Pass null to switch back to own account.
 */
export async function switchActiveAccount(ownerId: string | null) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const cookieStore = await cookies();

  if (!ownerId || ownerId === session.user.id) {
    cookieStore.delete("ck_active_owner");
    redirect("/dashboard");
  }

  // Validate membership
  const member = await db.teamMember.findFirst({
    where: { ownerId, userId: session.user.id, status: "active" },
  });

  if (!member) return { error: "You are not a member of this account." };

  cookieStore.set("ck_active_owner", ownerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 h
    path: "/",
  });

  redirect("/dashboard");
}
