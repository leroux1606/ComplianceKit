import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Cookie,
  Code,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceScore } from "@/components/dashboard/compliance-score";
import { CookieList } from "@/components/dashboard/cookie-list";
import { ScriptList } from "@/components/dashboard/script-list";
import { FindingsList } from "@/components/dashboard/findings-list";
import { ScanButton } from "@/components/dashboard/scan-button";
import { getWebsite } from "@/lib/actions/website";
import { getScan } from "@/lib/actions/scan";
import { formatDateTime } from "@/lib/utils";

interface ScanResultsPageProps {
  params: Promise<{ id: string; scanId: string }>;
}

export async function generateMetadata({
  params,
}: ScanResultsPageProps): Promise<Metadata> {
  const { id, scanId } = await params;
  const website = await getWebsite(id);
  const scan = await getScan(scanId);

  if (!website || !scan) {
    return { title: "Scan Not Found | ComplianceKit" };
  }

  return {
    title: `Scan Results - ${website.name} | ComplianceKit`,
    description: `Compliance scan results for ${website.url}`,
  };
}

export default async function ScanResultsPage({
  params,
}: ScanResultsPageProps) {
  const { id, scanId } = await params;
  const website = await getWebsite(id);
  const scan = await getScan(scanId);

  if (!website || !scan) {
    notFound();
  }

  const cookieStats = {
    total: scan.cookies.length,
    necessary: scan.cookies.filter((c) => c.category === "necessary").length,
    analytics: scan.cookies.filter((c) => c.category === "analytics").length,
    marketing: scan.cookies.filter((c) => c.category === "marketing").length,
    functional: scan.cookies.filter((c) => c.category === "functional").length,
  };

  const scriptStats = {
    total: scan.scripts.length,
    analytics: scan.scripts.filter((s) => s.category === "analytics").length,
    marketing: scan.scripts.filter((s) => s.category === "marketing").length,
  };

  const hasPrivacyPolicy = !scan.findings.some(
    (f) => f.type === "privacy_policy"
  );
  const hasCookieBanner = !scan.findings.some(
    (f) => f.type === "cookie_banner"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/websites/${id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scan Results</h1>
            <p className="text-muted-foreground">
              {website.name} • {formatDateTime(scan.createdAt)}
            </p>
          </div>
        </div>
        <ScanButton websiteId={id} variant="outline" />
      </div>

      {/* Score Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ComplianceScore score={scan.score || 0} size="lg" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                {hasPrivacyPolicy ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">
                    {hasPrivacyPolicy ? "Found" : "Not Found"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasCookieBanner ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">Cookie Banner</p>
                  <p className="text-sm text-muted-foreground">
                    {hasCookieBanner ? "Found" : "Not Found"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Cookie className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{cookieStats.total} Cookies</p>
                  <p className="text-sm text-muted-foreground">
                    {cookieStats.analytics + cookieStats.marketing} tracking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{scriptStats.total} Scripts</p>
                  <p className="text-sm text-muted-foreground">
                    {scriptStats.analytics + scriptStats.marketing} trackers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cookieStats.total}</div>
            <div className="flex gap-2 mt-2">
              {cookieStats.necessary > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  {cookieStats.necessary} necessary
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cookieStats.analytics}</div>
            <p className="text-xs text-muted-foreground">cookies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cookieStats.marketing}</div>
            <p className="text-xs text-muted-foreground">cookies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scan.findings.length}</div>
            <p className="text-xs text-muted-foreground">findings</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results Tabs */}
      <Tabs defaultValue="findings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="findings">
            Findings
            {scan.findings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {scan.findings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cookies">
            Cookies
            <Badge variant="secondary" className="ml-2">
              {scan.cookies.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scripts">
            Scripts
            <Badge variant="secondary" className="ml-2">
              {scan.scripts.filter((s) => s.category !== "unknown").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Findings</CardTitle>
              <CardDescription>
                Issues and recommendations for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FindingsList findings={scan.findings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cookies">
          <Card>
            <CardHeader>
              <CardTitle>Detected Cookies</CardTitle>
              <CardDescription>
                All cookies found on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CookieList cookies={scan.cookies} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Scripts</CardTitle>
              <CardDescription>
                Analytics and marketing scripts detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScriptList scripts={scan.scripts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



