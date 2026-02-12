import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWebsite } from "@/lib/actions/website";
import { getPolicies } from "@/lib/actions/policy";
import { GeneratePolicyButton } from "@/components/dashboard/generate-policy-button";
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
  const website = await getWebsite(id);
  const policies = await getPolicies(id);

  if (!website) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Policy Management</h1>
            <p className="text-muted-foreground">{website.name}</p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                GDPR-compliant privacy policy based on your website's data collection
              </CardDescription>
            </div>
            <GeneratePolicyButton websiteId={id} type="privacy_policy" />
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
              <GeneratePolicyButton
                websiteId={id}
                type="privacy_policy"
                className="mt-4"
              />
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cookie Policy
              </CardTitle>
              <CardDescription>
                Detailed cookie policy explaining all cookies used on your website
              </CardDescription>
            </div>
            <GeneratePolicyButton websiteId={id} type="cookie_policy" />
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
              <GeneratePolicyButton
                websiteId={id}
                type="cookie_policy"
                className="mt-4"
              />
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

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">About Policy Generation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Policies are automatically generated based on your latest website scan results
          </p>
          <p>
            • Each time you generate a policy, a new version is created and marked as active
          </p>
          <p>
            • Privacy policies cover data collection, user rights, and GDPR compliance
          </p>
          <p>
            • Cookie policies list all detected cookies with their purposes and durations
          </p>
          <p className="pt-2 text-xs">
            <strong>Note:</strong> Generated policies are templates and should be reviewed by legal counsel before publication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
