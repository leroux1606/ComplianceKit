"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifyInstallationButtonProps {
  websiteId: string;
  className?: string;
}

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "detected"; message: string }
  | { status: "not_detected"; message: string };

export function VerifyInstallationButton({
  websiteId,
  className,
}: VerifyInstallationButtonProps) {
  const [state, setState] = useState<VerifyState>({ status: "idle" });

  async function handleVerify() {
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/websites/${websiteId}/verify-installation`);
      const data = (await res.json()) as { detected: boolean; message: string };
      setState({
        status: data.detected ? "detected" : "not_detected",
        message: data.message,
      });
    } catch {
      setState({
        status: "not_detected",
        message: "Could not complete verification. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className={className}
        onClick={handleVerify}
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="mr-2 h-4 w-4" />
        )}
        {state.status === "loading" ? "Checking…" : "Verify Installation"}
      </Button>

      {state.status === "detected" && (
        <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === "not_detected" && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}
    </div>
  );
}
