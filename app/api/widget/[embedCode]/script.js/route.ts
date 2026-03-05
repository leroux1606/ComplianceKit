import { NextRequest, NextResponse } from "next/server";

/**
 * Legacy widget script endpoint — backward compatibility shim.
 *
 * The canonical widget is now the static file at /widget.js, which is served
 * directly by Next.js (public/) with zero serverless cost and full CDN
 * cacheability.
 *
 * This route exists so that any embed codes using the old URL format
 *   <script src="/api/widget/[embedCode]/script.js">
 * continue to work. It returns a tiny bootstrap that loads /widget.js and
 * passes the embedCode via a data attribute — no database lookup required.
 *
 * Cache-Control: immutable for 24 hours. A CDN will serve this from edge
 * for the vast majority of requests, eliminating serverless invocations.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  const { embedCode } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // Minimal validation: embedCode must be non-empty alphanumeric-ish string
  if (!embedCode || !/^[a-zA-Z0-9_-]{4,64}$/.test(embedCode)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Bootstrap: load the universal static widget with this embed code.
  // Constructed without template injection risk — embedCode is validated above
  // and JSON.stringify provides additional safety for the attribute value.
  const safeCode = JSON.stringify(embedCode);
  const bootstrap = `(function(){var s=document.createElement('script');s.src=${JSON.stringify(appUrl + "/widget.js")};s.setAttribute('data-embed-code',${safeCode});document.head.appendChild(s);})();`;

  return new NextResponse(bootstrap, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      // Cache aggressively — content is identical for every request with same embedCode.
      // 24 h CDN cache, 7 day stale-while-revalidate.
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
