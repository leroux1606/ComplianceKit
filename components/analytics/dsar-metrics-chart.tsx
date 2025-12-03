"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DsarMetrics } from "@/lib/analytics/types";
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface DsarMetricsChartProps {
  metrics: DsarMetrics;
}

const TYPE_LABELS: Record<string, string> = {
  access: "Data Access",
  erasure: "Erasure",
  rectification: "Rectification",
  portability: "Data Portability",
  restriction: "Restriction",
  objection: "Objection",
};

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

export function DsarMetricsChart({ metrics }: DsarMetricsChartProps) {
  const typeData = Object.entries(metrics.byType)
    .map(([type, count], index) => ({
      name: TYPE_LABELS[type] || type,
      value: count,
      color: COLORS[index % COLORS.length],
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>DSAR Status Overview</CardTitle>
          <CardDescription>Current status of data subject requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.total}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Average Response Time
              </span>
              <Badge variant="outline" className="text-lg font-bold">
                {metrics.averageResponseTime} days
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">
              In Progress: {metrics.inProgress}
            </Badge>
            <Badge variant="secondary">
              Rejected: {metrics.rejected}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Requests by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Requests by Type</CardTitle>
          <CardDescription>Distribution of DSAR request types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <span className="font-bold">
                              {payload[0].payload.name}: {payload[0].value}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No DSAR data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

