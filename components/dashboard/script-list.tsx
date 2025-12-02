"use client";

import { Code, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { truncate } from "@/lib/utils";

interface ScriptData {
  id: string;
  url: string | null;
  content: string | null;
  type: string;
  category: string | null;
  name: string | null;
}

interface ScriptListProps {
  scripts: ScriptData[];
}

const categoryColors: Record<string, string> = {
  analytics: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  functional: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  social: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  unknown: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function ScriptList({ scripts }: ScriptListProps) {
  // Filter to only show identified scripts
  const identifiedScripts = scripts.filter(
    (s) => s.category && s.category !== "unknown"
  );

  if (identifiedScripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Code className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Tracking Scripts Detected</h3>
        <p className="text-sm text-muted-foreground">
          No known tracking or analytics scripts were found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {identifiedScripts.length} tracking scripts detected
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Script</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {identifiedScripts.map((script) => (
              <TableRow key={script.id}>
                <TableCell className="font-medium">
                  {script.name || "Unknown Script"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={categoryColors[script.category || "unknown"]}
                  >
                    {script.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {script.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {script.url ? (
                    <a
                      href={script.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {truncate(new URL(script.url).hostname, 30)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Inline</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

