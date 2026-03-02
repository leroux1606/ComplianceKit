"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CookieDistribution, ScriptDistribution } from "@/lib/analytics/types";

interface DistributionChartProps {
  data: CookieDistribution[] | ScriptDistribution[];
  title: string;
  description: string;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

const CATEGORY_LABELS: Record<string, string> = {
  necessary: "Necessary",
  analytics: "Analytics",
  marketing: "Marketing",
  functional: "Functional",
  advertising: "Advertising",
  social: "Social Media",
  tracking: "Tracking",
  unknown: "Unknown",
  other: "Other",
};

export function DistributionChart({
  data,
  title,
  description,
}: DistributionChartProps) {
  const chartData = data.map((item, index) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.count,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-1">
                            <span className="font-bold">
                              {payload[0].payload.name}
                            </span>
                            <span className="text-sm">
                              {payload[0].value} ({payload[0].payload.percentage}%)
                            </span>
                          </div>
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
              No data available
            </div>
          )}
        </div>
        {/* Legend below chart — no truncation */}
        {chartData.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-sm">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
      </CardContent>
    </Card>
  );
}

