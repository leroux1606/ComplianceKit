import { Metadata } from "next";
import Link from "next/link";
import {
  Globe,
  FileText,
  Shield,
  ArrowRight,
  Plus,
  Users,
  CheckCircle2,
  Circle,
  BarChart3,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getWebsiteStats, getWebsites } from "@/lib/actions/website";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WebsiteCard } from "@/components/dashboard/website-card";

export const metadata: Metadata = {
  title: "Dashboard | ComplianceKit",
  description: "Manage your GDPR compliance",
};

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getWebsiteStats();
  const websites = await getWebsites();
  const recentWebsites = websites.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your GDPR compliance status.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/websites/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4" role="list" aria-label="Compliance summary metrics">
        <Card role="listitem">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Websites</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10" aria-hidden="true">
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websiteCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.websiteCount === 0 ? "Add your first website" : "websites tracked"}
            </p>
          </CardContent>
        </Card>

        <Card role="listitem">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scans</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10" aria-hidden="true">
              <Shield className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scanCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.scanCount === 0 ? "Run your first scan" : "compliance scans"}
            </p>
          </CardContent>
        </Card>

        <Card role="listitem">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Policies</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10" aria-hidden="true">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.policyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.policyCount === 0 ? "Generate your first policy" : "policies generated"}
            </p>
          </CardContent>
        </Card>

        <Card role="listitem">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consents</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10" aria-hidden="true">
              <Users className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.consentCount === 0 ? "No consents yet" : "visitor consents"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Websites & Getting Started */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Websites */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Websites</CardTitle>
              <CardDescription>
                Your most recently added websites
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/websites/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/websites">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentWebsites.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No websites yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add your first website to get started
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/websites/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Website
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWebsites.map((website) => (
                  <Link
                    key={website.id}
                    href={`/dashboard/websites/${website.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{website.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {website.url.replace(/^https?:\/\//, "")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Complete these steps to achieve GDPR compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Step 1 */}
            <div
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${stats.websiteCount > 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-primary/30 bg-primary/5'}`}
              aria-label={`Step 1: Add your website — ${stats.websiteCount > 0 ? 'completed' : 'pending'}`}
            >
              <div className="shrink-0" aria-hidden="true">
                {stats.websiteCount > 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary text-[11px] font-bold text-primary-foreground">
                    1
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${stats.websiteCount > 0 ? 'line-through text-muted-foreground' : ''}`}>
                  Add your website
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter your website URL to get started
                </p>
              </div>
              {stats.websiteCount === 0 && (
                <Button asChild size="sm" className="shrink-0">
                  <Link href="/dashboard/websites/new">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add
                  </Link>
                </Button>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${stats.scanCount > 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border'}`}
              aria-label={`Step 2: Scan for cookies — ${stats.scanCount > 0 ? 'completed' : 'pending'}`}
            >
              <div className="shrink-0" aria-hidden="true">
                {stats.scanCount > 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-[11px] font-bold text-muted-foreground">
                    2
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${stats.scanCount > 0 ? 'line-through text-muted-foreground' : ''}`}>
                  Scan for cookies
                </p>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll detect all cookies and trackers
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${stats.policyCount > 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border'}`}
              aria-label={`Step 3: Generate policies — ${stats.policyCount > 0 ? 'completed' : 'pending'}`}
            >
              <div className="shrink-0" aria-hidden="true">
                {stats.policyCount > 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-[11px] font-bold text-muted-foreground">
                    3
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${stats.policyCount > 0 ? 'line-through text-muted-foreground' : ''}`}>
                  Generate policies
                </p>
                <p className="text-xs text-muted-foreground">
                  Create compliant privacy &amp; cookie policies
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div
              className="flex items-center gap-4 rounded-lg border p-4"
              aria-label="Step 4: Deploy cookie banner — pending"
            >
              <div className="shrink-0" aria-hidden="true">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-[11px] font-bold text-muted-foreground">
                  4
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Deploy cookie banner</p>
                <p className="text-xs text-muted-foreground">
                  Add consent banner to your website
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Learn more about GDPR compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
