import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeScan } from "@/lib/scan-runner";
import { sendScanScoreDropEmail } from "@/lib/email";

/**
 * Scheduled scans cron.
 *
 * Runs every 6 hours. Finds websites whose nextScheduledScanAt is in the past,
 * triggers a scan, advances nextScheduledScanAt, and emails the owner if the
 * compliance score dropped by 5+ points vs the previous scan.
 *
 * vercel.json: schedule "0 every-6-hours * * *" (0 at minute 0, every 6th hour)
 *
 * Manual trigger:
 *   curl -H "Authorization: Bearer CRON_SECRET" https://yourdomain.com/api/cron/scheduled-scans
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startedAt = Date.now();
  const results = { triggered: 0, skipped: 0, errors: 0 };

  // Find all websites due for a scheduled scan
  const websites = await db.website.findMany({
    where: {
      scanSchedule: { not: "none" },
      nextScheduledScanAt: { lte: now },
      status: "active",
      // Skip websites that already have a scan running
      scans: { none: { status: { in: ["queued", "running"] } } },
    },
    include: {
      user: { select: { email: true, name: true } },
      scans: {
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { id: true, score: true, status: true },
      },
    },
  });

  for (const website of websites) {
    try {
      // Create a scan record
      const scan = await db.scan.create({
        data: {
          websiteId: website.id,
          status: "queued",
          startedAt: new Date(),
        },
      });

      // Advance next scheduled scan time
      const next = new Date();
      if (website.scanSchedule === "weekly") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setMonth(next.getMonth() + 1);
      }

      await db.website.update({
        where: { id: website.id },
        data: { nextScheduledScanAt: next },
      });

      // Run scan synchronously (cron has generous timeout)
      await executeScan(scan.id, website.id, website.url);

      // Reload completed scan to get score
      const completedScan = await db.scan.findUnique({
        where: { id: scan.id },
        select: { id: true, score: true },
      });

      // Check for score drop — compare to previous completed scan
      const previousScan = website.scans.find((s) => s.status === "completed");
      if (
        completedScan?.score !== null &&
        completedScan?.score !== undefined &&
        previousScan?.score !== null &&
        previousScan?.score !== undefined
      ) {
        const drop = previousScan.score - completedScan.score;
        if (drop >= 5 && website.user.email) {
          await sendScanScoreDropEmail({
            to: website.user.email,
            name: website.user.name,
            websiteName: website.name,
            websiteUrl: website.url,
            websiteId: website.id,
            previousScore: previousScan.score,
            newScore: completedScan.score,
            scanId: completedScan.id,
          }).catch((err) => {
            console.error(`[Scheduled Scans] Score drop email failed for ${website.id}:`, err);
          });
        }
      }

      results.triggered++;
    } catch (err) {
      results.errors++;
      console.error(`[Scheduled Scans] Failed for website ${website.id}:`, err);
    }
  }

  const durationMs = Date.now() - startedAt;
  console.log(
    `[Scheduled Scans] Done. Triggered: ${results.triggered}, Skipped: ${results.skipped}, Errors: ${results.errors}, Duration: ${durationMs}ms`
  );

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    durationMs,
    results,
  });
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed. Use GET." }, { status: 405 });
}
