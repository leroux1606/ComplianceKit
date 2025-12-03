import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/dsar/[embedCode]/verify?token=xxx - Verify a DSAR submission
 */
export async function GET(
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
        { error: "Invalid verification token" },
        { status: 404 }
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
}



