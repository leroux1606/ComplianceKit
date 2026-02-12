import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ExternalLink,
  Pencil,
  Scan,
  FileText,
  Code,
  Shield,
  Clock,
  Globe,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanButton } from "@/components/dashboard/scan-button";
import { ScanHistory } from "@/components/dashboard/scan-history";
import { getWebsite } from "@/lib/actions/website";
import { formatDate, formatDateTime } from "@/lib/utils";

interface WebsitePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: WebsitePageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    return { title: "Website Not Found | ComplianceKit" };
  }

  return {
    title: `${website.name} | ComplianceKit`,
    description: `Manage compliance for ${website.url}`,
  };
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  scanning: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default async function WebsitePage({ params }: WebsitePageProps) {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/websites">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {website.name}
              </h1>
              <Badge variant="outline" className={statusColors[website.status]}>
                {website.status}
              </Badge>
            </div>
            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:underline"
            >
              {website.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/websites/${website.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <ScanButton websiteId={website.id} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website._count.scans}</div>
            <p className="text-xs text-muted-foreground">
              {website.lastScanAt
                ? `Last: ${formatDate(website.lastScanAt)}`
                : "No scans yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website._count.policies}</div>
            <p className="text-xs text-muted-foreground">Active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consents</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website._count.consents}</div>
            <p className="text-xs text-muted-foreground">Total recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Added</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(website.createdAt)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(website.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Scans</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="banner">Cookie Banner</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Website Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p>{website.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    URL
                  </p>
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {website.url}
                  </a>
                </div>
                {website.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Description
                    </p>
                    <p>{website.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for this website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/websites/${website.id}/scan`}>
                    <Scan className="mr-2 h-4 w-4" />
                    Run Compliance Scan
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/websites/${website.id}/policies`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Policies
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/websites/${website.id}/banner`}>
                    <Code className="mr-2 h-4 w-4" />
                    Configure Cookie Banner
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scans">
          {website.scans.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  Previous compliance scans for this website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No scans yet</h3>
                  <p className="text-muted-foreground">
                    Run your first scan to detect cookies and tracking scripts
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/websites/${website.id}/scan`}>
                      <Scan className="mr-2 h-4 w-4" />
                      Run Scan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScanHistory websiteId={website.id} scans={website.scans} />
          )}
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Generated Policies</CardTitle>
              <CardDescription>
                Privacy and cookie policies for this website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {website.policies.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No policies yet</h3>
                  <p className="text-muted-foreground">
                    Generate your first privacy policy based on scan results
                  </p>
                  <Button className="mt-4" asChild>
                    <Link
                      href={`/dashboard/websites/${website.id}/policies`}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Policy
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {website.policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {policy.type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.version} •{" "}
                          {formatDate(policy.generatedAt)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/websites/${website.id}/policies/${policy.id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banner">
          <Card>
            <CardHeader>
              <CardTitle>Cookie Banner Configuration</CardTitle>
              <CardDescription>
                Customize your cookie consent banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {website.bannerConfig ? (
                <div className="space-y-4">
                  <p>Banner is configured</p>
                  <Button asChild>
                    <Link href={`/dashboard/websites/${website.id}/banner`}>
                      Edit Configuration
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No banner configured
                  </h3>
                  <p className="text-muted-foreground">
                    Set up a cookie consent banner for your website
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/dashboard/websites/${website.id}/banner`}>
                      Configure Banner
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Add this code to your website to enable the cookie consent banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-4">
                <code className="text-sm">
                  {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://compliancekit.com"}/widget/${website.embedCode}/script.js" async></script>`}
                </code>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Place this code in the <code>&lt;head&gt;</code> section of your
                website. The banner will automatically appear to visitors who
                haven&apos;t given consent.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

