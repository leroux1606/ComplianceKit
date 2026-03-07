import { Metadata } from "next";
import Link from "next/link";
import { Cookie, Code, CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceScore } from "@/components/dashboard/compliance-score";
import { FindingsList } from "@/components/dashboard/findings-list";
import { CookieList } from "@/components/dashboard/cookie-list";
import { ScriptList } from "@/components/dashboard/script-list";
import {
  DEMO_SITE_NAME,
  DEMO_SITE_URL,
  DEMO_SCORE,
  DEMO_FINDINGS,
  DEMO_COOKIES,
  DEMO_SCRIPTS,
} from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Live Demo | ComplianceKit",
  description:
    "See what ComplianceKit finds on a typical website — cookies, trackers, and compliance issues explained in plain English.",
};

export default async function DemoPage() {
  const session = await auth();

  const cookieStats = {
    total: DEMO_COOKIES.length,
    necessary: DEMO_COOKIES.filter((c) => c.category === "necessary").length,
    analytics: DEMO_COOKIES.filter((c) => c.category === "analytics").length,
    marketing: DEMO_COOKIES.filter((c) => c.category === "marketing").length,
  };

  const scriptStats = {
    total: DEMO_SCRIPTS.length,
    analytics: DEMO_SCRIPTS.filter((s) => s.category === "analytics").length,
    marketing: DEMO_SCRIPTS.filter((s) => s.category === "marketing").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ComplianceKit
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            See what ComplianceKit finds
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            This is a real scan result for a fictional e-commerce store. Every item you see below
            is exactly what ComplianceKit would find on your website — in plain English, with
            step-by-step fixes.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
            Sample data for &ldquo;{DEMO_SITE_NAME}&rdquo; ({DEMO_SITE_URL}) — not a real website
          </div>
        </div>
      </section>

      {/* Scan Results */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-6xl space-y-6">
          {/* Score + Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Compliance Score</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ComplianceScore score={DEMO_SCORE} size="lg" />
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Technical indicators only. Does not constitute legal advice — a high score does
                  not guarantee regulatory compliance.
                </p>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Privacy Policy</p>
                      <p className="text-sm text-muted-foreground">Not Found</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Cookie Banner</p>
                      <p className="text-sm text-muted-foreground">Not Found</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Cookie className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{cookieStats.total} Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        {cookieStats.analytics + cookieStats.marketing} tracking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{scriptStats.total} Scripts</p>
                      <p className="text-sm text-muted-foreground">
                        {scriptStats.analytics + scriptStats.marketing} trackers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cookieStats.total}</div>
                <div className="flex gap-2 mt-2">
                  {cookieStats.necessary > 0 && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      {cookieStats.necessary} necessary
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cookieStats.analytics}</div>
                <p className="text-xs text-muted-foreground">cookies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cookieStats.marketing}</div>
                <p className="text-xs text-muted-foreground">cookies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{DEMO_FINDINGS.length}</div>
                <p className="text-xs text-muted-foreground">findings</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="findings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="findings">
                Findings
                <Badge variant="secondary" className="ml-2">
                  {DEMO_FINDINGS.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cookies">
                Cookies
                <Badge variant="secondary" className="ml-2">
                  {DEMO_COOKIES.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="scripts">
                Scripts
                <Badge variant="secondary" className="ml-2">
                  {DEMO_SCRIPTS.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="findings">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Findings</CardTitle>
                  <CardDescription>
                    Issues and recommendations found on {DEMO_SITE_NAME}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FindingsList findings={DEMO_FINDINGS} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cookies">
              <Card>
                <CardHeader>
                  <CardTitle>Detected Cookies</CardTitle>
                  <CardDescription>
                    All cookies found on {DEMO_SITE_NAME}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CookieList cookies={DEMO_COOKIES} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scripts">
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Scripts</CardTitle>
                  <CardDescription>
                    Analytics and marketing scripts detected on {DEMO_SITE_NAME}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScriptList scripts={DEMO_SCRIPTS} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-t">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Ready to scan your website?
          </h2>
          <p className="text-muted-foreground mb-8">
            Get your real compliance report in under 2 minutes. Free tier includes 1 website and 3
            scans per month — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get your free compliance report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ComplianceKit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
