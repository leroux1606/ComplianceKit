import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permanentlyDeleteUser } from "@/lib/actions/user";
import { verifyCronRequest } from "@/lib/cron-auth";
import { logger } from "@/lib/logger";

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
  const authError = verifyCronRequest(request);
  if (authError) return authError;

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

    logger.info("cron.account_deletion.start", { count: usersToDelete.length });

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
        logger.info("cron.account_deletion.processing", { userId: user.id, deletedAt: user.deletedAt });

        const result = await permanentlyDeleteUser(user.id);

        if (result.success) {
          results.processed++;
          if (result.anonymized) {
            results.anonymized++;
            logger.info("cron.account_deletion.anonymized", { userId: user.id });
          } else {
            results.fullyDeleted++;
            logger.info("cron.account_deletion.deleted", { userId: user.id });
          }
        } else {
          results.errors++;
          results.errorDetails.push({
            userId: user.id,
            error: result.error || "Unknown error",
          });
          logger.error("cron.account_deletion.failed", { userId: user.id, error: result.error });
        }
      } catch (error) {
        results.errors++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errorDetails.push({
          userId: user.id,
          error: errorMessage,
        });
        logger.error("cron.account_deletion.exception", { userId: user.id }, error);
      }
    }

    logger.info("cron.account_deletion.complete", results);

    return NextResponse.json({
      success: true,
      message: "Account deletion processing complete",
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    logger.error("cron.account_deletion.fatal", {}, error);
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
