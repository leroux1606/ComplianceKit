import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendOnboardingDay1Email,
  sendOnboardingDay3Email,
  sendOnboardingDay7Email,
} from "@/lib/email";

/**
 * Onboarding email sequence cron (D5).
 *
 * Runs daily at 09:00 UTC. For each time window it finds users who:
 *   Day 1 (24–48 h after signup): have no scans → send "Have you scanned yet?"
 *   Day 3 (72–96 h after signup): have no consents → send "Your banner is ready"
 *   Day 7 (168–192 h after signup): on free plan → send "What Pro unlocks"
 *
 * Secured with CRON_SECRET bearer token (same pattern as other cron routes).
 *
 * vercel.json:
 *   { "path": "/api/cron/onboarding-emails", "schedule": "0 9 * * *" }
 *
 * Manual trigger:
 *   curl -H "Authorization: Bearer CRON_SECRET" https://yourdomain.com/api/cron/onboarding-emails
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    console.error("[Onboarding Emails] CRON_SECRET not configured");
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const now = new Date();

  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  const results = { day1: 0, day3: 0, day7: 0, errors: 0 };

  // -------------------------------------------------------------------------
  // Day 1 — signed up 24–48 h ago, no scans yet
  // -------------------------------------------------------------------------
  try {
    const day1Users = await db.user.findMany({
      where: {
        deletedAt: null,
        email: { not: null },
        createdAt: { gte: hoursAgo(48), lt: hoursAgo(24) },
        websites: {
          none: { scans: { some: {} } },
        },
      },
      select: {
        email: true,
        name: true,
        websites: { select: { id: true }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    });

    for (const user of day1Users) {
      if (!user.email) continue;
      try {
        await sendOnboardingDay1Email({
          to: user.email,
          name: user.name,
          websiteId: user.websites[0]?.id ?? null,
        });
        results.day1++;
      } catch (err) {
        results.errors++;
        console.error(`[Onboarding Emails] Day 1 failed for ${user.email}:`, err);
      }
    }
  } catch (err) {
    results.errors++;
    console.error("[Onboarding Emails] Day 1 query failed:", err);
  }

  // -------------------------------------------------------------------------
  // Day 3 — signed up 72–96 h ago, no consents recorded (banner not live)
  // -------------------------------------------------------------------------
  try {
    const day3Users = await db.user.findMany({
      where: {
        deletedAt: null,
        email: { not: null },
        createdAt: { gte: hoursAgo(96), lt: hoursAgo(72) },
        websites: {
          none: { consents: { some: {} } },
        },
      },
      select: {
        email: true,
        name: true,
        websites: { select: { id: true }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    });

    for (const user of day3Users) {
      if (!user.email) continue;
      try {
        await sendOnboardingDay3Email({
          to: user.email,
          name: user.name,
          websiteId: user.websites[0]?.id ?? null,
        });
        results.day3++;
      } catch (err) {
        results.errors++;
        console.error(`[Onboarding Emails] Day 3 failed for ${user.email}:`, err);
      }
    }
  } catch (err) {
    results.errors++;
    console.error("[Onboarding Emails] Day 3 query failed:", err);
  }

  // -------------------------------------------------------------------------
  // Day 7 — signed up 168–192 h ago, no active paid subscription
  // -------------------------------------------------------------------------
  try {
    const day7Users = await db.user.findMany({
      where: {
        deletedAt: null,
        email: { not: null },
        createdAt: { gte: hoursAgo(192), lt: hoursAgo(168) },
        OR: [
          { subscription: null },
          { subscription: { status: { not: "active" } } },
        ],
      },
      select: { email: true, name: true },
    });

    for (const user of day7Users) {
      if (!user.email) continue;
      try {
        await sendOnboardingDay7Email({ to: user.email, name: user.name });
        results.day7++;
      } catch (err) {
        results.errors++;
        console.error(`[Onboarding Emails] Day 7 failed for ${user.email}:`, err);
      }
    }
  } catch (err) {
    results.errors++;
    console.error("[Onboarding Emails] Day 7 query failed:", err);
  }

  // -------------------------------------------------------------------------

  const durationMs = Date.now() - startedAt;
  console.log(
    `[Onboarding Emails] Done. Day1: ${results.day1}, Day3: ${results.day3}, Day7: ${results.day7}, Errors: ${results.errors}, Duration: ${durationMs}ms`
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
