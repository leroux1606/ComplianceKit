import { Suspense } from "react";
import Link from "next/link";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Code2, ClipboardList, Info } from "lucide-react";

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
          {analytics.consentMetrics.total === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Code2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="max-w-md">
                  <CardTitle className="mb-2 text-lg">No consent data yet</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Consent Analytics tracks how real visitors respond to your cookie banner —
                    how many accept, reject, or choose partial consent. This data is collected
                    automatically once you embed the ComplianceKit consent banner on your website.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">How to activate:</p>
                  <ol className="list-decimal text-left space-y-1 pl-4">
                    <li>Go to your website in the dashboard</li>
                    <li>Open the <strong>Embed</strong> tab</li>
                    <li>Copy the consent banner script</li>
                    <li>Paste it into your website&apos;s <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code></li>
                  </ol>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/websites">Go to My Websites</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <ConsentMetricsChart metrics={analytics.consentMetrics} />
              <div className="mt-4">
                <ConsentTrendChart data={analytics.consentTrend} />
              </div>
            </>
          )}
        </div>

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
          {analytics.dsarMetrics.total === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="rounded-full bg-muted p-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="max-w-md">
                  <CardTitle className="mb-2 text-lg">No DSAR requests yet</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    DSAR (Data Subject Access Request) Analytics shows data about requests
                    from your website visitors exercising their GDPR rights — access, erasure,
                    portability, etc. Data populates here as requests come in through your
                    published DSAR form.
                  </CardDescription>
                </div>
                <div className="flex items-start gap-2 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground max-w-md">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    DSAR requests can be submitted by visitors via your website&apos;s privacy
                    page or by direct link. Manage them under <strong className="text-foreground">DSARs</strong> in the sidebar.
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <DsarMetricsChart metrics={analytics.dsarMetrics} />
              <div className="mt-4">
                <DsarTrendChart data={analytics.dsarTrend} />
              </div>
            </>
          )}
        </div>
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

