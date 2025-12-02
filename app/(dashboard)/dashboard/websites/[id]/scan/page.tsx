import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Scan, Clock, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScanButton } from "@/components/dashboard/scan-button";
import { getWebsite } from "@/lib/actions/website";
import { getWebsiteScans } from "@/lib/actions/scan";
import { formatDateTime } from "@/lib/utils";

interface ScanPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ScanPageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    return { title: "Website Not Found | ComplianceKit" };
  }

  return {
    title: `Scan ${website.name} | ComplianceKit`,
    description: `Run a compliance scan for ${website.url}`,
  };
}

export default async function ScanPage({ params }: ScanPageProps) {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    notFound();
  }

  const scans = await getWebsiteScans(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/websites/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Scan {website.name}
          </h1>
          <p className="text-muted-foreground">{website.url}</p>
        </div>
        <ScanButton websiteId={id} />
      </div>

      {/* Scan Info */}
      <Card>
        <CardHeader>
          <CardTitle>What We Scan For</CardTitle>
          <CardDescription>
            Our scanner checks your website for GDPR compliance issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Detect all cookies and categorize them by purpose
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Tracking Scripts</h3>
              <p className="text-sm text-muted-foreground">
                Identify analytics, marketing, and social media trackers
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">
                Check for the presence of a privacy policy link
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Cookie Banner</h3>
              <p className="text-sm text-muted-foreground">
                Verify a cookie consent banner is present
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Previous compliance scans</CardDescription>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No scans yet</h3>
              <p className="text-muted-foreground">
                Run your first scan to check compliance
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        scan.status === "completed"
                          ? "bg-green-500/10"
                          : scan.status === "failed"
                          ? "bg-red-500/10"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {scan.status === "completed" && scan.score !== null ? (
                        <span
                          className={`text-sm font-bold ${
                            scan.score >= 60
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {scan.score}
                        </span>
                      ) : (
                        <Scan
                          className={`h-5 w-5 ${
                            scan.status === "completed"
                              ? "text-green-600"
                              : scan.status === "failed"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatDateTime(scan.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{scan.status}</span>
                        {scan._count && (
                          <>
                            <span>•</span>
                            <span>{scan._count.cookies} cookies</span>
                            <span>•</span>
                            <span>{scan._count.scripts} scripts</span>
                            <span>•</span>
                            <span>{scan._count.findings} findings</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {scan.status === "completed" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/websites/${id}/scans/${scan.id}`}>
                        View Results
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

