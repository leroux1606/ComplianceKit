"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { acceptOAuthConsent } from "@/lib/actions/consent-gate";
import { cn } from "@/lib/utils";

export function ConsentForm({ userEmail }: { userEmail: string }) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageConfirmation, setAgeConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!ageConfirmation) errs.push("You must confirm you are 16 years of age or older.");
    if (!acceptTerms) errs.push("You must accept the Terms of Service and Privacy Policy.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    await acceptOAuthConsent();
  }

  async function handleSwitchAccount() {
    setIsSwitching(true);
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <div className="space-y-6">
      {/* Account indicator with switch option */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Signing in as{" "}
            <span className="font-medium text-foreground">{userEmail}</span>
          </p>
          <button
            type="button"
            onClick={handleSwitchAccount}
            disabled={isSwitching || isLoading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
            aria-label="Sign out and use a different account"
          >
            {isSwitching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <LogOut className="h-3 w-3" />
            )}
            Use a different account
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Age verification — GDPR Art. 8 */}
        <div
          className={cn(
            "rounded-lg border p-4 transition-colors",
            ageConfirmation
              ? "border-primary/60 bg-primary/5"
              : "border-border hover:border-border/80 hover:bg-muted/30",
            isLoading && "pointer-events-none opacity-60"
          )}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="age"
              checked={ageConfirmation}
              onCheckedChange={(v) => setAgeConfirmation(v === true)}
              disabled={isLoading}
              className="mt-0.5 h-5 w-5 shrink-0 rounded"
            />
            <Label
              htmlFor="age"
              className="cursor-pointer text-sm font-normal leading-relaxed"
            >
              I confirm that I am{" "}
              <span className="font-semibold">16 years of age or older</span>
            </Label>
          </div>
        </div>

        {/* Terms & Privacy consent — GDPR Art. 7 */}
        <div
          className={cn(
            "rounded-lg border p-4 transition-colors",
            acceptTerms
              ? "border-primary/60 bg-primary/5"
              : "border-border hover:border-border/80 hover:bg-muted/30",
            isLoading && "pointer-events-none opacity-60"
          )}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(v) => setAcceptTerms(v === true)}
              disabled={isLoading}
              className="mt-0.5 h-5 w-5 shrink-0 rounded"
            />
            <Label
              htmlFor="terms"
              className="cursor-pointer text-sm font-normal leading-relaxed"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                Privacy Policy
              </Link>
              , including the processing of my personal data as described therein.
            </Label>
          </div>
        </div>

        {errors.length > 0 && (
          <div
            className="rounded-md bg-destructive/10 p-3 space-y-1"
            role="alert"
            aria-live="polite"
          >
            {errors.map((err) => (
              <p key={err} className="text-sm text-destructive">
                {err}
              </p>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSwitching || !acceptTerms || !ageConfirmation}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Continue to Dashboard
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        You can withdraw consent at any time from{" "}
        <span className="font-medium">Settings → Delete Account</span>.
      </p>
    </div>
  );
}
