import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRateLimit, RateLimitPresets } from "@/lib/rate-limit";

/**
 * GET /api/dsar/[embedCode]/verify?token=xxx - Verify a DSAR submission
 */
export const GET = withRateLimit(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  try {
    await params; // Consume params even if not used
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const dsar = await db.dataSubjectRequest.findUnique({
      where: { verificationToken: token },
    });

    if (!dsar) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 404 }
      );
    }

    // Check token expiration (72-hour window)
    if (dsar.verificationTokenExpiresAt && new Date() > dsar.verificationTokenExpiresAt) {
      return NextResponse.json(
        { error: "Verification token has expired. Please submit a new request." },
        { status: 410 }
      );
    }

    if (dsar.verifiedAt) {
      return NextResponse.json({
        success: true,
        message: "Your request has already been verified.",
        alreadyVerified: true,
      });
    }

    // Update DSAR as verified
    await db.dataSubjectRequest.update({
      where: { id: dsar.id },
      data: {
        verifiedAt: new Date(),
        status: "verified",
      },
    });

    // Create activity
    await db.dsarActivity.create({
      data: {
        dsarId: dsar.id,
        action: "verified",
        description: "Email verification completed",
        performedBy: "requester",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your request has been verified. We will process it within 30 days.",
    });
  } catch (error) {
    console.error("DSAR verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}, RateLimitPresets.strict);



