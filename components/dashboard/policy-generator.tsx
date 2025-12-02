"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  FileText, 
  Cookie, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  CheckCircle2
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
import { generatePolicy, type PolicyType } from "@/lib/actions/policy";

interface PolicyGeneratorProps {
  websiteId: string;
  hasCompanyInfo: boolean;
  hasScanData: boolean;
  existingPolicies: {
    privacyPolicy?: { id: string; version: number; generatedAt: Date };
    cookiePolicy?: { id: string; version: number; generatedAt: Date };
  };
}

export function PolicyGenerator({
  websiteId,
  hasCompanyInfo,
  hasScanData,
  existingPolicies,
}: PolicyGeneratorProps) {
  const router = useRouter();
  const [generatingType, setGeneratingType] = useState<PolicyType | null>(null);

  async function handleGenerate(type: PolicyType) {
    if (!hasCompanyInfo) {
      toast.error("Please complete your company information first");
      return;
    }

    setGeneratingType(type);

    try {
      const result = await generatePolicy(websiteId, type);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `${type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy"} generated successfully`
      );
      router.refresh();
    } catch {
      toast.error("Failed to generate policy. Please try again.");
    } finally {
      setGeneratingType(null);
    }
  }

  const policies = [
    {
      type: "privacy_policy" as PolicyType,
      title: "Privacy Policy",
      description:
        "A comprehensive privacy policy that explains how you collect, use, and protect personal data.",
      icon: FileText,
      existing: existingPolicies.privacyPolicy,
    },
    {
      type: "cookie_policy" as PolicyType,
      title: "Cookie Policy",
      description:
        "A detailed cookie policy that lists all cookies used on your website and their purposes.",
      icon: Cookie,
      existing: existingPolicies.cookiePolicy,
    },
  ];

  return (
    <div className="space-y-4">
      {!hasCompanyInfo && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Company information required
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Please complete your company information above before generating policies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasScanData && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Run a scan for better policies
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Scanning your website will allow us to include specific cookie and tracking details in your policies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {policies.map((policy) => (
          <Card key={policy.type} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <policy.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    {policy.existing && (
                      <Badge variant="secondary" className="mt-1">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        v{policy.existing.version}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {policy.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policy.existing && (
                  <p className="text-xs text-muted-foreground">
                    Last generated:{" "}
                    {new Date(policy.existing.generatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerate(policy.type)}
                    disabled={!hasCompanyInfo || generatingType !== null}
                    className="flex-1"
                  >
                    {generatingType === policy.type ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {policy.existing ? "Regenerate" : "Generate"}
                      </>
                    )}
                  </Button>
                  {policy.existing && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/dashboard/websites/${websiteId}/policies/${policy.existing!.id}`
                        )
                      }
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

