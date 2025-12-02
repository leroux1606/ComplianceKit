import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WebsiteList } from "@/components/dashboard/website-list";
import { getWebsites } from "@/lib/actions/website";

export const metadata: Metadata = {
  title: "Websites | ComplianceKit",
  description: "Manage your websites",
};

export default async function WebsitesPage() {
  const websites = await getWebsites();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Websites</h1>
          <p className="text-muted-foreground">
            Manage your websites and their compliance status
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/websites/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Link>
        </Button>
      </div>

      <WebsiteList websites={websites} />
    </div>
  );
}

