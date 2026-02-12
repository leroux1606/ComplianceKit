import { NextRequest, NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ScanReportPDF } from "@/lib/pdf/scan-report";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { scanId } = await params;
    
    // Get scan with all relations
    const scan = await db.scan.findFirst({
      where: {
        id: scanId,
        website: {
          userId: session.user.id,
        },
      },
      include: {
        cookies: true,
        scripts: true,
        findings: true,
        website: true,
      },
    });

    if (!scan) {
      return new NextResponse("Scan not found", { status: 404 });
    }

    // Generate PDF stream
    const stream = await ReactPDF.renderToStream(
      <ScanReportPDF 
        website={{
          name: scan.website.name,
          url: scan.website.url,
        }} 
        scan={scan} 
      />
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Generate filename
    const filename = `${scan.website.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-compliance-report-${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF: " + (error as Error).message, { status: 500 });
  }
}
