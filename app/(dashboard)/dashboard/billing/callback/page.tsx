import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyPaymentAndActivate } from "@/lib/actions/subscription";

export const metadata: Metadata = {
  title: "Payment Verification | ComplianceKit",
  description: "Verifying your payment",
};

interface CallbackPageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const { reference, trxref } = await searchParams;
  const paymentReference = reference || trxref;

  if (!paymentReference) {
    redirect("/dashboard/billing");
  }

  // Verify the payment
  const result = await verifyPaymentAndActivate(paymentReference);

  if (result.success) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Payment Successful!</CardTitle>
            <CardDescription>
              Your subscription has been activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Thank you for subscribing to ComplianceKit. You now have access to
              all the features included in your plan.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/billing">View Billing Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Payment Failed</CardTitle>
          <CardDescription>
            We couldn&apos;t verify your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {result.error || "Something went wrong with your payment. Please try again or contact support."}
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/pricing">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



