import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlanBySlug, PLANS } from "@/lib/plans";
import { CheckoutButton } from "@/components/billing/checkout-button";

export const metadata: Metadata = {
  title: "Checkout | ComplianceKit",
  description: "Complete your subscription",
};

interface CheckoutPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan: planSlug } = await searchParams;

  if (!planSlug) {
    redirect("/pricing");
  }

  const plan = getPlanBySlug(planSlug);

  if (!plan) {
    redirect("/pricing");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/pricing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your subscription to {plan.name}
        </p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            You&apos;re subscribing to the {plan.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <p className="font-semibold text-lg">{plan.name} Plan</p>
              <p className="text-sm text-muted-foreground">
                Billed {plan.interval}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R{plan.price}</p>
              <p className="text-sm text-muted-foreground">
                per {plan.interval === "monthly" ? "month" : "year"}
              </p>
            </div>
          </div>

          <div>
            <p className="font-medium mb-3">What&apos;s included:</p>
            <ul className="space-y-2">
              <FeatureItem>
                {plan.features.maxWebsites === -1
                  ? "Unlimited"
                  : plan.features.maxWebsites}{" "}
                website{plan.features.maxWebsites !== 1 ? "s" : ""}
              </FeatureItem>
              <FeatureItem>
                {plan.features.maxScansPerMonth === -1
                  ? "Unlimited"
                  : plan.features.maxScansPerMonth}{" "}
                scans per month
              </FeatureItem>
              {plan.features.cookieBanner && (
                <FeatureItem>Cookie consent banner</FeatureItem>
              )}
              {plan.features.policyGenerator && (
                <FeatureItem>Privacy & Cookie policy generator</FeatureItem>
              )}
              {plan.features.dsarManagement && (
                <FeatureItem>DSAR management</FeatureItem>
              )}
              {plan.features.customBranding && (
                <FeatureItem>Custom branding</FeatureItem>
              )}
              {plan.features.apiAccess && (
                <FeatureItem>API access</FeatureItem>
              )}
              {plan.features.prioritySupport && (
                <FeatureItem>Priority support</FeatureItem>
              )}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold">Total due today</p>
              <p className="text-2xl font-bold">R{plan.price}</p>
            </div>
            <CheckoutButton planSlug={plan.slug} planName={plan.name} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <p>Secure payment powered by PayStack</p>
          </div>
        </CardContent>
      </Card>

      {/* Other Plans */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Not the right plan?
        </p>
        <div className="flex justify-center gap-2">
          {PLANS.filter((p) => p.slug !== plan.slug).map((otherPlan) => (
            <Button key={otherPlan.slug} variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/billing/checkout?plan=${otherPlan.slug}`}>
                {otherPlan.name} - R{otherPlan.price}/mo
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

