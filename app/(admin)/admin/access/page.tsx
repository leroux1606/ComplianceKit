import { Metadata } from "next";
import { AlertTriangle, XCircle, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Access Control | ComplianceKit Admin",
};

const PAST_DUE_GRACE_DAYS = 7;

export default async function AdminAccessPage() {
  const now = new Date();
  const startOf30Days = new Date(now);
  startOf30Days.setDate(startOf30Days.getDate() - 30);

  // Users with past_due subscriptions
  const pastDueUsers = await db.subscription.findMany({
    where: { status: "past_due" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          _count: { select: { websites: true } },
        },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  // Users with cancelled subscriptions who still have websites/activity in last 30d
  const cancelledActiveUsers = await db.subscription.findMany({
    where: {
      status: "cancelled",
      updatedAt: { gte: startOf30Days },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          _count: { select: { websites: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });

  // Free users who have generated policies (shouldn't be possible post-fix, useful for backfill detection)
  const freePolicyUsers = await db.user.findMany({
    where: {
      deletedAt: null,
      subscription: null, // no subscription = free tier
      websites: {
        some: {
          policies: {
            some: { isActive: true },
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: { select: { websites: true } },
    },
    take: 25,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
        <p className="text-muted-foreground">
          Users flagged for payment issues or policy violations
        </p>
      </div>

      {/* Past-due */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Past-Due Subscriptions ({pastDueUsers.length})
          </CardTitle>
          <CardDescription>
            Payment failed. Users are warned for {PAST_DUE_GRACE_DAYS} days then blocked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastDueUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">None — all payments current</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Plan</th>
                  <th className="text-left pb-3 font-medium">Days Overdue</th>
                  <th className="text-left pb-3 font-medium">Websites</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pastDueUsers.map((sub) => {
                  const daysOverdue = Math.floor(
                    (now.getTime() - new Date(sub.updatedAt).getTime()) / 86_400_000
                  );
                  const planSlug = sub.paystackPlanCode.replace("stripe:", "");
                  const plan = PLANS.find(
                    (p) => p.paystackPlanCode === sub.paystackPlanCode || p.slug === planSlug
                  );
                  const isBlocked = daysOverdue >= PAST_DUE_GRACE_DAYS;

                  return (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{sub.user.name ?? "—"}</p>
                        <p className="text-muted-foreground text-xs">{sub.user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{plan?.name ?? sub.paystackPlanCode}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={daysOverdue >= PAST_DUE_GRACE_DAYS ? "text-destructive font-medium" : "text-amber-600 font-medium"}>
                          {daysOverdue}d
                        </span>
                      </td>
                      <td className="py-3 pr-4">{sub.user._count.websites}</td>
                      <td className="py-3">
                        {isBlocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            Grace period ({PAST_DUE_GRACE_DAYS - daysOverdue}d left)
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Recently cancelled */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            Recently Cancelled ({cancelledActiveUsers.length})
          </CardTitle>
          <CardDescription>Cancelled in the last 30 days — potential win-back opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          {cancelledActiveUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent cancellations</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Was on Plan</th>
                  <th className="text-left pb-3 font-medium">Cancelled</th>
                  <th className="text-left pb-3 font-medium">Websites</th>
                </tr>
              </thead>
              <tbody>
                {cancelledActiveUsers.map((sub) => {
                  const planSlug = sub.paystackPlanCode.replace("stripe:", "");
                  const plan = PLANS.find(
                    (p) => p.paystackPlanCode === sub.paystackPlanCode || p.slug === planSlug
                  );
                  return (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{sub.user.name ?? "—"}</p>
                        <p className="text-muted-foreground text-xs">{sub.user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{plan?.name ?? sub.paystackPlanCode}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">
                        {new Date(sub.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">{sub.user._count.websites}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Free users with policies (data integrity) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Free Users with Policies ({freePolicyUsers.length})
          </CardTitle>
          <CardDescription>
            Free tier users who have generated policies — should not be possible after the gate fix.
            These are legacy accounts or require investigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {freePolicyUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">None — feature gate is working correctly</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Joined</th>
                  <th className="text-left pb-3 font-medium">Websites</th>
                </tr>
              </thead>
              <tbody>
                {freePolicyUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{user.name ?? "—"}</p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">{user._count.websites}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
