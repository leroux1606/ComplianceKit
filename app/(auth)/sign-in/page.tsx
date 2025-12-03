import { Suspense } from "react";
import { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | ComplianceKit",
  description: "Sign in to your ComplianceKit account",
};

export default function SignInPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome <span className="text-gradient">back</span>
        </h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
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
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
