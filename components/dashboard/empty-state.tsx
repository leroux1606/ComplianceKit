import Link from "next/link";
import { Globe, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No websites yet",
  description = "Add your first website to start scanning for cookies and generating compliance documents.",
  actionLabel = "Add Website",
  actionHref = "/dashboard/websites/new",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Globe className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link href={actionHref}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}



