"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { acceptOAuthConsent } from "@/lib/actions/consent-gate";

export function ConsentForm({ userEmail }: { userEmail: string }) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageConfirmation, setAgeConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Signing in as <span className="font-medium text-foreground">{userEmail}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Age verification — GDPR Art. 8 */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="age"
            checked={ageConfirmation}
            onCheckedChange={(v) => setAgeConfirmation(v === true)}
            disabled={isLoading}
          />
          <Label htmlFor="age" className="cursor-pointer text-sm font-normal leading-snug">
            I confirm that I am <span className="font-semibold">16 years of age or older</span>
          </Label>
        </div>

        {/* Terms & Privacy consent — GDPR Art. 7 */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(v === true)}
            disabled={isLoading}
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-snug">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-primary underline hover:no-underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-primary underline hover:no-underline">
              Privacy Policy
            </Link>
            , including the processing of my personal data as described therein.
          </Label>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 space-y-1">
            {errors.map((err) => (
              <p key={err} className="text-sm text-destructive">{err}</p>
            ))}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms || !ageConfirmation}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
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
