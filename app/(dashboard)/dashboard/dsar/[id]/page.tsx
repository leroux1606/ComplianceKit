import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Mail, 
  Phone,
  Calendar,
  AlertTriangle,
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDsar } from "@/lib/actions/dsar";
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
import { DsarStatusActions } from "@/components/dsar/dsar-status-actions";
import { DsarActivityTimeline } from "@/components/dsar/dsar-activity-timeline";
import { DsarResponseForm } from "@/components/dsar/dsar-response-form";

interface DsarDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DsarDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const dsar = await getDsar(id);

  if (!dsar) {
    return { title: "Request Not Found | ComplianceKit" };
  }

  return {
    title: `DSAR #${dsar.id.slice(-6)} | ComplianceKit`,
    description: `Data subject request from ${dsar.requesterEmail}`,
  };
}

export default async function DsarDetailPage({ params }: DsarDetailPageProps) {
  const { id } = await params;
  const dsar = await getDsar(id);

  if (!dsar) {
    notFound();
  }

  const isOverdue = isDsarOverdue(dsar.dueDate, dsar.status as DsarStatus);
  const daysRemaining = getDaysRemaining(dsar.dueDate);
  const requestType = DSAR_REQUEST_TYPES[dsar.requestType as DsarRequestType];
  const status = DSAR_STATUSES[dsar.status as DsarStatus];
  const priority = DSAR_PRIORITIES[dsar.priority as DsarPriority];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/dsar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {requestType?.label || dsar.requestType}
              </h1>
              <Badge 
                variant={dsar.status === "completed" ? "default" : dsar.status === "rejected" ? "destructive" : "secondary"}
              >
                {status?.label || dsar.status}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Request ID: {dsar.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <DsarStatusActions dsar={dsar} />
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                This request is overdue
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                GDPR requires a response within 30 days. This request is {Math.abs(daysRemaining)} days past the deadline.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                {requestType?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="whitespace-pre-wrap">{dsar.description}</p>
              </div>
              {dsar.additionalInfo && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Additional Information
                  </h4>
                  <p className="whitespace-pre-wrap">{dsar.additionalInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Form */}
          {dsar.status !== "completed" && dsar.status !== "rejected" && (
            <DsarResponseForm dsar={dsar} />
          )}

          {/* Response (if completed) */}
          {(dsar.status === "completed" || dsar.status === "rejected") && dsar.responseContent && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {dsar.status === "rejected" ? "Rejection Reason" : "Response Sent"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{dsar.responseContent}</p>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <DsarActivityTimeline activities={dsar.activities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Requester Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{dsar.requesterName || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{dsar.requesterEmail}</p>
                </div>
              </div>
              {dsar.requesterPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{dsar.requesterPhone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{dsar.website.name}</p>
                  <p className="text-xs text-muted-foreground">{dsar.website.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {new Date(dsar.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                    {new Date(dsar.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {!isOverdue && dsar.status !== "completed" && dsar.status !== "rejected" && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({daysRemaining} days left)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {dsar.verifiedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="font-medium text-green-600">
                    {new Date(dsar.verifiedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {dsar.completedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {dsar.status === "rejected" ? "Rejected" : "Completed"}
                  </p>
                  <p className="font-medium">
                    {new Date(dsar.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-sm">
                {priority?.label || dsar.priority}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



