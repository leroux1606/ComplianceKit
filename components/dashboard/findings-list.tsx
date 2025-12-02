import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FindingData {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string | null;
}

interface FindingsListProps {
  findings: FindingData[];
}

const severityConfig: Record<
  string,
  { icon: typeof AlertCircle; color: string; bgColor: string }
> = {
  error: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
};

export function FindingsList({ findings }: FindingsListProps) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No Issues Found</h3>
        <p className="text-sm text-muted-foreground">
          Great job! No compliance issues were detected.
        </p>
      </div>
    );
  }

  // Sort findings by severity
  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 };
    return (
      (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
      (severityOrder[b.severity as keyof typeof severityOrder] || 3)
    );
  });

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {errorCount > 0 && (
          <Badge variant="outline" className="bg-red-500/10 text-red-600">
            {errorCount} Error{errorCount > 1 ? "s" : ""}
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
            {warningCount} Warning{warningCount > 1 ? "s" : ""}
          </Badge>
        )}
        {infoCount > 0 && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
            {infoCount} Info
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {sortedFindings.map((finding) => {
          const config = severityConfig[finding.severity] || severityConfig.info;
          const Icon = config.icon;

          return (
            <Card key={finding.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{finding.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {finding.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${config.bgColor} ${config.color} capitalize`}
                  >
                    {finding.severity}
                  </Badge>
                </div>
              </CardHeader>
              {finding.recommendation && (
                <CardContent className="pt-0">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Recommendation</p>
                    <p className="text-sm text-muted-foreground">
                      {finding.recommendation}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

