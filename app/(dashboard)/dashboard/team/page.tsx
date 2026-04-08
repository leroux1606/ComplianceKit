import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS, FREE_TIER } from "@/lib/plans";
import { getTeamMembers } from "@/lib/actions/team";
import { TeamPageClient } from "./team-page-client";

export const metadata: Metadata = {
  title: "Team | ComplianceKit",
  description: "Manage your team members",
};

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  // Get subscription for seat limit info
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true, paystackPlanCode: true },
  });

  const isActive = subscription?.status === "active";
  const plan = isActive
    ? PLANS.find((p) => {
        const slug = subscription!.paystackPlanCode.replace("stripe:", "");
        return p.paystackPlanCode === subscription!.paystackPlanCode || p.slug === slug;
      })
    : null;

  const features = plan?.features ?? FREE_TIER;
  const maxMembers = features.teamMembers; // -1 = unlimited
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Invite colleagues to collaborate on your ComplianceKit account.
          </p>
        </div>
      </div>

      <TeamPageClient
        members={members}
        maxMembers={maxMembers}
        planName={plan?.name ?? "Free"}
      />
    </div>
  );
}
