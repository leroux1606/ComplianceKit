import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Globe,
  FileText,
  Shield,
  ArrowRight,
  Plus,
  Users,
  CheckCircle2,
  Scan,
  Code,
  Download,
  Cookie,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

import {
  DEMO_SITE_NAME,
  DEMO_SCORE,
  DEMO_FINDINGS,
  DEMO_COOKIES,
  DEMO_SCRIPTS,
} from "@/lib/demo-data";
import { ComplianceScore } from "@/components/dashboard/compliance-score";

import { auth } from "@/lib/auth";
import { getWebsiteStats, getWebsites } from "@/lib/actions/website";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WebsiteCard } from "@/components/dashboard/website-card";

function ChecklistStep({
  number,
  done,
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  number: number;
  done: boolean;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon: ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        done ? "border-emerald-500/20 bg-emerald-500/5" : "border-border"
      }`}
    >
      <div className="shrink-0">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/40 text-[10px] font-bold text-muted-foreground">
            {number}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {!done && (
        <Button asChild size="sm" variant="outline" className="shrink-0 h-7 text-xs gap-1.5">
          <Link href={actionHref}>
            {icon}
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}

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

        {/* Onboarding Checklist — hidden once all steps complete */}
        {stats.consentCount === 0 && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Setup Checklist</CardTitle>
              <CardDescription>
                {[
                  stats.websiteCount > 0,
                  stats.scanCount > 0,
                  stats.policyCount > 0,
                  stats.bannerConfigCount > 0,
                  stats.consentCount > 0,
                ].filter(Boolean).length} of 5 steps complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ChecklistStep
                number={1}
                done={stats.websiteCount > 0}
                title="Add your website"
                description="Enter your website URL to get started"
                actionLabel="Add website"
                actionHref="/dashboard/websites/new"
                icon={<Globe className="h-3.5 w-3.5" />}
              />
              <ChecklistStep
                number={2}
                done={stats.scanCount > 0}
                title="Run your first scan"
                description="Detect cookies and trackers on your site"
                actionLabel="Go to scan"
                actionHref={stats.firstWebsiteId ? `/dashboard/websites/${stats.firstWebsiteId}/scan` : "/dashboard/websites"}
                icon={<Scan className="h-3.5 w-3.5" />}
              />
              <ChecklistStep
                number={3}
                done={stats.policyCount > 0}
                title="Generate a cookie policy"
                description="Create compliant privacy and cookie policies"
                actionLabel="Generate"
                actionHref={stats.firstWebsiteId ? `/dashboard/websites/${stats.firstWebsiteId}/policies` : "/dashboard/websites"}
                icon={<FileText className="h-3.5 w-3.5" />}
              />
              <ChecklistStep
                number={4}
                done={stats.bannerConfigCount > 0}
                title="Configure your consent banner"
                description="Customise colours, text, and behaviour"
                actionLabel="Configure"
                actionHref={stats.firstWebsiteId ? `/dashboard/websites/${stats.firstWebsiteId}/banner` : "/dashboard/websites"}
                icon={<Code className="h-3.5 w-3.5" />}
              />
              <ChecklistStep
                number={5}
                done={stats.consentCount > 0}
                title="Install the banner on your site"
                description="Paste the embed code — first consent confirms it's live"
                actionLabel="Get embed code"
                actionHref={stats.firstWebsiteId ? `/dashboard/websites/${stats.firstWebsiteId}/embed` : "/dashboard/websites"}
                icon={<Download className="h-3.5 w-3.5" />}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demo Scan Preview — only shown before user has added any websites */}
      {stats.websiteCount === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle>Sample Scan — {DEMO_SITE_NAME}</CardTitle>
                  <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    Demo data
                  </span>
                </div>
                <CardDescription>
                  This is what a real scan looks like. Add your website to get your actual compliance report.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href="/dashboard/websites/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add your site
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score + stats row */}
            <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-muted/30 p-4">
              <ComplianceScore score={DEMO_SCORE} size="md" />
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Cookie className="h-4 w-4 text-muted-foreground" />
                  <span>{DEMO_COOKIES.length} cookies detected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span>{DEMO_SCRIPTS.length} tracking scripts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>{DEMO_FINDINGS.filter((f) => f.severity === "error").length} critical issues</span>
                </div>
              </div>
            </div>

            {/* Top findings preview */}
            <div className="space-y-2">
              {DEMO_FINDINGS.slice(0, 3).map((finding) => {
                const iconProps =
                  finding.severity === "error"
                    ? { Icon: AlertCircle, color: "text-red-600", bg: "bg-red-500/10" }
                    : finding.severity === "warning"
                    ? { Icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-500/10" }
                    : { Icon: Info, color: "text-blue-600", bg: "bg-blue-500/10" };
                const { Icon, color, bg } = iconProps;

                return (
                  <div key={finding.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{finding.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{finding.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-sm text-muted-foreground">
                See all {DEMO_FINDINGS.length} findings, cookies, and trackers on the full demo page.
              </p>
              <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
                <Link href="/demo">
                  View full demo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
