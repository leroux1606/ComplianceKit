import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS, FREE_TIER } from "@/lib/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

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
    select: { paystackPlanCode: true, status: true },
  });

  const activePlan =
    subscription?.status === "active"
      ? PLANS.find((p) => p.paystackPlanCode === subscription.paystackPlanCode)
      : null;

  const planName = activePlan?.name ?? "Free";
  const maxWebsites = activePlan?.features.maxWebsites ?? FREE_TIER.maxWebsites;

  return (
    <div className="flex h-screen">
      <Sidebar planName={planName} maxWebsites={maxWebsites} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-muted/30 p-6 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}




