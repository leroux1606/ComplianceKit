import { Metadata } from "next";
import { Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Users | ComplianceKit Admin",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const users = await db.user.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      companyName: true,
      subscription: {
        select: {
          status: true,
          paystackPlanCode: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      },
      _count: { select: { websites: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          {query ? `Results for "${query}"` : "All users — showing last 50"}
        </p>
      </div>

      {/* Search */}
      <form method="GET">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search by email or name..."
            className="pl-9"
          />
        </div>
      </form>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            Click a row to view details (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Company</th>
                  <th className="text-left pb-3 font-medium">Plan</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Websites</th>
                  <th className="text-left pb-3 font-medium">Renews / Ends</th>
                  <th className="text-left pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const planCode = user.subscription?.paystackPlanCode ?? "";
                    const planSlug = planCode.replace("stripe:", "");
                    const plan = PLANS.find(
                      (p) => p.paystackPlanCode === planCode || p.slug === planSlug
                    );
                    const isActive = user.subscription?.status === "active";
                    const isCancelling = user.subscription?.cancelAtPeriodEnd;

                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{user.name ?? "—"}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {user.companyName ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {isActive && plan ? (
                            <Badge>{plan.name}</Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {isCancelling ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Cancelling
                            </Badge>
                          ) : isActive ? (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-center">{user._count.websites}</td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {user.subscription?.currentPeriodEnd
                            ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
