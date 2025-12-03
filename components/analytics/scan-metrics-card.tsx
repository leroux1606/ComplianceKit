"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ScanMetrics } from "@/lib/analytics/types";
import { Search, Cookie, Code, AlertTriangle } from "lucide-react";

interface ScanMetricsCardProps {
  metrics: ScanMetrics;
}

export function ScanMetricsCard({ metrics }: ScanMetricsCardProps) {
  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
    info: "bg-gray-500",
  };

  const totalFindings = Object.values(metrics.findingsBySeverity).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Metrics</CardTitle>
        <CardDescription>Summary of website scans and findings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Search className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{metrics.totalScans}</p>
            <p className="text-xs text-muted-foreground">Total Scans</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="h-5 w-5 mx-auto mb-1 flex items-center justify-center text-muted-foreground font-bold">
              %
            </div>
            <p className="text-2xl font-bold">{metrics.averageScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Cookie className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{metrics.cookiesFound}</p>
            <p className="text-xs text-muted-foreground">Cookies Found</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Code className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{metrics.scriptsFound}</p>
            <p className="text-xs text-muted-foreground">Scripts Found</p>
          </div>
        </div>

        {/* Findings by Severity */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Findings by Severity</h4>
            <Badge variant="secondary" className="ml-auto">
              {totalFindings} total
            </Badge>
          </div>

          <div className="space-y-3">
            {Object.entries(metrics.findingsBySeverity).map(
              ([severity, count]) => {
                const percentage =
                  totalFindings > 0
                    ? Math.round((count / totalFindings) * 100)
                    : 0;

                return (
                  <div key={severity} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{severity}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          severityColors[severity as keyof typeof severityColors]
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

