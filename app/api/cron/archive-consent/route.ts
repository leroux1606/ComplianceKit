import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLANS, FREE_TIER } from "@/lib/plans";

/**
 * Cron job to delete consent records older than each user's plan retention period.
 *
 * Retention periods (from lib/plans.ts):
 *   Free tier  →  7 days
 *   Starter    → 30 days
 *   Professional → 90 days
 *   Enterprise → 365 days
 *
 * Scheduled daily at 3 AM UTC (offset from account-deletions at 2 AM).
 *
 * vercel.json:
 *   { "path": "/api/cron/archive-consent", "schedule": "0 3 * * *" }
 *
 * Manual trigger:
 *   curl -H "Authorization: Bearer CRON_SECRET" https://yourdomain.com/api/cron/archive-consent
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    console.error("[Consent Archival] CRON_SECRET not configured");
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    // Load all active users with their websites and subscription plan
    const users = await db.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        subscription: {
          select: { planId: true, status: true },
        },
        websites: {
          select: { id: true },
        },
      },
    });

    const results = {
      usersProcessed: 0,
      totalDeleted: 0,
      errors: 0,
    };

    for (const user of users) {
      if (user.websites.length === 0) continue;

      // Resolve retention days from the user's active subscription plan
      const activePlan =
        user.subscription?.status === "active"
          ? PLANS.find((p) => p.id === user.subscription!.planId)
          : null;

      const retentionDays =
        activePlan?.features.dataRetentionDays ?? FREE_TIER.dataRetentionDays;

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - retentionDays);

      const websiteIds = user.websites.map((w) => w.id);

      try {
        const deleted = await db.consent.deleteMany({
          where: {
            websiteId: { in: websiteIds },
            consentedAt: { lt: cutoff },
          },
        });

        results.usersProcessed++;
        results.totalDeleted += deleted.count;

        if (deleted.count > 0) {
          console.log(
            `[Consent Archival] Deleted ${deleted.count} expired records for user ${user.id} (plan retention: ${retentionDays}d, cutoff: ${cutoff.toISOString()})`
          );
        }
      } catch (err) {
        results.errors++;
        console.error(`[Consent Archival] Failed for user ${user.id}:`, err);
      }
    }

    const durationMs = Date.now() - startedAt;
    console.log(
      `[Consent Archival] Done. Users processed: ${results.usersProcessed}, Records deleted: ${results.totalDeleted}, Errors: ${results.errors}, Duration: ${durationMs}ms`
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      results,
    });
  } catch (error) {
    console.error("[Consent Archival] Fatal error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed. Use GET." }, { status: 405 });
}
