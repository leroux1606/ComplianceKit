import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dsarSubmissionSchema } from "@/lib/validations";
import { calculateDueDate, DSAR_REQUEST_TYPES } from "@/lib/dsar/types";
import { withRateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { sanitizeInput, sanitizeEmail } from "@/lib/sanitize";
import { sendDsarConfirmationEmail, sendDsarOwnerNotificationEmail } from "@/lib/email";

/**
 * POST /api/dsar/[embedCode] - Submit a new DSAR
 */
export const POST = withRateLimit(async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    const { embedCode } = await params;
    const body = await request.json();

    // Validate input
    const validatedFields = dsarSubmissionSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    // Find website by embed code (include owner email for notifications)
    const website = await db.website.findUnique({
      where: { embedCode },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 }
      );
    }

    const { requestType, requesterEmail, requesterName, requesterPhone, description, additionalInfo } =
      validatedFields.data;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(requesterEmail);
    const sanitizedName = requesterName ? sanitizeInput(requesterName) : null;
    const sanitizedPhone = requesterPhone ? sanitizeInput(requesterPhone) : null;
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedAdditionalInfo = additionalInfo ? sanitizeInput(additionalInfo) : null;

    // Create DSAR
    // Token expires in 72 hours
    const verificationTokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const dsar = await db.dataSubjectRequest.create({
      data: {
        websiteId: website.id,
        requestType,
        requesterEmail: sanitizedEmail,
        requesterName: sanitizedName,
        requesterPhone: sanitizedPhone,
        description: sanitizedDescription,
        additionalInfo: sanitizedAdditionalInfo,
        dueDate: calculateDueDate(),
        status: "pending",
        priority: "normal",
        verificationTokenExpiresAt,
      },
    });

    // Create initial activity
    await db.dsarActivity.create({
      data: {
        dsarId: dsar.id,
        action: "created",
        description: `DSAR submitted by ${sanitizedEmail}`,
        performedBy: "requester",
        metadata: { requestType },
      },
    });

    // Send emails (A1 + A2) — failures are logged but do not fail the submission
    const requestTypeLabel = DSAR_REQUEST_TYPES[requestType]?.label ?? requestType;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.compliancekit.app';
    const dashboardUrl = `${appUrl}/dashboard/dsar/${dsar.id}`;

    const emailPromises: Promise<unknown>[] = [
      // A1 — confirmation to requester
      sendDsarConfirmationEmail({
        to: sanitizedEmail,
        requesterName: sanitizedName,
        requestTypeLabel,
        referenceId: dsar.id,
        dueDate: dsar.dueDate,
        websiteName: website.name,
        companyName: website.companyName ?? null,
      }),
    ];

    // A2 — notification to website owner
    if (website.user.email) {
      emailPromises.push(
        sendDsarOwnerNotificationEmail({
          to: website.user.email,
          requesterName: sanitizedName,
          requesterEmail: sanitizedEmail,
          requestTypeLabel,
          referenceId: dsar.id,
          dueDate: dsar.dueDate,
          websiteName: website.name,
          dashboardUrl,
        })
      );
    }

    await Promise.allSettled(emailPromises).then((results) => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`[DSAR] Email ${i === 0 ? 'confirmation' : 'owner notification'} failed for DSAR ${dsar.id}:`, result.reason);
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Your request has been submitted successfully.",
      requestId: dsar.id,
    });
  } catch (error) {
    console.error("DSAR submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}, RateLimitPresets.publicForm);

/**
 * GET /api/dsar/[embedCode] - Get DSAR form configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    const { embedCode } = await params;

    const website = await db.website.findUnique({
      where: { embedCode },
      select: {
        id: true,
        name: true,
        companyName: true,
        companyEmail: true,
        dpoName: true,
        dpoEmail: true,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      websiteName: website.name,
      companyName: website.companyName,
      contactEmail: website.dpoEmail || website.companyEmail,
      dpoName: website.dpoName,
    });
  } catch (error) {
    console.error("DSAR config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}



