"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConsentExportButtonProps {
  websiteId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ConsentExportButton({
  websiteId,
  className,
  variant = "outline",
}: ConsentExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/websites/${websiteId}/consent-export`);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Use filename from Content-Disposition if available
      const disposition = response.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "consent-log.csv";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Consent log exported");
    } catch (error) {
      console.error("Consent export error:", error);
      toast.error("Failed to export consent log");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Export Consent Log (CSV)"}
    </Button>
  );
}
