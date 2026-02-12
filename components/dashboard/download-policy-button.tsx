"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DownloadPolicyButtonProps {
  policy: {
    id: string;
    type: string;
    version: number;
    content: string;
    htmlContent: string | null;
  };
  websiteName: string;
}

export function DownloadPolicyButton({
  policy,
  websiteName,
}: DownloadPolicyButtonProps) {
  function downloadFile(content: string, extension: string, mimeType: string) {
    const policyType = policy.type === "privacy_policy" ? "privacy-policy" : "cookie-policy";
    const filename = `${websiteName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${policyType}-v${policy.version}.${extension}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleDownloadMarkdown() {
    downloadFile(policy.content, "md", "text/markdown");
  }

  function handleDownloadHTML() {
    if (policy.htmlContent) {
      downloadFile(policy.htmlContent, "html", "text/html");
    }
  }

  function handleDownloadText() {
    // Strip markdown formatting for plain text
    const plainText = policy.content
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");
    
    downloadFile(plainText, "txt", "text/plain");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadMarkdown}>
          Download as Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadHTML}>
          Download as HTML (.html)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadText}>
          Download as Text (.txt)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
