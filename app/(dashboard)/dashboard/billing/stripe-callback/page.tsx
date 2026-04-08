import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { retrieveStripeCheckoutSession } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getPlanBySlug } from "@/lib/plans";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = {
  title: "Payment Confirmation | ComplianceKit",
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function StripeCallbackPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/dashboard/billing");
  }

  const authSession = await auth();
  if (!authSession?.user?.id) {
    redirect("/sign-in");
  }

  let success = false;
  let planName = "";

  try {
    const checkoutSession = await retrieveStripeCheckoutSession(session_id, ["subscription"]);

    if (checkoutSession.payment_status === "paid" || checkoutSession.status === "complete") {
      const planSlug = checkoutSession.metadata?.planSlug;
      const userId = checkoutSession.metadata?.userId;

      if (planSlug && userId === authSession.user.id) {
        const plan = getPlanBySlug(planSlug);
        if (plan) {
          planName = plan.name;
          const subscriptionId = typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription?.id;

          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await db.subscription.upsert({
            where: { userId },
            create: {
              userId,
              planId: plan.id,
              paystackPlanCode: `stripe:${plan.slug}`,
              paystackSubCode: subscriptionId ?? null,
              paystackCustomerCode: checkoutSession.customer as string,
              status: "active",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
            update: {
              planId: plan.id,
              paystackPlanCode: `stripe:${plan.slug}`,
              paystackSubCode: subscriptionId ?? null,
              paystackCustomerCode: checkoutSession.customer as string,
              status: "active",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              cancelledAt: null,
            },
          });

          success = true;
          revalidatePath("/dashboard");
          revalidatePath("/dashboard/billing");
        }
      }
    }
  } catch (error) {
    console.error("Stripe callback error:", error);
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-6 pt-8">
      {success ? (
        <>
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">Payment Successful</h1>
          <p className="text-muted-foreground">
            Your <span className="font-medium text-foreground">{planName}</span> plan
            is now active. You have full access to all included features.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <XCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Payment Not Confirmed</h1>
          <p className="text-muted-foreground">
            We could not confirm your payment. If you were charged, please
            contact support and we will resolve it within 24 hours.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/billing">Back to Billing</Link>
            </Button>
            <Button asChild>
              <Link href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
                Contact Support
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
