"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePolicy } from "@/lib/actions/policy";

interface GeneratePolicyButtonProps {
  websiteId: string;
  type: "privacy_policy" | "cookie_policy";
  className?: string;
}

export function GeneratePolicyButton({
  websiteId,
  type,
  className,
}: GeneratePolicyButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setIsGenerating(true);

    try {
      const policy = await generatePolicy(websiteId, type);
      router.refresh();
      
      // Optionally redirect to the new policy
      router.push(`/dashboard/websites/${websiteId}/policies/${policy.id}`);
    } catch (error) {
      console.error("Failed to generate policy:", error);
      alert(
        `Failed to generate policy: ${(error as Error).message}`
      );
      setIsGenerating(false);
    }
  }

  const label = type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Generate {label}
        </>
      )}
    </Button>
  );
}
