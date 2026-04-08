"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initializeSubscription } from "@/lib/actions/subscription";

interface CheckoutButtonProps {
  planSlug: string;
  planName: string;
  billing?: "monthly" | "annual";
}

export function CheckoutButton({ planSlug, planName, billing = "monthly" }: CheckoutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleCheckout() {
    setIsPending(true);

    try {
      const result = await initializeSubscription(planSlug, billing);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.authorizationUrl) {
        // Redirect to PayStack checkout
        window.location.href = result.authorizationUrl;
      }
    } catch {
      toast.error("Failed to initialize checkout. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isPending}
      className="w-full"
      size="lg"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Subscribe to {planName}
        </>
      )}
    </Button>
  );
}



