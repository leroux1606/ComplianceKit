import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmbedCodeDisplay } from "@/components/dashboard/embed-code-display";
import { getWebsite } from "@/lib/actions/website";
import { getBannerConfig } from "@/lib/actions/banner";

interface EmbedPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EmbedPageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    return { title: "Website Not Found | ComplianceKit" };
  }

  return {
    title: `Embed Code - ${website.name} | ComplianceKit`,
    description: `Get embed code for ${website.url}`,
  };
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    notFound();
  }

  const bannerConfig = await getBannerConfig(id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://compliancekit.com";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/websites/${id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Embed Code</h1>
            <p className="text-muted-foreground">
              Add the cookie consent banner to {website.name}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/websites/${id}/banner`}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Banner
          </Link>
        </Button>
      </div>

      {/* Status */}
      {!bannerConfig && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                <Settings className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Banner not configured</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your banner appearance before embedding it on your website.
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href={`/dashboard/websites/${id}/banner`}>
                    Configure Banner
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
          <CardDescription>
            Copy and paste this code into your website&apos;s HTML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmbedCodeDisplay
            embedCode={website.embedCode || ""}
            appUrl={appUrl}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to add the cookie banner to your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Copy the embed code</h4>
                <p className="text-sm text-muted-foreground">
                  Click the copy button above to copy the embed code to your clipboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Paste in your HTML</h4>
                <p className="text-sm text-muted-foreground">
                  Add the code to the <code className="bg-muted px-1 rounded">&lt;head&gt;</code> section 
                  of your website, or just before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Test the banner</h4>
                <p className="text-sm text-muted-foreground">
                  Visit your website in a private/incognito window to see the banner in action.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">Framework-specific instructions</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>React/Next.js:</strong> Add the script to your{" "}
                <code className="bg-background px-1 rounded">_document.tsx</code> or{" "}
                <code className="bg-background px-1 rounded">layout.tsx</code>
              </p>
              <p>
                <strong>WordPress:</strong> Use a plugin like &quot;Insert Headers and Footers&quot; 
                or add to your theme&apos;s header.php
              </p>
              <p>
                <strong>Shopify:</strong> Add to theme.liquid in the{" "}
                <code className="bg-background px-1 rounded">&lt;head&gt;</code> section
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



