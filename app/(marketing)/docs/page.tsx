import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Globe,
  ScanSearch,
  Cookie,
  Code,
  FileText,
  Inbox,
  ChevronRight,
  Puzzle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation | ComplianceKit",
  description: "Learn how to set up ComplianceKit and get your site GDPR-compliant in minutes.",
};

const sections = [
  {
    id: "getting-started",
    icon: Globe,
    title: "1. Getting Started",
    steps: [
      { heading: "Create an account", body: 'Go to compliancekit.com and click Get Started. Sign up with your email or Google account. No credit card required for the free plan.' },
      { heading: "Add your website", body: 'In the dashboard click Add Website, enter your site name and URL, then click Save. ComplianceKit will use this URL for scanning and embed code generation.' },
    ],
  },
  {
    id: "scanning",
    icon: ScanSearch,
    title: "2. Running a Compliance Scan",
    steps: [
      { heading: "Start a scan", body: "Open your website in the dashboard and click Run Scan. ComplianceKit crawls your homepage, detects cookies, third-party scripts, and checks for a privacy policy and cookie banner." },
      { heading: "Read your results", body: "Your Compliance Score (0–100) summarises the findings. The Findings tab lists each issue with a plain-English explanation and a direct link to fix it. Cookies and Scripts tabs show everything that was detected." },
      { heading: "Re-scan after changes", body: "Run a new scan any time after you make changes to your site. Your score history is saved so you can track improvement over time." },
    ],
  },
  {
    id: "banner",
    icon: Cookie,
    title: "3. Configuring Your Cookie Banner",
    steps: [
      { heading: "Open banner settings", body: "Go to your website → Banner. Choose your colours, button text, position (bottom bar or centre modal), and enable or disable Google Consent Mode v2." },
      { heading: "Preview live", body: "The live preview panel updates in real time as you change settings — no page reload needed. Check how the banner, settings panel, and withdrawal button all look before saving." },
      { heading: "Save your config", body: "Click Save. Your banner config is stored and will be used automatically by the widget script." },
    ],
  },
  {
    id: "install",
    icon: Code,
    title: "4. Installing the Banner on Your Site",
    steps: [
      { heading: "Get your embed code", body: "Go to your website → Embed. Copy the short alphanumeric embed code shown there." },
      { heading: "WordPress (recommended)", body: "Install the ComplianceKit — Cookie Consent plugin from wordpress.org. Go to Settings → ComplianceKit, paste your embed code, and click Save. Done — no coding required." },
      { heading: "Any other site", body: 'Paste the full <script> tag shown on the Embed page into the <head> of every page on your site. The widget loads asynchronously and will not slow down your site.' },
      { heading: "Verify installation", body: 'Click Verify Installation on the Embed page. ComplianceKit will fetch your homepage and confirm the widget is detected. A green banner means you\'re live.' },
    ],
  },
  {
    id: "policies",
    icon: FileText,
    title: "5. Generating Policies",
    steps: [
      { heading: "Cookie policy", body: "Go to your website → Policies → Cookie Policy. ComplianceKit generates a policy based on your scan results. Review it, then copy the link or embed it on your site." },
      { heading: "Privacy policy", body: "Go to your website → Policies → Privacy Policy. Fill in your company details and ComplianceKit generates a GDPR-compliant policy. Update it whenever your data practices change." },
    ],
  },
  {
    id: "dsar",
    icon: Inbox,
    title: "6. Handling Data Requests (DSAR)",
    steps: [
      { heading: "What is a DSAR?", body: "A Data Subject Access Request is a legal right under GDPR. Visitors can request a copy of their data, ask for deletion, or object to processing." },
      { heading: "Your DSAR page", body: "ComplianceKit gives each website a public DSAR form. Share the link with your visitors (e.g. in your privacy policy). Submissions appear instantly in your dashboard under DSAR." },
      { heading: "Respond within 30 days", body: "GDPR requires you to respond within 30 days. The dashboard shows the due date for each request and sends you an email notification when a new request arrives." },
    ],
  },
  {
    id: "wordpress",
    icon: Puzzle,
    title: "7. WordPress Plugin — Quick Reference",
    steps: [
      { heading: "Install", body: "WordPress admin → Plugins → Add New → search ComplianceKit → Install Now → Activate." },
      { heading: "Configure", body: "Go to Settings → ComplianceKit. Paste your embed code (the short alphanumeric code from your dashboard — not the full script tag). Click Save Changes." },
      { heading: "App URL field", body: "Leave App URL as https://compliancekit.com unless you are running a self-hosted ComplianceKit instance." },
      { heading: "Footer link", body: 'Enable Add a "Manage Cookie Preferences" link to the site footer if you want a persistent text link in addition to the floating widget button.' },
    ],
  },
];

export default async function DocsPage() {
  const session = await auth();

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
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to get your site GDPR-compliant with ComplianceKit.
          </p>
        </div>

        {/* Quick nav */}
        <nav className="mb-12 p-4 rounded-xl border bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-6 pl-12">
                  {section.steps.map((step, i) => (
                    <div key={i}>
                      <h3 className="font-semibold mb-1">{step.heading}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 p-8 rounded-2xl border bg-muted/30 text-center">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Check out the live demo to see ComplianceKit in action, or sign up and try it for free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/demo">
                View Live Demo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">
                Get Started Free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ComplianceKit. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
