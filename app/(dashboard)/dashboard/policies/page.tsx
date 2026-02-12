import { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Policies | ComplianceKit",
  description: "Manage your legal policies and documents",
};

export default async function PoliciesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Policies</h1>
          <p className="text-muted-foreground">
            Generate and manage privacy policies, cookie policies, and terms of service
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Policy
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Policy Generator Coming Soon</CardTitle>
          </div>
          <CardDescription>
            Automatically generate GDPR-compliant legal documents for your websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This feature is currently under development. Soon you'll be able to:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Generate customized privacy policies based on your website's data collection practices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Create cookie policies that automatically list all cookies detected during scans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Manage terms of service and other legal documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Keep your policies up-to-date with automatic updates when your website changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Export policies in multiple formats (HTML, PDF, Markdown)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Multi-language support for EU compliance</span>
            </li>
          </ul>
          
          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">In the meantime:</p>
            <p className="text-sm text-muted-foreground mb-3">
              You can still manage policies for individual websites by going to:
            </p>
            <Link href="/dashboard/websites">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Manage Website Policies
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
