"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Calendar, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface Scan {
  id: string;
  score: number | null;
  status: string;
  createdAt: Date;
  cookies: Array<{ category: string | null }>;
  scripts: Array<{ category: string | null }>;
  findings: Array<{ severity: string }>;
}

interface ScanHistoryProps {
  websiteId: string;
  scans: Scan[];
}

export function ScanHistory({ websiteId, scans }: ScanHistoryProps) {
  const [limit, setLimit] = useState(5);

  if (scans.length === 0) {
    return null;
  }

  // Sort by date, most recent first
  const sortedScans = [...scans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayedScans = sortedScans.slice(0, limit);

  // Calculate trends
  const calculateTrend = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;
    return current - previous;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scan History
            </CardTitle>
            <CardDescription>
              Track your compliance score over time and monitor improvements
            </CardDescription>
          </div>
          {displayedScans.length > 0 && displayedScans[0].score !== null && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Latest Score</div>
              <div className="text-2xl font-bold">
                {displayedScans[0].score}
                {displayedScans.length > 1 && displayedScans[1].score !== null && (
                  <TrendBadge
                    value={calculateTrend(displayedScans[0].score, displayedScans[1].score)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedScans.map((scan, index) => {
            const previousScan = displayedScans[index + 1];
            const scoreTrend = previousScan
              ? calculateTrend(scan.score, previousScan.score)
              : null;

            const cookieCount = scan.cookies.length;
            const trackingCount =
              scan.cookies.filter((c) => c.category === "analytics" || c.category === "marketing")
                .length + scan.scripts.filter((s) => s.category !== "unknown").length;
            const issueCount = scan.findings.length;

            return (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Score */}
                  <div className="flex flex-col items-center min-w-[60px]">
                    <div className="text-2xl font-bold">
                      {scan.score !== null ? scan.score : "—"}
                    </div>
                    {scoreTrend !== null && (
                      <TrendBadge value={scoreTrend} size="sm" />
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="text-sm font-medium">
                      {formatDateTime(scan.createdAt)}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{cookieCount} cookies</span>
                      <span>•</span>
                      <span>{trackingCount} trackers</span>
                      <span>•</span>
                      <span className={issueCount > 0 ? "text-red-600" : ""}>
                        {issueCount} issues
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link href={`/dashboard/websites/${websiteId}/scans/${scan.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More */}
        {scans.length > limit && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLimit((prev) => prev + 5)}
            >
              Show More ({scans.length - limit} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendBadge({ value, size = "default" }: { value: number | null; size?: "sm" | "default" }) {
  if (value === null || value === 0) {
    return (
      <Badge variant="outline" className={`ml-2 ${size === "sm" ? "text-xs" : ""}`}>
        <Minus className={`${size === "sm" ? "h-2 w-2" : "h-3 w-3"} mr-1`} />
        {value === 0 ? "0" : "—"}
      </Badge>
    );
  }

  if (value > 0) {
    return (
      <Badge
        variant="outline"
        className={`ml-2 bg-green-500/10 text-green-600 border-green-500/20 ${size === "sm" ? "text-xs" : ""}`}
      >
        <TrendingUp className={`${size === "sm" ? "h-2 w-2" : "h-3 w-3"} mr-1`} />
        +{value}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`ml-2 bg-red-500/10 text-red-600 border-red-500/20 ${size === "sm" ? "text-xs" : ""}`}
    >
      <TrendingDown className={`${size === "sm" ? "h-2 w-2" : "h-3 w-3"} mr-1`} />
      {value}
    </Badge>
  );
}
