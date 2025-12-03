import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditWebsiteForm } from "@/components/dashboard/edit-website-form";
import { getWebsite } from "@/lib/actions/website";

interface EditWebsitePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditWebsitePageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    return { title: "Website Not Found | ComplianceKit" };
  }

  return {
    title: `Edit ${website.name} | ComplianceKit`,
    description: `Edit settings for ${website.url}`,
  };
}

export default async function EditWebsitePage({
  params,
}: EditWebsitePageProps) {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/websites/${website.id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Website</h1>
          <p className="text-muted-foreground">
            Update the details for {website.name}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Website Details</CardTitle>
          <CardDescription>
            Make changes to your website information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditWebsiteForm website={website} />
        </CardContent>
      </Card>
    </div>
  );
}



