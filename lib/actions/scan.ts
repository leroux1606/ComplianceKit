"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPlanLimit } from "@/lib/actions/subscription";
import type { Scan, Cookie, Script, Finding } from "@prisma/client";

export type ScanWithRelations = Scan & {
  cookies: Cookie[];
  scripts: Script[];
  findings: Finding[];
};

/**
 * Queue a new scan for a website.
 *
 * Returns immediately with the new scanId. The caller is responsible for
 * invoking POST /api/scans/[id]/run (fire-and-forget) to start execution,
 * then polling GET /api/scans/[id]/status for progress.
 */
export async function triggerScan(websiteId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const limitCheck = await checkPlanLimit("scans");
  if (!limitCheck.allowed) {
    return {
      error: `You've reached your monthly scan limit of ${limitCheck.limit}. Please upgrade to run more scans.`,
      limitReached: true,
    };
  }

  const website = await db.website.findFirst({
    where: { id: websiteId, userId: session.user.id },
  });

  if (!website) {
    return { error: "Website not found" };
  }

  const scan = await db.scan.create({
    data: { websiteId, status: "queued" },
  });

  return { success: true, scanId: scan.id };
}

/**
 * Get scan details
 */
export async function getScan(scanId: string): Promise<ScanWithRelations | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const scan = await db.scan.findFirst({
    where: {
      id: scanId,
      website: {
        userId: session.user.id,
      },
    },
    include: {
      cookies: true,
      scripts: true,
      findings: true,
    },
  });

  return scan;
}

/**
 * Get scans for a website
 */
export async function getWebsiteScans(websiteId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const scans = await db.scan.findMany({
    where: {
      websiteId,
      website: {
        userId: session.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          cookies: true,
          scripts: true,
          findings: true,
        },
      },
    },
  });

  return scans;
}

/**
 * Delete a scan
 */
export async function deleteScan(scanId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const scan = await db.scan.findFirst({
    where: {
      id: scanId,
      website: {
        userId: session.user.id,
      },
    },
    include: {
      website: true,
    },
  });

  if (!scan) {
    return { error: "Scan not found" };
  }

  await db.scan.delete({
    where: { id: scanId },
  });

  revalidatePath(`/dashboard/websites/${scan.websiteId}`);
  return { success: true };
}

