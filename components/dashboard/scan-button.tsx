"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Scan } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { triggerScan } from "@/lib/actions/scan";

interface ScanButtonProps {
  websiteId: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

type ScanPhase = "idle" | "queued" | "running" | "done";

const POLL_INTERVAL_MS = 3000;

export function ScanButton({
  websiteId,
  variant = "default",
  size = "default",
  className,
}: ScanButtonProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanIdRef = useRef<string | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startPolling(scanId: string) {
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}/status`);
        if (!res.ok) return;
        const data: { status: string; score?: number; error?: string } =
          await res.json();

        if (data.status === "running") {
          setPhase("running");
        } else if (data.status === "completed") {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPhase("done");
          toast.success(`Scan complete! Score: ${data.score}/100`);
          router.push(`/dashboard/websites/${websiteId}/scans/${scanId}`);
          router.refresh();
        } else if (data.status === "failed") {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPhase("idle");
          toast.error(data.error || "Scan failed. Please try again.");
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleScan() {
    setPhase("queued");
    toast.info("Queuing scan…", { duration: 2000 });

    // Phase 1: create the queued scan record (fast server action)
    const result = await triggerScan(websiteId);

    if (result.error) {
      toast.error(result.error);
      setPhase("idle");
      return;
    }

    const scanId = result.scanId!;
    scanIdRef.current = scanId;

    // Phase 2: kick off the scan executor — fire-and-forget, do NOT await
    fetch(`/api/scans/${scanId}/run`, { method: "POST" }).catch(() => {});

    // Phase 3: poll for status updates
    startPolling(scanId);
  }

  const isActive = phase !== "idle";

  const label =
    phase === "queued"
      ? "Queued…"
      : phase === "running"
        ? "Scanning…"
        : "Run Scan";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleScan}
      disabled={isActive}
      className={className}
    >
      {isActive ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {label}
        </>
      ) : (
        <>
          <Scan className="mr-2 h-4 w-4" />
          Run Scan
        </>
      )}
    </Button>
  );
}
