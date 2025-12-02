"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { 
  ExternalLink, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DSAR_STATUSES, 
  DSAR_REQUEST_TYPES, 
  DSAR_PRIORITIES,
  isDsarOverdue,
  getDaysRemaining,
  type DsarStatus,
  type DsarRequestType,
  type DsarPriority
} from "@/lib/dsar/types";
import type { DsarListItem } from "@/lib/actions/dsar";

interface DsarTableProps {
  dsars: DsarListItem[];
}

export function DsarTable({ dsars }: DsarTableProps) {
  const router = useRouter();

  function getStatusIcon(status: DsarStatus) {
    switch (status) {
      case "pending":
      case "verified":
        return <Clock className="h-3 w-3" />;
      case "in_progress":
        return <Clock className="h-3 w-3 animate-pulse" />;
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  }

  function getStatusVariant(status: DsarStatus): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case "completed":
        return "default";
      case "rejected":
        return "destructive";
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request Type</TableHead>
          <TableHead>Requester</TableHead>
          <TableHead>Website</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dsars.map((dsar) => {
          const isOverdue = isDsarOverdue(dsar.dueDate, dsar.status as DsarStatus);
          const daysRemaining = getDaysRemaining(dsar.dueDate);
          const requestType = DSAR_REQUEST_TYPES[dsar.requestType as DsarRequestType];
          const status = DSAR_STATUSES[dsar.status as DsarStatus];
          const priority = DSAR_PRIORITIES[dsar.priority as DsarPriority];

          return (
            <TableRow 
              key={dsar.id}
              className={isOverdue ? "bg-red-50 dark:bg-red-950/20" : ""}
            >
              <TableCell>
                <span className="font-medium">{requestType?.label || dsar.requestType}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{dsar.requesterName || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">{dsar.requesterEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{dsar.website.name}</span>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(dsar.status as DsarStatus)} className="gap-1">
                  {getStatusIcon(dsar.status as DsarStatus)}
                  {status?.label || dsar.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {priority?.label || dsar.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {isOverdue && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                    {isOverdue 
                      ? `${Math.abs(daysRemaining)} days overdue`
                      : `${daysRemaining} days left`
                    }
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(dsar.createdAt), { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/dsar/${dsar.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

