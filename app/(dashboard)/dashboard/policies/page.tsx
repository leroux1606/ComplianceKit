import { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, Globe, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllPolicies } from "@/lib/actions/policy";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Policies | ComplianceKit",
  description: "Manage your legal policies and documents",
};

export default async function PoliciesPage() {
  const websites = await getAllPolicies();

  const totalPolicies = websites.reduce((sum, w) => sum + w.policies.length, 0);
  const websitesWithPolicies = websites.filter((w) => w.policies.length > 0).length;
  const websitesNeedingPolicies = websites.filter((w) => w.policies.length < 2).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Policies</h1>
          <p className="text-muted-foreground">
            Generate and manage privacy policies and cookie policies for your websites
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPolicies}</div>
            <p className="text-xs text-muted-foreground">across all websites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Websites Covered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websitesWithPolicies}</div>
            <p className="text-xs text-muted-foreground">of {websites.length} websites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websitesNeedingPolicies}</div>
            <p className="text-xs text-muted-foreground">websites missing policies</p>
          </CardContent>
        </Card>
      </div>

      {/* Website List */}
      {websites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No websites yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add a website to get started generating policies
            </p>
            <Button asChild>
              <Link href="/dashboard/websites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {websites.map((website) => {
            const hasPrivacyPolicy = website.policies.some((p) => p.type === "privacy_policy");
            const hasCookiePolicy = website.policies.some((p) => p.type === "cookie_policy");
            const hasScan = website.scans.length > 0 && website.scans[0].status === "completed";
            const privacyPolicy = website.policies.find((p) => p.type === "privacy_policy");
            const cookiePolicy = website.policies.find((p) => p.type === "cookie_policy");

            return (
              <Card key={website.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{website.name}</CardTitle>
                        <CardDescription>{website.url.replace(/^https?:\/\//, "")}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/websites/${website.id}/policies`}>
                        Manage Policies
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!hasScan && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 rounded-lg px-3 py-2 mb-4">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Run a scan first before generating policies</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-amber-600 ml-auto" asChild>
                        <Link href={`/dashboard/websites/${website.id}`}>Scan now →</Link>
                      </Button>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Privacy Policy */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Privacy Policy</p>
                          {hasPrivacyPolicy ? (
                            <p className="text-xs text-muted-foreground">
                              v{privacyPolicy!.version} · {formatDate(privacyPolicy!.generatedAt)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not generated</p>
                          )}
                        </div>
                      </div>
                      {hasPrivacyPolicy ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                          Missing
                        </Badge>
                      )}
                    </div>

                    {/* Cookie Policy */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Cookie Policy</p>
                          {hasCookiePolicy ? (
                            <p className="text-xs text-muted-foreground">
                              v{cookiePolicy!.version} · {formatDate(cookiePolicy!.generatedAt)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not generated</p>
                          )}
                        </div>
                      </div>
                      {hasCookiePolicy ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                          Missing
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
