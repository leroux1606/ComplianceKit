"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DsarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">Failed to load request</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Something went wrong while loading this data subject request.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">ID: {error.digest}</p>
      )}
      <Button onClick={reset} size="sm">Try again</Button>
    </div>
  );
}
