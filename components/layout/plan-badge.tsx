"use client";

import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  planName: string | null;
  maxWebsites: number;
  currentWebsites: number;
  className?: string;
}

export function PlanBadge({
  planName,
  maxWebsites,
  currentWebsites,
  className,
}: PlanBadgeProps) {
  const isFreePlan = !planName;
  const websiteText =
    maxWebsites === -1
      ? "Unlimited websites"
      : `${currentWebsites}/${maxWebsites} websites`;

  return (
    <div className={cn("rounded-lg bg-muted p-4", className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isFreePlan ? "bg-primary/10" : "bg-gradient-to-br from-amber-400 to-orange-500"
          )}
        >
          {isFreePlan ? (
            <Shield className="h-5 w-5 text-primary" />
          ) : (
            <Sparkles className="h-5 w-5 text-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{planName || "Free Plan"}</p>
          <p className="text-xs text-muted-foreground">{websiteText}</p>
        </div>
      </div>
      {isFreePlan && (
        <Link
          href="/pricing"
          className="mt-3 block text-center text-sm font-medium text-primary hover:underline"
        >
          Upgrade Plan
        </Link>
      )}
      {!isFreePlan && (
        <Link
          href="/dashboard/billing"
          className="mt-3 block text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Manage Subscription
        </Link>
      )}
    </div>
  );
}



