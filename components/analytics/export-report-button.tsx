"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "sonner";
import { exportAnalyticsReport } from "@/lib/actions/analytics";
import type { DateRange, OverallAnalytics } from "@/lib/analytics/types";

interface ExportReportButtonProps {
  dateRange: DateRange;
  analytics: OverallAnalytics;
}

export function ExportReportButton({
  dateRange,
  analytics,
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportText = async () => {
    try {
      setIsExporting(true);
      const report = await exportAnalyticsReport(dateRange);

      // Download as text file
      const blob = new Blob([report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliancekit-report-${dateRange}-${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      setIsExporting(true);

      // Build CSV data
      const lines: string[] = [
        "Metric,Value",
        `Compliance Score,${analytics.complianceScore}%`,
        `Total Consents,${analytics.consentMetrics.total}`,
        `Consent Acceptance Rate,${analytics.consentMetrics.acceptanceRate}%`,
        `Accepted All,${analytics.consentMetrics.acceptedAll}`,
        `Rejected All,${analytics.consentMetrics.rejectedAll}`,
        `Partial Consent,${analytics.consentMetrics.partial}`,
        `Analytics Consents,${analytics.consentMetrics.byCategory.analytics}`,
        `Marketing Consents,${analytics.consentMetrics.byCategory.marketing}`,
        `Functional Consents,${analytics.consentMetrics.byCategory.functional}`,
        `Total Scans,${analytics.scanMetrics.totalScans}`,
        `Average Scan Score,${analytics.scanMetrics.averageScore}%`,
        `Cookies Found,${analytics.scanMetrics.cookiesFound}`,
        `Scripts Found,${analytics.scanMetrics.scriptsFound}`,
        `Total Findings,${analytics.scanMetrics.findingsCount}`,
        `Critical Findings,${analytics.scanMetrics.findingsBySeverity.critical}`,
        `High Findings,${analytics.scanMetrics.findingsBySeverity.high}`,
        `Medium Findings,${analytics.scanMetrics.findingsBySeverity.medium}`,
        `Low Findings,${analytics.scanMetrics.findingsBySeverity.low}`,
        `Info Findings,${analytics.scanMetrics.findingsBySeverity.info}`,
        `Total DSARs,${analytics.dsarMetrics.total}`,
        `Pending DSARs,${analytics.dsarMetrics.pending}`,
        `In Progress DSARs,${analytics.dsarMetrics.inProgress}`,
        `Completed DSARs,${analytics.dsarMetrics.completed}`,
        `Rejected DSARs,${analytics.dsarMetrics.rejected}`,
        `Overdue DSARs,${analytics.dsarMetrics.overdue}`,
        `Avg DSAR Response Time (days),${analytics.dsarMetrics.averageResponseTime}`,
      ];

      const csv = lines.join("\n");

      // Download as CSV file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliancekit-metrics-${dateRange}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportText}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Text Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

