"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Globe,
  MoreVertical,
  ExternalLink,
  Pencil,
  Trash2,
  Scan,
  FileText,
  Shield,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteWebsiteDialog } from "@/components/dashboard/delete-website-dialog";
import { formatDate, truncate } from "@/lib/utils";

interface WebsiteCardProps {
  website: {
    id: string;
    name: string;
    url: string;
    description: string | null;
    status: string;
    lastScanAt: Date | null;
    createdAt: Date;
    _count: {
      scans: number;
      policies: number;
    };
  };
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  scanning: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function WebsiteCard({ website }: WebsiteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="group transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  <Link
                    href={`/dashboard/websites/${website.id}`}
                    className="hover:underline"
                  >
                    {truncate(website.name, 30)}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    {truncate(website.url.replace(/^https?:\/\//, ""), 35)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/websites/${website.id}`}>
                    <Globe className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/websites/${website.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/websites/${website.id}/scan`}>
                    <Scan className="mr-2 h-4 w-4" />
                    Run Scan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {website.description && (
            <p className="text-sm text-muted-foreground">
              {truncate(website.description, 100)}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[website.status]}>
              {website.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {website._count.scans} scans
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {website._count.policies} policies
              </span>
            </div>
            <span>Added {formatDate(website.createdAt)}</span>
          </div>

          {website.lastScanAt && (
            <p className="text-xs text-muted-foreground">
              Last scanned: {formatDate(website.lastScanAt)}
            </p>
          )}
        </CardContent>
      </Card>

      <DeleteWebsiteDialog
        websiteId={website.id}
        websiteName={website.name}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}



