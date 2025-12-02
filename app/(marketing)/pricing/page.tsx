import { Metadata } from "next";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, formatFeatureValue } from "@/lib/plans";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pricing | ComplianceKit",
  description: "Choose the right plan for your GDPR compliance needs",
};

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

export default async function PricingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ComplianceKit
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose the right plan for your business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with our free tier and upgrade as you grow. All plans include
            our core compliance features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
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
                      R{plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.interval === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {Object.entries(plan.features).map(([key, value]) => {
                      const isEnabled =
                        typeof value === "boolean" ? value : value !== 0;
                      return (
                        <li
                          key={key}
                          className={`flex items-center gap-2 text-sm ${
                            !isEnabled ? "text-muted-foreground" : ""
                          }`}
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
                        session
                          ? `/dashboard/billing/checkout?plan=${plan.slug}`
                          : `/sign-up?plan=${plan.slug}`
                      }
                    >
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tier */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Start for free</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Try ComplianceKit with our free tier. Get 1 website, 3 scans per
            month, and basic cookie banner functionality.
          </p>
          <Button variant="outline" asChild>
            <Link href={session ? "/dashboard" : "/sign-up"}>
              Start Free Trial
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">
                Can I change plans at any time?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we&apos;ll prorate any differences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and bank
                transfers through PayStack.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground">
                Yes! Our free tier allows you to test the core features with 1
                website and 3 scans per month. No credit card required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What happens if I exceed my plan limits?
              </h3>
              <p className="text-muted-foreground">
                We&apos;ll notify you when you&apos;re approaching your limits.
                You can upgrade your plan at any time to get more capacity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ComplianceKit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

