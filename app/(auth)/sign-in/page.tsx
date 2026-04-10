import { Suspense } from "react";
import { Metadata } from "next";
import { AlertCircle, Loader2 } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | ComplianceKit",
  description: "Sign in to your ComplianceKit account",
};

const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Please use your email and password instead.",
  OAuthCallbackError: "Sign in with Google failed. Please try again.",
  UntrustedHost: "Authentication configuration error. Please contact support.",
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  Callback: "Authentication callback failed. Please try again.",
  AccessDenied: "Access was denied. Please try again.",
  Default: "Something went wrong signing you in. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const errorKey = params?.error;
  const errorMessage = errorKey
    ? (AUTH_ERRORS[errorKey] ?? AUTH_ERRORS.Default)
    : null;

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

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
