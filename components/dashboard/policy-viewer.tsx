"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Download, 
  Copy, 
  Trash2, 
  ArrowLeft,
  FileText,
  Calendar,
  Hash,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePolicy } from "@/lib/actions/policy";
import type { Policy } from "@prisma/client";

interface PolicyViewerProps {
  policy: Policy;
  websiteUrl: string;
}

export function PolicyViewer({ policy, websiteUrl }: PolicyViewerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const policyTitle = policy.type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy";

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deletePolicy(policy.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Policy deleted successfully");
      router.push(`/dashboard/websites/${policy.websiteId}/policies`);
    } catch {
      toast.error("Failed to delete policy");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCopyHtml() {
    navigator.clipboard.writeText(policy.htmlContent || policy.content);
    toast.success("HTML copied to clipboard");
  }

  function handleCopyText() {
    // Strip HTML tags for plain text
    const text = (policy.htmlContent || policy.content)
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard");
  }

  function handleDownloadHtml() {
    const blob = new Blob([policy.htmlContent || policy.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.type}-v${policy.version}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded");
  }

  function handleDownloadText() {
    const text = (policy.htmlContent || policy.content)
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.type}-v${policy.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/websites/${policy.websiteId}/policies`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Policy?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this version of the policy. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Policy Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{policyTitle}</CardTitle>
                <CardDescription>{websiteUrl}</CardDescription>
              </div>
            </div>
            {policy.isActive && (
              <Badge variant="default">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Version {policy.version}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Generated {new Date(policy.generatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export & Copy</CardTitle>
          <CardDescription>
            Download or copy your policy in different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Button variant="outline" onClick={handleCopyHtml}>
              <Copy className="h-4 w-4 mr-2" />
              Copy HTML
            </Button>
            <Button variant="outline" onClick={handleCopyText}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Text
            </Button>
            <Button variant="outline" onClick={handleDownloadHtml}>
              <Download className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
            <Button variant="outline" onClick={handleDownloadText}>
              <Download className="h-4 w-4 mr-2" />
              Download Text
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Policy Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policy Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML Source</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none p-6 border rounded-lg bg-card"
                dangerouslySetInnerHTML={{ __html: policy.htmlContent || policy.content }}
              />
            </TabsContent>
            <TabsContent value="html" className="mt-4">
              <pre className="p-4 border rounded-lg bg-muted overflow-x-auto text-xs">
                <code>{policy.htmlContent || policy.content}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

