"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateAiPolicy } from "@/lib/actions/policy";

interface GenerateAiPolicyButtonProps {
  websiteId: string;
  type: "privacy_policy" | "cookie_policy";
  className?: string;
}

export function GenerateAiPolicyButton({
  websiteId,
  type,
  className,
}: GenerateAiPolicyButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await generateAiPolicy(websiteId, type);
      if (!result.success) {
        alert(result.error || "AI generation failed");
        setIsGenerating(false);
        return;
      }
      router.refresh();
      router.push(`/dashboard/websites/${websiteId}/policies/${result.policy.id}`);
    } catch (error) {
      alert(`Failed: ${(error as Error).message}`);
      setIsGenerating(false);
    }
  }

  const label = type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant="default"
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating with AI…
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          AI {label}
          <Badge variant="secondary" className="ml-2 text-xs py-0 px-1.5">
            New
          </Badge>
        </>
      )}
    </Button>
  );
}
