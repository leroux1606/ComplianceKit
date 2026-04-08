"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Finding {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string | null;
}

interface ActionChecklistProps {
  findings: Finding[];
  websiteId: string;
}

// ---------------------------------------------------------------------------
// Per-type metadata: plain-English "why it matters" + action button
// ---------------------------------------------------------------------------

interface FindingMeta {
  whyItMatters: string;
  actionLabel?: string;
  actionPath?: string; // relative to /dashboard/websites/[id]/
  gdprArticle?: string;
  gdprArticleUrl?: string;
}

const FINDING_META: Record<string, FindingMeta> = {
  cookie_banner: {
    whyItMatters:
      "GDPR requires informed consent before placing non-essential cookies. Without a banner, every visitor is tracked without their permission — exposing you to fines of up to €20 million.",
    actionLabel: "Configure banner",
    actionPath: "banner",
    gdprArticle: "Art. 6 + ePrivacy Directive",
    gdprArticleUrl: "https://gdpr-info.eu/art-6-gdpr/",
  },
  privacy_policy: {
    whyItMatters:
      "GDPR Articles 13–14 require you to tell visitors what data you collect, why, and who you share it with. A missing or incomplete policy is one of the most common reasons for DPA investigations.",
    actionLabel: "Generate policy",
    actionPath: "policies",
    gdprArticle: "Art. 13–14",
    gdprArticleUrl: "https://gdpr-info.eu/art-13-gdpr/",
  },
  consent_management: {
    whyItMatters:
      "Consent must be freely given, specific, informed, and unambiguous (GDPR Art. 7). Weak consent mechanisms — pre-ticked boxes, bundled consent, or no withdrawal option — are legally invalid.",
    actionLabel: "Configure banner",
    actionPath: "banner",
    gdprArticle: "Art. 7",
    gdprArticleUrl: "https://gdpr-info.eu/art-7-gdpr/",
  },
  tracking_script: {
    whyItMatters:
      "Analytics and marketing scripts can profile visitors across sites. Running them without consent violates GDPR and, for EU users, the ePrivacy Directive (\"cookie law\").",
    actionLabel: "Configure banner",
    actionPath: "banner",
    gdprArticle: "Art. 6(1)(a)",
    gdprArticleUrl: "https://gdpr-info.eu/art-6-gdpr/",
  },
  third_party_cookie: {
    whyItMatters:
      "Third-party cookies are the primary tool of cross-site tracking. Under GDPR they require explicit consent, and regulators treat unconsented third-party tracking as a serious violation.",
    actionLabel: "Configure banner",
    actionPath: "banner",
    gdprArticle: "Art. 6(1)(a)",
    gdprArticleUrl: "https://gdpr-info.eu/art-6-gdpr/",
  },
  secure_cookie: {
    whyItMatters:
      "Cookies without the Secure or HttpOnly flag are vulnerable to interception and XSS attacks. If a session cookie is stolen, an attacker can impersonate your users — a personal data breach under GDPR Art. 33.",
    gdprArticle: "Art. 32–33",
    gdprArticleUrl: "https://gdpr-info.eu/art-32-gdpr/",
  },
  user_rights_info: {
    whyItMatters:
      "GDPR Art. 13 requires you to inform visitors of their rights (access, erasure, portability, objection). Failing to do so is a direct compliance breach.",
    actionLabel: "Generate policy",
    actionPath: "policies",
    gdprArticle: "Art. 13",
    gdprArticleUrl: "https://gdpr-info.eu/art-13-gdpr/",
  },
  user_profile_settings: {
    whyItMatters:
      "GDPR Art. 16 gives individuals the right to correct their personal data. If users cannot update their own information, you are in breach — and regulators do check for this.",
    gdprArticle: "Art. 16",
    gdprArticleUrl: "https://gdpr-info.eu/art-16-gdpr/",
  },
  data_export: {
    whyItMatters:
      "GDPR Art. 20 (right to data portability) requires you to let users export their data in a machine-readable format on request. Missing this can result in upheld DSAR complaints.",
    gdprArticle: "Art. 20",
    gdprArticleUrl: "https://gdpr-info.eu/art-20-gdpr/",
  },
  account_deletion: {
    whyItMatters:
      "GDPR Art. 17 (right to erasure) requires you to delete personal data when asked. Without a clear deletion mechanism, every erasure request risks a 30-day breach.",
    gdprArticle: "Art. 17",
    gdprArticleUrl: "https://gdpr-info.eu/art-17-gdpr/",
  },
  dsar_mechanism: {
    whyItMatters:
      "Under GDPR you must respond to Data Subject Access Requests within 30 days. Without a clear process — or a published contact route — you will miss deadlines.",
    actionLabel: "View DSAR settings",
    actionPath: "../../dsars",
    gdprArticle: "Art. 15–22",
    gdprArticleUrl: "https://gdpr-info.eu/art-15-gdpr/",
  },
  data_rectification: {
    whyItMatters:
      "GDPR Art. 16 gives individuals the right to have inaccurate personal data corrected. Regulators expect a documented process for handling these requests.",
    gdprArticle: "Art. 16",
    gdprArticleUrl: "https://gdpr-info.eu/art-16-gdpr/",
  },
};

