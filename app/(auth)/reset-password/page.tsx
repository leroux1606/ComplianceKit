import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password | ComplianceKit",
  description: "Set a new password for your ComplianceKit account",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Reset your <span className="text-gradient">password</span>
        </h1>
        <p className="text-muted-foreground">
          Enter a new password for your account
        </p>
      </div>
      
      <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
