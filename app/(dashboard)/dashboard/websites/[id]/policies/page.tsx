import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWebsite } from "@/lib/actions/website";
import { getPolicies } from "@/lib/actions/policy";
import { getUserFeatures } from "@/lib/actions/subscription";
import { GeneratePolicyButton } from "@/components/dashboard/generate-policy-button";
import { GenerateAiPolicyButton } from "@/components/dashboard/generate-ai-policy-button";
import { formatDate } from "@/lib/utils";

interface WebsitePoliciesPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: WebsitePoliciesPageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    return { title: "Website Not Found | ComplianceKit" };
  }

  return {
    title: `Policies - ${website.name} | ComplianceKit`,
    description: `Manage privacy and cookie policies for ${website.url}`,
  };
}

export default async function WebsitePoliciesPage({
  params,
}: WebsitePoliciesPageProps) {
  const { id } = await params;
  const [website, policies, features] = await Promise.all([
    getWebsite(id),
    getPolicies(id),
    getUserFeatures(),
  ]);

  if (!website) {
    notFound();
  }

  const hasAiGenerator = features.aiPolicyGenerator;

  const privacyPolicies = policies.filter((p) => p.type === "privacy_policy");
  const cookiePolicies = policies.filter((p) => p.type === "cookie_policy");

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link href="/dashboard/websites" className="hover:text-foreground transition-colors">Websites</Link>
              <span>/</span>
              <Link href={`/dashboard/websites/${id}`} className="hover:text-foreground transition-colors">{website.name}</Link>
              <span>/</span>
              <span className="text-foreground">Policies</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Policy Management — {website.name}
            </h1>
            <p className="text-muted-foreground">{website.url.replace(/^https?:\/\//, "")}</p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                GDPR-compliant privacy policy based on your website's data collection
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasAiGenerator && (
                <GenerateAiPolicyButton websiteId={id} type="privacy_policy" />
              )}
              <GeneratePolicyButton websiteId={id} type="privacy_policy" variant={hasAiGenerator ? "outline" : "default"} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {privacyPolicies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Privacy Policy Yet</h3>
              <p className="text-muted-foreground mt-2">
                Generate a GDPR-compliant privacy policy based on your latest scan results
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {hasAiGenerator && (
                  <GenerateAiPolicyButton websiteId={id} type="privacy_policy" />
                )}
                <GeneratePolicyButton
                  websiteId={id}
                  type="privacy_policy"
                  variant={hasAiGenerator ? "outline" : "default"}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {privacyPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Privacy Policy v{policy.version}</p>
                        {policy.isActive && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Generated on {formatDate(policy.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/websites/${id}/policies/${policy.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cookie Policy Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cookie Policy
              </CardTitle>
              <CardDescription>
                Detailed cookie policy explaining all cookies used on your website
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasAiGenerator && (
                <GenerateAiPolicyButton websiteId={id} type="cookie_policy" />
              )}
              <GeneratePolicyButton websiteId={id} type="cookie_policy" variant={hasAiGenerator ? "outline" : "default"} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cookiePolicies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Cookie Policy Yet</h3>
              <p className="text-muted-foreground mt-2">
                Generate a comprehensive cookie policy based on detected cookies
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {hasAiGenerator && (
                  <GenerateAiPolicyButton websiteId={id} type="cookie_policy" />
                )}
                <GeneratePolicyButton
                  websiteId={id}
                  type="cookie_policy"
                  variant={hasAiGenerator ? "outline" : "default"}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cookiePolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Cookie Policy v{policy.version}</p>
                        {policy.isActive && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Generated on {formatDate(policy.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/websites/${id}/policies/${policy.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Upsell — shown only when AI generator not available */}
      {!hasAiGenerator && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-purple-700 dark:text-purple-300">
              <Plus className="h-4 w-4" />
              AI-Powered Policy Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Upgrade to <strong>Professional</strong> to generate custom policies written by Claude AI.
              Unlike templates, AI-generated policies are tailored to your specific data practices,
              cookie inventory, and company context.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/dashboard/billing">Upgrade to Professional</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">About Policy Generation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {hasAiGenerator ? (
            <>
              <p>• <strong className="text-foreground">AI Policy</strong> — written by Claude AI using your actual scan data: specific cookies, third-party services, and company details. More natural and specific than a template.</p>
              <p>• <strong className="text-foreground">Template Policy</strong> — structured template populated with your scan data. Faster, no AI credits used.</p>
            </>
          ) : (
            <p>• Policies are generated from a template populated with your website scan results and company details.</p>
          )}
          <p>• Each generation creates a new version; the latest is marked Active.</p>
          <p>• Privacy policies cover data collection, user rights, and GDPR compliance.</p>
          <p>• Cookie policies list all detected cookies with their purposes and durations.</p>
          <p className="pt-2 text-xs">
            <strong>Note:</strong> All generated policies should be reviewed by legal counsel before publication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
