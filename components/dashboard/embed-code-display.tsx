"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface EmbedCodeDisplayProps {
  embedCode: string;
  appUrl: string;
}

export function EmbedCodeDisplay({ embedCode, appUrl }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const scriptCode = `<script src="${appUrl}/api/widget/${embedCode}/script.js" async></script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (!embedCode) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No embed code generated yet. Save your banner configuration first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <pre className="rounded-lg bg-slate-950 p-4 text-sm text-slate-50 overflow-x-auto">
          <code>{scriptCode}</code>
        </pre>
        <Button
          size="sm"
          variant="secondary"
          className="absolute right-2 top-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        This code will load the cookie consent banner asynchronously without
        affecting your page load speed.
      </p>
    </div>
  );
}



