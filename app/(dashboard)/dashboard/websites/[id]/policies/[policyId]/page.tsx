import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Info, Sparkles, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getWebsite } from "@/lib/actions/website";
import { getPolicy } from "@/lib/actions/policy";
import { DeletePolicyButton } from "@/components/dashboard/delete-policy-button";
import { DownloadPolicyButton } from "@/components/dashboard/download-policy-button";
import { CopyPolicyButton } from "@/components/dashboard/copy-policy-button";
import { PolicyEditor } from "@/components/dashboard/policy-editor";
import { formatDateTime } from "@/lib/utils";

interface PolicyPageProps {
  params: Promise<{ id: string; policyId: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { id, policyId } = await params;
  const website = await getWebsite(id);
  const policy = await getPolicy(policyId);

  if (!website || !policy) {
    return { title: "Policy Not Found | ComplianceKit" };
  }

  const policyType = policy.type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";
  return {
    title: `${policyType} v${policy.version} - ${website.name} | ComplianceKit`,
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link href="/dashboard/websites" className="hover:text-foreground transition-colors">Websites</Link>
              <span>/</span>
              <Link href={`/dashboard/websites/${id}`} className="hover:text-foreground transition-colors">{website.name}</Link>
              <span>/</span>
              <Link href={`/dashboard/websites/${id}/policies`} className="hover:text-foreground transition-colors">Policies</Link>
              <span>/</span>
              <span className="text-foreground">{policyType}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {website.name} — {policyType}
              </h1>
              {policy.isActive && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              )}
              {policy.isAiGenerated && (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              )}
              <Badge variant="outline" className="text-muted-foreground">
                v{policy.version}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Generated {formatDateTime(policy.generatedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <CopyPolicyButton content={policy.content} />
          <DownloadPolicyButton policy={policy} websiteName={website.name} />
          <DeletePolicyButton policyId={policy.id} websiteId={id} />
        </div>
      </div>

      {/* AI Review Banner */}
      {policy.isAiGenerated && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <div className="text-amber-800 dark:text-amber-200">
            <span className="font-semibold flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Generated Policy — Human Review Required
            </span>
            This policy was written by Claude AI based on your scan data and company details.
            AI output may contain errors or omissions. Before publishing:
            <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-xs">
              <li>Read the entire policy for accuracy against your actual data practices</li>
              <li>Verify company name, contact details, and DPO information are correct</li>
              <li>Have it reviewed by legal counsel before using it on your website</li>
            </ul>
            Use the <strong>Edit</strong> tab below to make corrections.
          </div>
        </div>
      )}

      {/* Standard Info Banner */}
      {!policy.isAiGenerated && (
        <div className="flex items-start gap-3 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-foreground" />
          <div>
            <span className="font-medium text-foreground">How this policy was generated: </span>
            Content is based on your website scan results (cookies, tracking scripts) and your company
            details from Settings. Each website gets a unique policy. Use the <strong className="text-foreground">Edit</strong> tab
            to customise before publishing. Always have policies reviewed by legal counsel.
          </div>
        </div>
      )}

      {/* Policy Content */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Content</CardTitle>
          <CardDescription>
            Preview, edit, or download your policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="html">HTML Source</TabsTrigger>
            </TabsList>

            {/* Preview Tab - iframe for correct HTML rendering */}
            <TabsContent value="preview" className="mt-4">
              <iframe
                srcDoc={policy.htmlContent || ""}
                className="w-full rounded-lg border bg-white"
                style={{ height: "600px" }}
                sandbox="allow-same-origin"
                title={`${policyType} Preview`}
              />
            </TabsContent>

            {/* Edit Tab */}
            <TabsContent value="edit" className="mt-4">
              <PolicyEditor policyId={policy.id} content={policy.content} />
            </TabsContent>

            {/* HTML Source Tab */}
            <TabsContent value="html" className="mt-4">
              <pre className="w-full overflow-x-auto rounded-lg border bg-muted p-4 text-xs font-mono whitespace-pre-wrap">
                {policy.htmlContent}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
