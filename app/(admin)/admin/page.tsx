import { Metadata } from "next";
import { Users, Activity, CreditCard, Inbox, Globe, AlertCircle } from "lucide-react";

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
  title: "Admin Overview | ComplianceKit",
};

export default async function AdminOverviewPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf30Days = new Date(now);
  startOf30Days.setDate(startOf30Days.getDate() - 30);

  const [
    totalUsers,
    newUsersToday,
    newUsersLast30,
    activeSubscriptions,
    scansToday,
    pendingDsars,
    totalWebsites,
    recentUsers,
    subscriptionsByPlan,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { createdAt: { gte: startOfToday }, deletedAt: null } }),
    db.user.count({ where: { createdAt: { gte: startOf30Days }, deletedAt: null } }),
    db.subscription.count({ where: { status: "active" } }),
    db.scan.count({ where: { createdAt: { gte: startOfToday } } }),
    db.dataSubjectRequest.count({ where: { status: "pending" } }),
    db.website.count(),
    db.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscription: { select: { status: true, paystackPlanCode: true } },
      },
    }),
    db.subscription.groupBy({
      by: ["paystackPlanCode"],
      where: { status: "active" },
      _count: { _all: true },
    }),
  ]);

  const planCounts = subscriptionsByPlan.map((s) => {
    const planSlug = s.paystackPlanCode.replace("stripe:", "");
    const plan = PLANS.find(
      (p) => p.paystackPlanCode === s.paystackPlanCode || p.slug === planSlug
    );
    return { name: plan?.name ?? s.paystackPlanCode, count: s._count._all };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Platform health at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          sub={`+${newUsersToday} today · +${newUsersLast30} last 30d`}
          icon={Users}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          sub={`${((activeSubscriptions / Math.max(totalUsers, 1)) * 100).toFixed(1)}% conversion`}
          icon={CreditCard}
        />
        <StatCard
          title="Scans Today"
          value={scansToday}
          sub="Website compliance scans"
          icon={Activity}
        />
        <StatCard
          title="Pending DSARs"
          value={pendingDsars}
          sub="Requires attention"
          icon={Inbox}
          alert={pendingDsars > 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Active Subscriptions by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active subscriptions</p>
            ) : (
              <div className="space-y-3">
                {planCounts.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    <Badge variant="secondary">{p.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total websites tracked</span>
                <Badge variant="secondary">{totalWebsites}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Free users (no subscription)</span>
                <Badge variant="secondary">{totalUsers - activeSubscriptions}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New signups last 30 days</span>
                <Badge variant="secondary">{newUsersLast30}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent signups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>Last 10 users to join</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Plan</th>
                  <th className="text-left pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => {
                  const planCode = user.subscription?.paystackPlanCode ?? "";
                  const planSlug = planCode.replace("stripe:", "");
                  const plan = PLANS.find(
                    (p) => p.paystackPlanCode === planCode || p.slug === planSlug
                  );
                  return (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{user.name ?? "—"}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        {user.subscription?.status === "active" && plan ? (
                          <Badge>{plan.name}</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  alert,
}: {
  title: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {alert ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
