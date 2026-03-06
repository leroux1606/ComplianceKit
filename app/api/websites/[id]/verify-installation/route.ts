import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateScanUrl } from "@/lib/ssrf-check";

// How long we wait for the customer's site to respond
const FETCH_TIMEOUT_MS = 10_000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Confirm ownership
  const website = await db.website.findFirst({
    where: { id, userId: session.user.id },
    select: { url: true, embedCode: true },
  });

  if (!website) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { url, embedCode } = website;

  if (!embedCode) {
    return NextResponse.json(
      { detected: false, message: "No embed code has been generated for this website yet." },
      { status: 200 }
    );
  }

  // SSRF protection — reuse the same guard as the scanner
  const check = await validateScanUrl(url);
  if (!check.safe) {
    return NextResponse.json(
      { detected: false, message: `Cannot verify: ${check.reason}` },
      { status: 200 }
    );
  }

  // Fetch the homepage HTML
  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Identify ourselves so site owners can whitelist the checker
        "User-Agent": "ComplianceKit-VerifyBot/1.0",
      },
      // Don't follow more than 3 redirects
      redirect: "follow",
    });

    clearTimeout(timer);

    if (!response.ok) {
      return NextResponse.json(
        {
          detected: false,
          message: `Your website returned HTTP ${response.status}. Make sure the URL is publicly accessible.`,
        },
        { status: 200 }
      );
    }

    html = await response.text();
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Your website took too long to respond (10 s timeout). Try again or check that it is online."
        : "Could not reach your website. Make sure it is publicly accessible.";
    return NextResponse.json({ detected: false, message }, { status: 200 });
  }

  // Check for both the new static format and the legacy dynamic-route format
  const newFormat = `data-embed-code="${embedCode}"`;
  const legacyFormat = `/widget/${embedCode}/script.js`;

  const detected = html.includes(newFormat) || html.includes(legacyFormat);

  if (detected) {
    return NextResponse.json({
      detected: true,
      message: "Widget detected — your banner is installed correctly.",
    });
  }

  return NextResponse.json({
    detected: false,
    message:
      "Widget not detected. Make sure the embed code is in the <head> of every page and the site has been deployed.",
  });
}
