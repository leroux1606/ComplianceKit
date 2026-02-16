"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Scanner } from "@/lib/scanner";
import { checkPlanLimit } from "@/lib/actions/subscription";
import type { Scan, Cookie, Script, Finding } from "@prisma/client";

export type ScanWithRelations = Scan & {
  cookies: Cookie[];
  scripts: Script[];
  findings: Finding[];
};

/**
 * Trigger a new scan for a website
 */
export async function triggerScan(websiteId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check plan limits
  // TEMPORARILY DISABLED FOR DEBUGGING
  // const limitCheck = await checkPlanLimit("scans");
  // if (!limitCheck.allowed) {
  //   return { 
  //     error: `You've reached your monthly scan limit of ${limitCheck.limit}. Please upgrade to run more scans.`,
  //     limitReached: true
  //   };
  // }

  // Verify ownership
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
  });

  if (!website) {
    return { error: "Website not found" };
  }

  // Create scan record with pending status
  const scan = await db.scan.create({
    data: {
      websiteId,
      status: "pending",
    },
  });

  try {
    // Update status to running
    await db.scan.update({
      where: { id: scan.id },
      data: {
        status: "running",
        startedAt: new Date(),
      },
    });

    // Update website status
    await db.website.update({
      where: { id: websiteId },
      data: { status: "scanning" },
    });

    // Run the scan
    console.log('[SCAN START]', { websiteId, url: website.url });
    const scanner = new Scanner({ url: website.url });
    const result = await scanner.scan();
    console.log('[SCAN COMPLETE]', { 
      websiteId, 
      url: website.url, 
      success: result.success,
      score: result.score,
      duration: result.duration,
    });

    if (!result.success) {
      // Scan failed
      console.error('[SCAN FAILED]', {
        websiteId,
        url: website.url,
        error: result.error,
        duration: result.duration,
      });
      
      await db.scan.update({
        where: { id: scan.id },
        data: {
          status: "failed",
          error: result.error,
          completedAt: new Date(),
        },
      });

      await db.website.update({
        where: { id: websiteId },
        data: {
          status: "error",
          lastScanAt: new Date(),
          lastScanStatus: "failed",
        },
      });

      revalidatePath(`/dashboard/websites/${websiteId}`);
      return { error: result.error || "Scan failed" };
    }

    // Save cookies
    if (result.cookies.length > 0) {
      await db.cookie.createMany({
        data: result.cookies.map((cookie) => ({
          scanId: scan.id,
          name: cookie.name,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
          expires: cookie.expires,
          category: cookie.category,
          description: cookie.description,
        })),
      });
    }

    // Save scripts
    if (result.scripts.length > 0) {
      await db.script.createMany({
        data: result.scripts.map((script) => ({
          scanId: scan.id,
          url: script.url,
          content: script.content,
          type: script.type,
          category: script.category,
          name: script.name,
        })),
      });
    }

    // Save findings
    if (result.findings.length > 0) {
      await db.finding.createMany({
        data: result.findings.map((finding) => ({
          scanId: scan.id,
          type: finding.type,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          recommendation: finding.recommendation,
        })),
      });
    }

    // Update scan as completed
    await db.scan.update({
      where: { id: scan.id },
      data: {
        status: "completed",
        score: result.score,
        completedAt: new Date(),
      },
    });

    // Update website
    await db.website.update({
      where: { id: websiteId },
      data: {
        status: "active",
        lastScanAt: new Date(),
        lastScanStatus: "completed",
      },
    });

    revalidatePath(`/dashboard/websites/${websiteId}`);
    revalidatePath("/dashboard");

    return { success: true, scanId: scan.id, score: result.score };
  } catch (error) {
    console.error("[SCAN EXCEPTION]", {
      websiteId,
      url: website.url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Update scan as failed
    await db.scan.update({
      where: { id: scan.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    });

    // Update website status
    await db.website.update({
      where: { id: websiteId },
      data: {
        status: "error",
        lastScanAt: new Date(),
        lastScanStatus: "failed",
      },
    });

    revalidatePath(`/dashboard/websites/${websiteId}`);
    return { error: "Scan failed unexpectedly" };
  }
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

