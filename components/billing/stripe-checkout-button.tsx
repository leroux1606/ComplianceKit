"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initializeStripeCheckout } from "@/lib/actions/stripe";

interface StripeCheckoutButtonProps {
  planSlug: string;
  planName: string;
}

export function StripeCheckoutButton({ planSlug, planName }: StripeCheckoutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleCheckout() {
    setIsPending(true);

    try {
      const result = await initializeStripeCheckout(planSlug);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch {
      toast.error("Failed to initialize USD checkout. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isPending}
      variant="outline"
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
          <Globe className="mr-2 h-4 w-4" />
          Pay in USD — {planName}
        </>
      )}
    </Button>
  );
}
