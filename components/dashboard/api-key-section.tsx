"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Key, Eye, EyeOff, RefreshCw, Trash2, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateApiKey, revokeApiKey } from "@/lib/actions/api-key";

interface ApiKeySectionProps {
  hasKey: boolean;
  maskedKey: string | null;
}

export function ApiKeySection({ hasKey, maskedKey }: ApiKeySectionProps) {
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [keyExists, setKeyExists] = useState(hasKey);

  const displayKey = currentKey ?? maskedKey;

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await generateApiKey();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCurrentKey(result.key!);
      setKeyExists(true);
      setShowKey(true);
      toast.success("API key generated. Copy it now — it won't be shown again.");
    } catch {
      toast.error("Failed to generate API key.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRevoke() {
    if (!confirm("Are you sure you want to revoke your API key? Any integrations using it will stop working.")) return;
    setIsRevoking(true);
    try {
      const result = await revokeApiKey();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCurrentKey(null);
      setKeyExists(false);
      setShowKey(false);
      toast.success("API key revoked.");
    } catch {
      toast.error("Failed to revoke API key.");
    } finally {
      setIsRevoking(false);
    }
  }

  async function handleCopy() {
    if (!displayKey || displayKey.includes("•")) return;
    await navigator.clipboard.writeText(displayKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {keyExists ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                readOnly
                value={showKey && displayKey ? displayKey : "ck_live_" + "•".repeat(40)}
                className="font-mono text-sm pr-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!currentKey}
              title="Copy key"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {currentKey && (
            <p className="text-xs text-amber-600 font-medium">
              Copy this key now. For security, it will be masked after you leave this page.
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || isRevoking}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevoke}
              disabled={isRevoking || isGenerating}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Revoke
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No API key generated yet. Generate one to start using the ComplianceKit REST API.
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating} size="sm">
            <Key className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate API Key"}
          </Button>
        </div>
      )}

      <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Usage</p>
        <p>Pass your key in the <code className="bg-muted px-1 rounded">Authorization</code> header:</p>
        <code className="block bg-muted px-2 py-1 rounded font-mono">
          Authorization: Bearer ck_live_...
        </code>
        <p className="pt-1">
          Base URL: <code className="bg-muted px-1 rounded">{process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1</code>
        </p>
      </div>
    </div>
  );
}
