import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BannerConfigForm } from "@/components/dashboard/banner-config-form";
import { getWebsite } from "@/lib/actions/website";
import { getBannerConfig, getDefaultBannerConfig } from "@/lib/actions/banner";

interface BannerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BannerPageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    return { title: "Website Not Found | ComplianceKit" };
  }

  return {
    title: `Cookie Banner - ${website.name} | ComplianceKit`,
    description: `Configure cookie consent banner for ${website.url}`,
  };
}

export default async function BannerPage({ params }: BannerPageProps) {
  const { id } = await params;
  const website = await getWebsite(id);

  if (!website) {
    notFound();
  }

  const bannerConfig = await getBannerConfig(id);
  const defaultConfig = await getDefaultBannerConfig();

  const initialConfig = bannerConfig
    ? {
        theme: bannerConfig.theme as "light" | "dark" | "custom",
        position: bannerConfig.position as "bottom" | "top" | "center",
        primaryColor: bannerConfig.primaryColor,
        textColor: bannerConfig.textColor,
        buttonStyle: bannerConfig.buttonStyle as "rounded" | "square" | "pill",
        animation: bannerConfig.animation as "slide" | "fade" | "none",
        customCss: bannerConfig.customCss || "",
      }
    : defaultConfig;

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
            <h1 className="text-3xl font-bold tracking-tight">Cookie Banner</h1>
            <p className="text-muted-foreground">
              Configure the cookie consent banner for {website.name}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/websites/${id}/embed`}>
            <Code className="mr-2 h-4 w-4" />
            Get Embed Code
          </Link>
        </Button>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Configuration</CardTitle>
          <CardDescription>
            Customize the appearance of your cookie consent banner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BannerConfigForm websiteId={id} initialConfig={initialConfig} />
        </CardContent>
      </Card>
    </div>
  );
}

