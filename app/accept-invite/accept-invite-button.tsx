"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { acceptTeamInvite } from "@/lib/actions/team";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function handleAccept() {
    setIsPending(true);
    try {
      const result = await acceptTeamInvite(token);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAccepted(true);
      toast.success(`Joined ${result.ownerName}'s workspace!`);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error("Failed to accept invitation.");
    } finally {
      setIsPending(false);
    }
  }

  if (accepted) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2">
        <CheckCircle2 className="h-5 w-5" />
        Invitation accepted! Redirecting…
      </div>
    );
  }

  return (
    <Button onClick={handleAccept} disabled={isPending} className="w-full" size="lg">
      {isPending ? "Accepting…" : "Accept Invitation"}
    </Button>
  );
}
