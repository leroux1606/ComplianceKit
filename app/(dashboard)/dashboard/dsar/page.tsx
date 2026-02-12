import { Metadata } from "next";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Inbox,
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDsarList, getDsarStats } from "@/lib/actions/dsar";
import { DsarTable } from "@/components/dsar/dsar-table";
import { DSAR_STATUSES, DSAR_REQUEST_TYPES, isDsarOverdue } from "@/lib/dsar/types";

export const metadata: Metadata = {
  title: "Data Requests | ComplianceKit",
  description: "Manage data subject access requests",
};

export default async function DsarPage() {
  const [dsars, stats] = await Promise.all([
    getDsarList(),
    getDsarStats(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Requests</h1>
          <p className="text-muted-foreground">
            Manage data subject access requests (DSAR) from your website visitors
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Inbox className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className={stats.overdue > 0 ? "border-red-200 dark:border-red-900" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : ""}`}>
              {stats.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DSAR List */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            Data subject requests from all your websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dsars.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No requests yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                When visitors submit data subject requests through your websites, 
                they will appear here.
              </p>
            </div>
          ) : (
            <DsarTable dsars={dsars} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}



