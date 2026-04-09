import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, XCircle, ArrowLeftRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { PLANS, FREE_TIER } from "@/lib/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CrispChat } from "@/components/layout/crisp-chat";
import { Button } from "@/components/ui/button";

// Days before a past_due subscription is fully blocked
const PAST_DUE_GRACE_DAYS = 7;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // GDPR Art. 7 — ensure OAuth users have explicitly consented before accessing data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { consentedAt: true },
  });

  if (!user?.consentedAt) {
    redirect("/consent");
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      paystackPlanCode: true,
      status: true,
      updatedAt: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: true,
    },
  });

  // Determine plan access
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const isCancelled =
    subscription?.status === "cancelled" ||
    (isActive && subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd < new Date());

  // Calculate how many days the subscription has been past_due
  const pastDueDays = isPastDue && subscription?.updatedAt
    ? Math.floor((Date.now() - new Date(subscription.updatedAt).getTime()) / 86_400_000)
    : 0;

  const isBlocked = isPastDue && pastDueDays >= PAST_DUE_GRACE_DAYS;

  const activePlan = isActive
    ? PLANS.find((p) => {
        const planSlug = subscription!.paystackPlanCode.replace("stripe:", "");
        return (
          p.paystackPlanCode === subscription!.paystackPlanCode || p.slug === planSlug
        );
      })
    : null;

  const planName = activePlan?.name ?? "Free";
  const maxWebsites = activePlan?.features.maxWebsites ?? FREE_TIER.maxWebsites;
  const maxTeamMembers = activePlan?.features.teamMembers ?? FREE_TIER.teamMembers;

  // Team context: memberships the current user belongs to + active account cookie
  const [teamMemberships, cookieStore] = await Promise.all([
    db.teamMember.findMany({
      where: { userId: session.user.id, status: "active" },
      select: {
        id: true,
        role: true,
        owner: { select: { id: true, name: true, email: true, companyName: true } },
      },
    }),
    cookies(),
  ]);
  const activeOwnerCookie = cookieStore.get("ck_active_owner")?.value ?? null;
  // Validate the cookie is still a real membership
  const activeOwnerId = activeOwnerCookie && teamMemberships.some((m) => m.owner.id === activeOwnerCookie)
    ? activeOwnerCookie
    : null;

  // Hard block — payment failed for more than grace period
  if (isBlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md text-center space-y-6">
          <XCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Payment Required</h1>
          <p className="text-muted-foreground">
            Your last payment failed {pastDueDays} days ago. Access to your
            dashboard has been suspended until your subscription is renewed.
          </p>
          <p className="text-sm text-muted-foreground">
            Your data is safe and will be restored as soon as payment is
            confirmed.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard/billing">Renew Subscription</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        planName={planName}
        maxWebsites={maxWebsites}
        maxTeamMembers={maxTeamMembers}
        teamMemberships={teamMemberships}
        activeOwnerId={activeOwnerId}
        currentUserEmail={session.user.email!}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        {/* Team context banner — shown when viewing another account */}
        {activeOwnerId && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-6 py-2">
            <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
              Viewing{" "}
              <strong>
                {teamMemberships.find((m) => m.owner.id === activeOwnerId)?.owner.companyName ||
                  teamMemberships.find((m) => m.owner.id === activeOwnerId)?.owner.name ||
                  teamMemberships.find((m) => m.owner.id === activeOwnerId)?.owner.email}
              </strong>
              &apos;s workspace
            </p>
            <form action={async () => {
              "use server";
              const { switchActiveAccount } = await import("@/lib/actions/team");
              await switchActiveAccount(null);
            }}>
              <Button type="submit" size="sm" variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:border-blue-700 shrink-0 h-7 text-xs">
                Switch to my account
              </Button>
            </form>
          </div>
        )}

        {/* Past-due warning banner — shown during grace period */}
        {isPastDue && !isBlocked && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-6 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
              <strong>Payment failed.</strong> Your subscription will be suspended in{" "}
              {PAST_DUE_GRACE_DAYS - pastDueDays} day{PAST_DUE_GRACE_DAYS - pastDueDays !== 1 ? "s" : ""}{" "}
              if not renewed.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-900 shrink-0"
            >
              <Link href="/dashboard/billing">Update Payment</Link>
            </Button>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-muted/30 p-6 focus:outline-none"
        >
          {children}
        </main>
      </div>
      <CrispChat />
    </div>
  );
}




