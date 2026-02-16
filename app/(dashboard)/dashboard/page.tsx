import { Metadata } from "next";
import Link from "next/link";
import { Globe, FileText, Shield, ArrowRight, Plus, Users } from "lucide-react";

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
      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Consents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consentCount}</div>
            <p className="text-xs text-muted-foreground">
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
          <CardContent className="space-y-4">
            <div className={`flex items-center gap-4 rounded-lg border p-4 ${stats.websiteCount > 0 ? 'opacity-60' : ''}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.websiteCount > 0 ? 'bg-green-500/10 text-green-600' : 'bg-primary text-primary-foreground'}`}>
                {stats.websiteCount > 0 ? '✓' : '1'}
              </div>
              <div className="flex-1">
                <p className="font-medium">Add your website</p>
                <p className="text-sm text-muted-foreground">
                  Enter your website URL to get started
                </p>
              </div>
              {stats.websiteCount === 0 && (
                <Button asChild size="sm">
                  <Link href="/dashboard/websites/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Link>
                </Button>
              )}
            </div>

            <div className={`flex items-center gap-4 rounded-lg border p-4 ${stats.scanCount > 0 ? 'opacity-60' : ''}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.scanCount > 0 ? 'bg-green-500/10 text-green-600' : 'bg-muted'}`}>
                {stats.scanCount > 0 ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <p className="font-medium">Scan for cookies</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll detect all cookies and trackers
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-4 rounded-lg border p-4 ${stats.policyCount > 0 ? 'opacity-60' : ''}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stats.policyCount > 0 ? 'bg-green-500/10 text-green-600' : 'bg-muted'}`}>
                {stats.policyCount > 0 ? '✓' : '3'}
              </div>
              <div className="flex-1">
                <p className="font-medium">Generate policies</p>
                <p className="text-sm text-muted-foreground">
                  Create compliant privacy & cookie policies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium">Deploy cookie banner</p>
                <p className="text-sm text-muted-foreground">
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
