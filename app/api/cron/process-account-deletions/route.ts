import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permanentlyDeleteUser } from "@/lib/actions/user";

/**
 * Cron job to process account deletions after 30-day grace period
 * This should run daily (recommended: 2 AM UTC)
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-account-deletions",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * 
 * Or call manually/via external cron service:
 * curl -X GET -H "Authorization: Bearer CRON_SECRET" https://yourdomain.com/api/cron/process-account-deletions
 */
export async function GET(request: Request) {
  // Verify the request is authorized (from Vercel Cron or external service)
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== expectedAuth) {
    console.warn("Unauthorized cron request attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all users marked for deletion where grace period (30 days) has passed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersToDelete = await db.user.findMany({
      where: {
        deletedAt: {
          lte: thirtyDaysAgo, // Deleted at least 30 days ago
        },
        anonymizedAt: null, // Not already processed
      },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    console.log(
      `[Account Deletion Cron] Found ${usersToDelete.length} users to process`
    );

    const results = {
      totalFound: usersToDelete.length,
      processed: 0,
      anonymized: 0,
      fullyDeleted: 0,
      errors: 0,
      errorDetails: [] as { userId: string; error: string }[],
    };

    // Process each user
    for (const user of usersToDelete) {
      try {
        console.log(
          `[Account Deletion Cron] Processing user ${user.id} (deleted on: ${user.deletedAt})`
        );

        const result = await permanentlyDeleteUser(user.id);

        if (result.success) {
          results.processed++;
          if (result.anonymized) {
            results.anonymized++;
            console.log(
              `[Account Deletion Cron] ✓ Anonymized user: ${user.id}`
            );
          } else {
            results.fullyDeleted++;
            console.log(
              `[Account Deletion Cron] ✓ Fully deleted user: ${user.id}`
            );
          }
        } else {
          results.errors++;
          results.errorDetails.push({
            userId: user.id,
            error: result.error || "Unknown error",
          });
          console.error(
            `[Account Deletion Cron] ✗ Failed to process user ${user.id}:`,
            result.error
          );
        }
      } catch (error) {
        results.errors++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errorDetails.push({
          userId: user.id,
          error: errorMessage,
        });
        console.error(
          `[Account Deletion Cron] ✗ Exception processing user ${user.id}:`,
          error
        );
      }
    }

    console.log(
      `[Account Deletion Cron] Complete. Processed: ${results.processed}, Anonymized: ${results.anonymized}, Fully Deleted: ${results.fullyDeleted}, Errors: ${results.errors}`
    );

    return NextResponse.json({
      success: true,
      message: "Account deletion processing complete",
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("[Account Deletion Cron] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Prevent direct browser access
 */
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use GET." },
    { status: 405 }
  );
}
