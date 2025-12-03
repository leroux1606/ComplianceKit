import { Suspense } from "react";
import { getOverallAnalytics } from "@/lib/actions/analytics";
import type { DateRange } from "@/lib/analytics/types";
import { ComplianceGauge } from "@/components/analytics/compliance-gauge";
import { ComplianceScoreChart } from "@/components/analytics/compliance-score-chart";
import { ConsentMetricsChart } from "@/components/analytics/consent-metrics-chart";
import { ConsentTrendChart } from "@/components/analytics/consent-trend-chart";
import { ScanMetricsCard } from "@/components/analytics/scan-metrics-card";
import { DistributionChart } from "@/components/analytics/distribution-chart";
import { DsarMetricsChart } from "@/components/analytics/dsar-metrics-chart";
import { DsarTrendChart } from "@/components/analytics/dsar-trend-chart";
import { DateRangeSelector } from "@/components/analytics/date-range-selector";
import { ExportReportButton } from "@/components/analytics/export-report-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px] md:col-span-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
      <Skeleton className="h-[350px]" />
    </div>
  );
}

async function AnalyticsContent({ dateRange }: { dateRange: DateRange }) {
  const analytics = await getOverallAnalytics(dateRange);

  return (
    <>
      {/* Header with Export */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <DateRangeSelector currentRange={dateRange} />
        </div>
        <ExportReportButton dateRange={dateRange} analytics={analytics} />
      </div>

      {/* Main Dashboard */}
      <div className="space-y-6">
        {/* Compliance Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <ComplianceGauge score={analytics.complianceScore} />
          <div className="md:col-span-2">
            <ComplianceScoreChart data={analytics.complianceScoreTrend} />
          </div>
        </div>

        {/* Consent Analytics */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Consent Analytics</h2>
          <ConsentMetricsChart metrics={analytics.consentMetrics} />
        </div>

        <ConsentTrendChart data={analytics.consentTrend} />

        {/* Scan Analytics */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Scan Analytics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ScanMetricsCard metrics={analytics.scanMetrics} />
            <DistributionChart
              data={analytics.cookieDistribution}
              title="Cookie Distribution"
              description="Cookies found by category"
            />
            <DistributionChart
              data={analytics.scriptDistribution}
              title="Script Distribution"
              description="Tracking scripts by category"
            />
          </div>
        </div>

        {/* DSAR Analytics */}
        <div>
          <h2 className="text-xl font-semibold mb-4">DSAR Analytics</h2>
          <DsarMetricsChart metrics={analytics.dsarMetrics} />
        </div>

        <DsarTrendChart data={analytics.dsarTrend} />
      </div>
    </>
  );
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const dateRange = (params.range as DateRange) || "30d";

  // Validate date range
  const validRanges: DateRange[] = ["7d", "30d", "90d", "1y", "all"];
  const validatedRange = validRanges.includes(dateRange) ? dateRange : "30d";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Comprehensive compliance analytics and reporting
        </p>
      </div>

      {/* Analytics Content */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent dateRange={validatedRange} />
      </Suspense>
    </div>
  );
}

