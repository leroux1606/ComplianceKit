import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password | ComplianceKit",
  description: "Reset your ComplianceKit account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <Link
        href="/sign-in"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Link>
      
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Forgot your <span className="text-gradient">password?</span>
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      
      <div className="rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
