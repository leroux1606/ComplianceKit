import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddWebsiteForm } from "@/components/dashboard/add-website-form";

export const metadata: Metadata = {
  title: "Add Website | ComplianceKit",
  description: "Add a new website to track",
};

export default function NewWebsitePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/websites">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Website</h1>
          <p className="text-muted-foreground">
            Add a new website to start tracking compliance
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Website Details</CardTitle>
          <CardDescription>
            Enter the details of the website you want to track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddWebsiteForm />
        </CardContent>
      </Card>
    </div>
  );
}



