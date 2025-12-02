import { Metadata } from "next";
import Link from "next/link";
import { Globe, FileText, Shield, ArrowRight, Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard | ComplianceKit",
  description: "Manage your GDPR compliance",
};

async function getStats(userId: string) {
  const [websiteCount, policyCount, scanCount] = await Promise.all([
    db.website.count({ where: { userId } }),
    db.policy.count({ where: { website: { userId } } }),
    db.scan.count({ where: { website: { userId } } }),
  ]);

  return { websiteCount, policyCount, scanCount };
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getStats(session!.user!.id!);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your GDPR compliance status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Websites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websiteCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.websiteCount === 0 ? "Add your first website" : "websites tracked"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.policyCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.policyCount === 0 ? "Generate your first policy" : "policies generated"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scanCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.scanCount === 0 ? "Run your first scan" : "compliance scans"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Add your website to begin your compliance journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Add your website</p>
                <p className="text-sm text-muted-foreground">
                  Enter your website URL to get started
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/websites/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <span className="text-lg font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Scan for cookies</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll detect all cookies and trackers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <span className="text-lg font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Generate policies</p>
                <p className="text-sm text-muted-foreground">
                  Create compliant privacy & cookie policies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>
              Learn more about GDPR compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="#"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div>
                <p className="font-medium">GDPR Compliance Guide</p>
                <p className="text-sm text-muted-foreground">
                  Everything you need to know
                </p>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div>
                <p className="font-medium">Cookie Policy Best Practices</p>
                <p className="text-sm text-muted-foreground">
                  How to write effective policies
                </p>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div>
                <p className="font-medium">Banner Design Tips</p>
                <p className="text-sm text-muted-foreground">
                  Create user-friendly consent banners
                </p>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

