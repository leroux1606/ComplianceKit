import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeScan } from "@/lib/scan-runner";
import { verifyCronRequest } from "@/lib/cron-auth";
import { sendScanScoreDropEmail } from "@/lib/email";

// Process at most this many scans per cron invocation to stay within
// Vercel function timeout limits. The cron runs every 6 hours, so
// remaining websites will be picked up in the next invocation.
const BATCH_SIZE = 5;

// Stop processing if we've been running longer than this (in ms).
// Vercel Pro allows 60s, Enterprise 300s. Leave headroom for the
// response and score-drop email sends.
const MAX_RUNTIME_MS = 50_000; // 50 seconds

/**
 * Scheduled scans cron.
 *
 * Runs every 6 hours. Picks up to BATCH_SIZE websites whose
 * nextScheduledScanAt is in the past, triggers a scan, advances
 * nextScheduledScanAt, and emails the owner if the compliance score
 * dropped by 5+ points vs the previous scan.
 *
 * Websites are ordered by nextScheduledScanAt (oldest first) so that
 * no website gets permanently starved across invocations.
 *
 * vercel.json schedule: every 2 hours at minute 0
 *
 * Manual trigger:
 *   curl -H "Authorization: Bearer CRON_SECRET" https://yourdomain.com/api/cron/scheduled-scans
 */
export async function GET(request: Request) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const now = new Date();
  const startedAt = Date.now();
  const results = { triggered: 0, skipped: 0, errors: 0, totalDue: 0 };

  // Find websites due for a scheduled scan, limited to BATCH_SIZE.
  // Oldest-due first so no website is permanently starved.
  const websites = await db.website.findMany({
    where: {
      scanSchedule: { not: "none" },
      nextScheduledScanAt: { lte: now },
      status: "active",
      scans: { none: { status: { in: ["queued", "running"] } } },
    },
    orderBy: { nextScheduledScanAt: "asc" },
    take: BATCH_SIZE,
    include: {
      user: { select: { email: true, name: true } },
      scans: {
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { id: true, score: true, status: true },
      },
    },
  });

  // Also count the total due so we can report how many are queued
  const totalDue = await db.website.count({
    where: {
      scanSchedule: { not: "none" },
      nextScheduledScanAt: { lte: now },
      status: "active",
      scans: { none: { status: { in: ["queued", "running"] } } },
    },
  });
  results.totalDue = totalDue;

  for (const website of websites) {
    // Time guard: stop if we're approaching the function timeout
    if (Date.now() - startedAt > MAX_RUNTIME_MS) {
      console.log(`[Scheduled Scans] Time limit reached after ${results.triggered} scans, deferring rest`);
      break;
    }

    try {
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
  const remaining = totalDue - results.triggered;
  console.log(
    `[Scheduled Scans] Done. Triggered: ${results.triggered}, Errors: ${results.errors}, Remaining: ${remaining}, Duration: ${durationMs}ms`
  );

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    durationMs,
    results: { ...results, remaining },
  });
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed. Use GET." }, { status: 405 });
}
