"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resumeSubscription } from "@/lib/actions/subscription";
import { cn } from "@/lib/utils";

interface ResumeSubscriptionButtonProps {
  className?: string;
}

export function ResumeSubscriptionButton({ className }: ResumeSubscriptionButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleResume() {
    setIsPending(true);

    try {
      const result = await resumeSubscription();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Subscription resumed successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to resume subscription");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      onClick={handleResume}
      disabled={isPending}
      className={cn(className)}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Resuming...
        </>
      ) : (
        "Resume Subscription"
      )}
    </Button>
  );
}



