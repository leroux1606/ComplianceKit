import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, Eye, Code, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWebsite } from "@/lib/actions/website";
import { getPolicy } from "@/lib/actions/policy";
import { DeletePolicyButton } from "@/components/dashboard/delete-policy-button";
import { DownloadPolicyButton } from "@/components/dashboard/download-policy-button";
import { CopyPolicyButton } from "@/components/dashboard/copy-policy-button";
import { PrintPolicyButton } from "@/components/dashboard/print-policy-button";
import { formatDateTime } from "@/lib/utils";

interface PolicyPageProps {
  params: Promise<{ id: string; policyId: string }>;
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { id, policyId } = await params;
  const website = await getWebsite(id);
  const policy = await getPolicy(policyId);

  if (!website || !policy) {
    return { title: "Policy Not Found | ComplianceKit" };
  }

  const policyType = policy.type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";

  return {
    title: `${policyType} v${policy.version} - ${website.name} | ComplianceKit`,
    description: `View ${policyType} for ${website.url}`,
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { id, policyId } = await params;
  const website = await getWebsite(id);
  const policy = await getPolicy(policyId);

  if (!website || !policy) {
    notFound();
  }

  const policyType = policy.type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/websites/${id}/policies`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {policyType} v{policy.version}
              </h1>
              {policy.isActive && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {website.name} • Generated {formatDateTime(policy.generatedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <CopyPolicyButton content={policy.content} />
          <PrintPolicyButton />
          <DownloadPolicyButton policy={policy} websiteName={website.name} />
          <DeletePolicyButton policyId={policy.id} websiteId={id} />
        </div>
      </div>

      {/* Policy Content */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Content</CardTitle>
          <CardDescription>
            Review and download this policy for publication on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="markdown">
                <Code className="mr-2 h-4 w-4" />
                Markdown
              </TabsTrigger>
              <TabsTrigger value="html">
                <Code className="mr-2 h-4 w-4" />
                HTML
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <div
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: policy.htmlContent || "" }}
              />
            </TabsContent>

            <TabsContent value="markdown" className="mt-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {policy.content}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="html" className="mt-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {policy.htmlContent}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How to Use This Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <p className="font-medium text-foreground mb-1">1. Review the Content</p>
            <p>Carefully review the generated policy to ensure it accurately reflects your data practices.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">2. Customize as Needed</p>
            <p>Download the policy and customize it to match your specific requirements. Add your company details and legal disclaimers.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">3. Legal Review</p>
            <p>Have the policy reviewed by legal counsel before publishing it on your website.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">4. Publish on Your Website</p>
            <p>Add the policy to your website and link to it from your footer and cookie banner.</p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs">
              <strong>Important:</strong> This is a generated template based on automated scans. It should be reviewed by qualified legal professionals before use.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
