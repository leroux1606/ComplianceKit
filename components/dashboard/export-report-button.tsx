"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportReportButtonProps {
  scanId: string;
  websiteName: string;
}

export function ExportReportButton({ scanId, websiteName }: ExportReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleExport() {
    setIsGenerating(true);
    
    try {
      // Call server API to generate PDF
      const response = await fetch(`/api/scans/${scanId}/export`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF");
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${websiteName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-compliance-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(`Failed to generate PDF report: ${(error as Error).message}`);
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
