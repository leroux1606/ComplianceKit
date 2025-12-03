import { Suspense } from "react";
import { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | ComplianceKit",
  description: "Create your ComplianceKit account",
};

export default function SignUpPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create an <span className="text-gradient">account</span>
        </h1>
        <p className="text-muted-foreground">
          Start your GDPR compliance journey today
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
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
