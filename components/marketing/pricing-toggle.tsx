"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/plans";
import { formatFeatureValue } from "@/lib/plans";

const featureLabels: Record<string, string> = {
  maxWebsites: "Websites",
  maxScansPerMonth: "Scans per month",
  cookieBanner: "Cookie consent banner",
  policyGenerator: "Policy generator",
  dsarManagement: "DSAR management",
  customBranding: "Custom branding",
  prioritySupport: "Priority support",
  apiAccess: "API access",
  teamMembers: "Team members",
  dataRetentionDays: "Data retention (days)",
};

interface PricingToggleProps {
  plans: Plan[];
  isSignedIn: boolean;
}

export function PricingToggle({ plans, isSignedIn }: PricingToggleProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Monthly / Annual toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((a) => !a)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            annual ? "bg-primary" : "bg-muted-foreground/30"
          }`}
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
          <Badge className="bg-green-600 text-white text-xs">Save 20%</Badge>
        </span>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const displayPrice = annual ? plan.yearlyPrice : plan.price;
          const displayPriceUsd = annual ? plan.yearlyPriceUsd : plan.priceUsd;
          const perLabel = annual ? "yr" : "mo";

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${displayPriceUsd}
                  </span>
                  <span className="text-muted-foreground">/{perLabel}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed as R{displayPrice.toLocaleString()} {annual ? "per year" : "per month"} via Paystack
                  </p>
                  {annual && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Save R{(plan.price * 12 - plan.yearlyPrice).toLocaleString()} vs monthly
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {Object.entries(plan.features).map(([key, value]) => {
                    const isEnabled = typeof value === "boolean" ? value : value !== 0;
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-2 text-sm ${!isEnabled ? "text-muted-foreground" : ""}`}
                      >
                        {isEnabled ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span>
                          {featureLabels[key]}
                          {typeof value === "number" && value !== 0 && (
                            <span className="font-medium ml-1">
                              ({formatFeatureValue(value)})
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link
                    href={
                      isSignedIn
                        ? `/dashboard/billing/checkout?plan=${plan.slug}&billing=${annual ? "annual" : "monthly"}`
                        : `/sign-up?plan=${plan.slug}&billing=${annual ? "annual" : "monthly"}`
                    }
                  >
                    Get Started
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
