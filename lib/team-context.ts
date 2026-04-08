import { cookies } from "next/headers";
import { db } from "@/lib/db";

export type TeamRole = "owner" | "admin" | "viewer";

export interface TeamContext {
  /** The userId whose data should be queried (owner or the logged-in user) */
  ownerId: string;
  /** True when the logged-in user is viewing someone else's account */
  isTeamMember: boolean;
  /** Role within the active account */
  role: TeamRole;
}

/**
 * Returns the effective owner context for the current request.
 *
 * - If the user is viewing their own account: ownerId = sessionUserId, role = "owner"
 * - If they've switched to another account via `ck_active_owner` cookie:
 *   validates the team membership and returns that owner's ID + role
 */
export async function getTeamContext(sessionUserId: string): Promise<TeamContext> {
  const cookieStore = await cookies();
  const activeOwnerCookie = cookieStore.get("ck_active_owner")?.value;

  if (!activeOwnerCookie || activeOwnerCookie === sessionUserId) {
    return { ownerId: sessionUserId, isTeamMember: false, role: "owner" };
  }

  const member = await db.teamMember.findFirst({
    where: {
      ownerId: activeOwnerCookie,
      userId: sessionUserId,
      status: "active",
    },
    select: { role: true },
  });

  if (!member) {
    // Cookie is stale / invalid — fall back to own account
    return { ownerId: sessionUserId, isTeamMember: false, role: "owner" };
  }

  return {
    ownerId: activeOwnerCookie,
    isTeamMember: true,
    role: member.role as TeamRole,
  };
}

/**
 * Returns true if the role can perform write/mutating operations.
 */
export function canWrite(role: TeamRole): boolean {
  return role === "owner" || role === "admin";
}
