"use client";

import { formatDistanceToNow } from "date-fns";
import { 
  FileText, 
  CheckCircle2, 
  Play, 
  MessageSquare,
  Send,
  XCircle,
  User,
  Clock
} from "lucide-react";

import type { DsarActivity } from "@prisma/client";

interface DsarActivityTimelineProps {
  activities: DsarActivity[];
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  created: FileText,
  verified: CheckCircle2,
  status_changed: Clock,
  assigned: User,
  note_added: MessageSquare,
  response_drafted: FileText,
  response_sent: Send,
  completed: CheckCircle2,
  rejected: XCircle,
};

const activityColors: Record<string, string> = {
  created: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  verified: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  status_changed: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  assigned: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  note_added: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  response_drafted: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400",
  response_sent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400",
  completed: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
};

export function DsarActivityTimeline({ activities }: DsarActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No activity recorded yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.action] || FileText;
        const colorClass = activityColors[activity.action] || "bg-slate-100 text-slate-600";
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div className="w-px h-full bg-border mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                {activity.performedBy && activity.performedBy !== "system" && activity.performedBy !== "requester" && (
                  <span> by team member</span>
                )}
                {activity.performedBy === "requester" && (
                  <span> by requester</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}



