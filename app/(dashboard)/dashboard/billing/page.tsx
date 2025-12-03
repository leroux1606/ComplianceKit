import { Metadata } from "next";
import Link from "next/link";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  Receipt
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserSubscription, getUserInvoices } from "@/lib/actions/subscription";
import { formatAmount } from "@/lib/paystack";
import { CancelSubscriptionButton } from "@/components/billing/cancel-subscription-button";
import { ResumeSubscriptionButton } from "@/components/billing/resume-subscription-button";

export const metadata: Metadata = {
  title: "Billing | ComplianceKit",
  description: "Manage your subscription and billing",
};

export default async function BillingPage() {
  const [subscriptionData, invoices] = await Promise.all([
    getUserSubscription(),
    getUserInvoices(),
  ]);

  const { subscription, plan, isActive } = subscriptionData || {
    subscription: null,
    plan: null,
    isActive: false,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view invoices
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </div>
            {isActive && subscription && (
              <Badge
                variant={subscription.cancelAtPeriodEnd ? "secondary" : "default"}
              >
                {subscription.cancelAtPeriodEnd ? "Cancelling" : "Active"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isActive && plan ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    R{plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      /mo
                    </span>
                  </p>
                </div>
              </div>

              {subscription && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} on{" "}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              )}

              {subscription?.cancelAtPeriodEnd && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Subscription ending
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your subscription will end on{" "}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                      You can resume it before then to keep your plan.
                    </p>
                    <ResumeSubscriptionButton className="mt-3" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Change Plan
                  </Link>
                </Button>
                {!subscription?.cancelAtPeriodEnd && (
                  <CancelSubscriptionButton />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Free Plan</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                You&apos;re currently on the free plan. Upgrade to unlock more
                features and higher limits.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      {isActive && plan && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What&apos;s included in your {plan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureItem
                label="Websites"
                value={
                  plan.features.maxWebsites === -1
                    ? "Unlimited"
                    : plan.features.maxWebsites.toString()
                }
              />
              <FeatureItem
                label="Scans per month"
                value={
                  plan.features.maxScansPerMonth === -1
                    ? "Unlimited"
                    : plan.features.maxScansPerMonth.toString()
                }
              />
              <FeatureItem
                label="Team members"
                value={
                  plan.features.teamMembers === -1
                    ? "Unlimited"
                    : plan.features.teamMembers.toString()
                }
              />
              <FeatureItem
                label="Cookie banner"
                value={plan.features.cookieBanner ? "Yes" : "No"}
                enabled={plan.features.cookieBanner}
              />
              <FeatureItem
                label="Policy generator"
                value={plan.features.policyGenerator ? "Yes" : "No"}
                enabled={plan.features.policyGenerator}
              />
              <FeatureItem
                label="DSAR management"
                value={plan.features.dsarManagement ? "Yes" : "No"}
                enabled={plan.features.dsarManagement}
              />
              <FeatureItem
                label="Custom branding"
                value={plan.features.customBranding ? "Yes" : "No"}
                enabled={plan.features.customBranding}
              />
              <FeatureItem
                label="API access"
                value={plan.features.apiAccess ? "Yes" : "No"}
                enabled={plan.features.apiAccess}
              />
              <FeatureItem
                label="Data retention"
                value={`${plan.features.dataRetentionDays} days`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>Your billing history</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {formatAmount(Number(invoice.amount) * 100, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "paid"
                            ? "default"
                            : invoice.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {invoice.paystackRef || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureItem({
  label,
  value,
  enabled = true,
}: {
  label: string;
  value: string;
  enabled?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg bg-muted/50 ${!enabled ? "opacity-50" : ""}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}



