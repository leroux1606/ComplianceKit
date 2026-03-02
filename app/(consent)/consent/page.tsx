import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ConsentForm } from "@/components/auth/consent-form";

export const metadata: Metadata = {
  title: "Accept Terms | ComplianceKit",
  description: "Please review and accept our Terms of Service and Privacy Policy to continue.",
};

export default async function ConsentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // If already consented, go straight to dashboard
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { consentedAt: true, email: true },
  });

  if (user?.consentedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">One last step</h1>
        <p className="text-muted-foreground">
          Before accessing ComplianceKit, please review and accept our terms.
        </p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
        <ConsentForm userEmail={user?.email ?? session.user.email ?? ""} />
      </div>
    </div>
  );
}
