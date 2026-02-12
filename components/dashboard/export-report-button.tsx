"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { ScanReportPDF } from "@/lib/pdf/scan-report";

interface ExportReportButtonProps {
  website: {
    name: string;
    url: string;
  };
  scan: {
    score: number | null;
    createdAt: Date;
    cookies: Array<{
      name: string;
      domain: string;
      category: string | null;
      secure: boolean;
      expires: Date | null;
    }>;
    scripts: Array<{
      name: string | null;
      category: string | null;
      type: string;
      url: string | null;
    }>;
    findings: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
      recommendation: string | null;
    }>;
  };
}

export function ExportReportButton({ website, scan }: ExportReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleExport() {
    setIsGenerating(true);
    
    try {
      // Generate PDF
      const blob = await pdf(
        <ScanReportPDF website={website} scan={scan} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${website.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-compliance-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={isGenerating} variant="outline">
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