// ---------------------------------------------------------------------------
// Severity group config
// ---------------------------------------------------------------------------

const SEVERITY_GROUPS = [
  {
    severity: "error",
    label: "Critical — fix now",
    description: "These issues expose you to legal risk and must be addressed before launch.",
    icon: AlertCircle,
    iconColor: "text-red-600",
    badgeClass: "bg-red-500/10 text-red-700 border-red-500/20",
    borderClass: "border-red-500/30 bg-red-500/5",
  },
  {
    severity: "warning",
    label: "Important — fix this week",
    description: "These weaken your compliance posture and should be resolved soon.",
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    badgeClass: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    borderClass: "border-yellow-500/30 bg-yellow-500/5",
  },
  {
    severity: "info",
    label: "Minor — when you can",
    description: "Low-risk improvements that strengthen compliance over time.",
    icon: Info,
    iconColor: "text-blue-600",
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    borderClass: "border-blue-500/30 bg-blue-500/5",
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionChecklist({ findings, websiteId }: ActionChecklistProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Fix These Issues
          </CardTitle>
          <CardDescription>All compliance issues addressed!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold text-green-600">No action items</h3>
            <p className="text-muted-foreground">Your website has no detected compliance issues.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggle = (id: string, set: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const completedCount = completed.size;
  const totalCount = findings.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const baseUrl = `/dashboard/websites/${websiteId}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Fix These Issues</CardTitle>
            <CardDescription>
              Prioritised actions to improve your compliance score
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
            <div className="text-xs text-muted-foreground">marked done</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {SEVERITY_GROUPS.map((group) => {
          const groupFindings = findings.filter((f) => f.severity === group.severity);
          if (groupFindings.length === 0) return null;
          const Icon = group.icon;

          return (
            <div key={group.severity}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-4 w-4 shrink-0", group.iconColor)} />
                <h3 className="text-sm font-semibold">{group.label}</h3>
                <Badge variant="outline" className={cn("text-xs", group.badgeClass)}>
                  {groupFindings.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{group.description}</p>

              <div className="space-y-2">
                {groupFindings.map((finding) => {
                  const isDone = completed.has(finding.id);
                  const isOpen = expanded.has(finding.id);
                  const meta = FINDING_META[finding.type] ?? {};

                  return (
                    <div
                      key={finding.id}
                      className={cn(
                        "rounded-lg border p-4 transition-all",
                        isDone
                          ? "bg-muted/40 border-muted"
                          : cn("border", group.borderClass)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggle(finding.id, completed, setCompleted)}
                          className="mt-0.5 shrink-0 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          aria-label={isDone ? "Mark as not done" : "Mark as done"}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                isDone && "line-through text-muted-foreground"
                              )}
                            >
                              {finding.title}
                            </p>
                            <button
                              onClick={() => toggle(finding.id, expanded, setExpanded)}
                              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                              aria-label={isOpen ? "Collapse" : "Expand"}
                            >
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          {/* Expanded detail */}
                          {isOpen && (
                            <div className="mt-3 space-y-3 pt-3 border-t border-border/60">
                              {/* What it means */}
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  What it means
                                </p>
                                <p className="text-sm text-foreground/80">{finding.description}</p>
                              </div>

                              {/* Why it matters */}
                              {meta.whyItMatters && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    Why it matters
                                  </p>
                                  <p className="text-sm text-foreground/80">{meta.whyItMatters}</p>
                                </div>
                              )}

                              {/* How to fix */}
                              {finding.recommendation && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    How to fix
                                  </p>
                                  <p className="text-sm text-foreground/80">
                                    {finding.recommendation}
                                  </p>
                                </div>
                              )}

                              {/* GDPR article reference */}
                              {meta.gdprArticle && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                    Regulation
                                  </p>
                                  <a
                                    href={meta.gdprArticleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary underline underline-offset-2"
                                  >
                                    GDPR {meta.gdprArticle} ↗
                                  </a>
                                </div>
                              )}

                              {/* Action button */}
                              {meta.actionLabel && meta.actionPath && (
                                <Button asChild size="sm" variant="outline" className="gap-1.5">
                                  <Link href={`${baseUrl}/${meta.actionPath}`}>
                                    {meta.actionLabel}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Completion callout */}
        {completedCount > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm">
            {completedCount === totalCount ? (
              <span className="font-medium text-primary">
                All items marked done — run a new scan to confirm your improved score.
              </span>
            ) : (
              <span className="text-muted-foreground">
                {totalCount - completedCount} item{totalCount - completedCount !== 1 ? "s" : ""}{" "}
                remaining.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
