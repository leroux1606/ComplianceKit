"use client";

import { useState } from "react";
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

export function ScanButton({
  websiteId,
  variant = "default",
  size = "default",
  className,
}: ScanButtonProps) {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);

  async function handleScan() {
    setIsScanning(true);
    toast.info("Starting scan...", { duration: 2000 });

    const result = await triggerScan(websiteId);

    if (result.error) {
      toast.error(result.error);
      setIsScanning(false);
      return;
    }

    toast.success(`Scan completed! Score: ${result.score}/100`);
    setIsScanning(false);
    router.push(`/dashboard/websites/${websiteId}/scans/${result.scanId}`);
    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleScan}
      disabled={isScanning}
      className={className}
    >
      {isScanning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Scanning...
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

