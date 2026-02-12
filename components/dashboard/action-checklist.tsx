"use client";

import { useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Finding {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string | null;
}

interface ActionChecklistProps {
  findings: Finding[];
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  completed: boolean;
}

function convertFindingsToActions(findings: Finding[]): ActionItem[] {
  return findings.map((finding) => {
    // Determine priority based on severity
    let priority: "high" | "medium" | "low";
    let estimatedTime: string;

    switch (finding.severity.toLowerCase()) {
      case "error":
      case "critical":
        priority = "high";
        estimatedTime = "2-4 hours";
        break;
      case "warning":
        priority = "medium";
        estimatedTime = "1-2 hours";
        break;
      default:
        priority = "low";
        estimatedTime = "< 1 hour";
    }

    return {
      id: finding.id,
      title: finding.title,
      description: finding.description,
      recommendation: finding.recommendation || "Review and fix this issue",
      priority,
      estimatedTime,
      completed: false,
    };
  });
}

export function ActionChecklist({ findings }: ActionChecklistProps) {
  const [actions] = useState<ActionItem[]>(convertFindingsToActions(findings));
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Action Checklist
          </CardTitle>
          <CardDescription>
            All compliance issues addressed!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold text-green-600">
              Excellent Work!
            </h3>
            <p className="text-muted-foreground">
              No action items required. Your website is compliant.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleComplete = (id: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompleted(newCompleted);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const priorityColors = {
    high: "bg-red-500/10 text-red-600 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  const completedCount = completed.size;
  const totalCount = actions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Action Checklist
            </CardTitle>
            <CardDescription>
              Step-by-step tasks to improve your compliance score
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
            <div className="text-xs text-muted-foreground">completed</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const isCompleted = completed.has(action.id);
            const isExpanded = expandedItems.has(action.id);

            return (
              <div
                key={action.id}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  isCompleted ? "bg-muted/50 border-muted" : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(action.id)}
                    className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4
                        className={cn(
                          "font-medium text-sm",
                          isCompleted && "line-through text-muted-foreground"
                        )}
                      >
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant="outline"
                          className={priorityColors[action.priority]}
                        >
                          {action.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(action.id)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-3 mt-3 pt-3 border-t">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Issue
                          </p>
                          <p className="text-sm">{action.description}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            How to Fix
                          </p>
                          <p className="text-sm text-primary/90">
                            {action.recommendation}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Est. {action.estimatedTime}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {completedCount > 0 && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-center">
              {completedCount === totalCount ? (
                <span className="font-medium text-primary">
                  🎉 All action items completed! Run a new scan to see your improved score.
                </span>
              ) : (
                <span>
                  Keep going! {totalCount - completedCount} more{" "}
                  {totalCount - completedCount === 1 ? "item" : "items"} to complete.
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
