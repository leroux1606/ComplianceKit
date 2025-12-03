"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { ConsentMetrics } from "@/lib/analytics/types";

interface ConsentMetricsChartProps {
  metrics: ConsentMetrics;
}

const COLORS = {
  acceptedAll: "#10b981", // emerald-500
  rejectedAll: "#ef4444", // red-500
  partial: "#f59e0b", // amber-500
  analytics: "#3b82f6", // blue-500
  marketing: "#8b5cf6", // violet-500
  functional: "#06b6d4", // cyan-500
};

export function ConsentMetricsChart({ metrics }: ConsentMetricsChartProps) {
  const consentDistribution = [
    { name: "Accepted All", value: metrics.acceptedAll, color: COLORS.acceptedAll },
    { name: "Rejected All", value: metrics.rejectedAll, color: COLORS.rejectedAll },
    { name: "Partial", value: metrics.partial, color: COLORS.partial },
  ].filter((item) => item.value > 0);

  const categoryData = [
    { name: "Analytics", value: metrics.byCategory.analytics, color: COLORS.analytics },
    { name: "Marketing", value: metrics.byCategory.marketing, color: COLORS.marketing },
    { name: "Functional", value: metrics.byCategory.functional, color: COLORS.functional },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Consent Distribution</CardTitle>
          <CardDescription>
            How visitors respond to cookie consent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {consentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={consentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {consentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <span className="font-bold">
                              {payload[0].name}: {payload[0].value}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No consent data available
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {metrics.acceptanceRate}%
            </p>
            <p className="text-sm text-muted-foreground">
              Full Acceptance Rate
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consent by Category</CardTitle>
          <CardDescription>
            Which cookie categories are accepted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {metrics.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const percentage = metrics.total > 0
                          ? Math.round((Number(payload[0].value) / metrics.total) * 100)
                          : 0;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-1">
                              <span className="font-bold">
                                {payload[0].payload.name}
                              </span>
                              <span className="text-sm">
                                {payload[0].value} consents ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No consent data available
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold">{metrics.total}</p>
            <p className="text-sm text-muted-foreground">Total Consents</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

