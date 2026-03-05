import { db } from "@/lib/db";
import { Scanner } from "@/lib/scanner";
import { revalidatePath } from "next/cache";

/**
 * Execute a scan that has already been created with status "queued".
 * Updates the scan record through running → completed/failed.
 * Called from the /api/scans/[id]/run route handler.
 */
export async function executeScan(
  scanId: string,
  websiteId: string,
  url: string
): Promise<void> {
  try {
    await db.scan.update({
      where: { id: scanId },
      data: { status: "running", startedAt: new Date() },
    });

    await db.website.update({
      where: { id: websiteId },
      data: { status: "scanning" },
    });

    console.log("[SCAN START]", { scanId, websiteId, url });
    const scanner = new Scanner({ url });
    const result = await scanner.scan();
    console.log("[SCAN COMPLETE]", {
      scanId,
      websiteId,
      url,
      success: result.success,
      score: result.score,
      duration: result.duration,
    });

    if (!result.success) {
      console.error("[SCAN FAILED]", { scanId, websiteId, url, error: result.error });
      await db.scan.update({
        where: { id: scanId },
        data: { status: "failed", error: result.error, completedAt: new Date() },
      });
      await db.website.update({
        where: { id: websiteId },
        data: { status: "error", lastScanAt: new Date(), lastScanStatus: "failed" },
      });
      revalidatePath(`/dashboard/websites/${websiteId}`);
      return;
    }

    if (result.cookies.length > 0) {
      await db.cookie.createMany({
        data: result.cookies.map((cookie) => ({
          scanId,
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

    if (result.scripts.length > 0) {
      await db.script.createMany({
        data: result.scripts.map((script) => ({
          scanId,
          url: script.url,
          content: script.content,
          type: script.type,
          category: script.category,
          name: script.name,
        })),
      });
    }

    if (result.findings.length > 0) {
      await db.finding.createMany({
        data: result.findings.map((finding) => ({
          scanId,
          type: finding.type,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          recommendation: finding.recommendation,
        })),
      });
    }

    await db.scan.update({
      where: { id: scanId },
      data: { status: "completed", score: result.score, completedAt: new Date() },
    });

    await db.website.update({
      where: { id: websiteId },
      data: { status: "active", lastScanAt: new Date(), lastScanStatus: "completed" },
    });

    revalidatePath(`/dashboard/websites/${websiteId}`);
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("[SCAN EXCEPTION]", {
      scanId,
      websiteId,
      url,
      error: error instanceof Error ? error.message : String(error),
    });

    await db.scan
      .update({
        where: { id: scanId },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      })
      .catch(() => {});

    await db.website
      .update({
        where: { id: websiteId },
        data: { status: "error", lastScanAt: new Date(), lastScanStatus: "failed" },
      })
      .catch(() => {});

    revalidatePath(`/dashboard/websites/${websiteId}`);
  }
}
