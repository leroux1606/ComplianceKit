"use client";

import { useRouter } from "next/navigation";
import { 
  FileText, 
  Cookie, 
  Calendar, 
  Hash,
  ExternalLink,
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
import type { Policy } from "@prisma/client";

interface PolicyListProps {
  policies: Policy[];
  websiteId: string;
}

export function PolicyList({ policies, websiteId }: PolicyListProps) {
  const router = useRouter();

  if (policies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No policies generated yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Generate your first privacy or cookie policy using the generator above.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group policies by type and get latest active
  const privacyPolicies = policies.filter(p => p.type === "privacy_policy");
  const cookiePolicies = policies.filter(p => p.type === "cookie_policy");

  return (
    <div className="space-y-6">
      {/* Privacy Policies */}
      {privacyPolicies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Privacy Policies</h3>
            <Badge variant="secondary">{privacyPolicies.length}</Badge>
          </div>
          <div className="grid gap-3">
            {privacyPolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                websiteId={websiteId}
                onView={() => router.push(`/dashboard/websites/${websiteId}/policies/${policy.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cookie Policies */}
      {cookiePolicies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Cookie Policies</h3>
            <Badge variant="secondary">{cookiePolicies.length}</Badge>
          </div>
          <div className="grid gap-3">
            {cookiePolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                websiteId={websiteId}
                onView={() => router.push(`/dashboard/websites/${websiteId}/policies/${policy.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PolicyCardProps {
  policy: Policy;
  websiteId: string;
  onView: () => void;
}

function PolicyCard({ policy, onView }: PolicyCardProps) {
  const policyTitle = policy.type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";
  const Icon = policy.type === "privacy_policy" ? FileText : Cookie;

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {policyTitle}
                {policy.isActive && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  v{policy.version}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(policy.generatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onView}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

