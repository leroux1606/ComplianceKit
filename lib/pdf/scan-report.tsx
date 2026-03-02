import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── Design tokens (sRGB hex for react-pdf compatibility) ────────────────────
const BRAND = "#6d28d9";      // primary violet
const INK   = "#0f172a";      // near-black text
const INK_2 = "#334155";      // secondary text
const MUTED = "#64748b";      // muted text / labels
const RULE  = "#e2e8f0";      // dividers
const SURFACE = "#f8fafc";    // light surface

const SEV_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  critical: { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c", label: "CRITICAL" },
  error:    { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c", label: "HIGH"     },
  warning:  { bg: "#fffbeb", border: "#f59e0b", text: "#b45309", label: "MEDIUM"  },
  info:     { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8", label: "INFO"    },
};

function getSeverityStyle(severity: string) {
  const key = severity.toLowerCase();
  return SEV_COLORS[key] ?? { bg: "#f8fafc", border: "#cbd5e1", text: "#475569", label: severity.toUpperCase() };
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.6,
    color: INK_2,
  },

  // ── Cover / header ──
  coverAccent: {
    height: 4,
    backgroundColor: BRAND,
    marginBottom: 28,
    borderRadius: 2,
  },
  reportLabel: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  reportTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 10,
    color: INK_2,
    marginBottom: 2,
  },
  reportMeta: {
    fontSize: 8,
    color: MUTED,
    marginTop: 8,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    borderBottomStyle: "solid",
    marginBottom: 20,
    marginTop: 12,
  },

  // ── Executive summary ──
  summaryBox: {
    backgroundColor: SURFACE,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: BRAND,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  scoreNumber: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
  },
  scorePercent: {
    fontSize: 9,
    color: MUTED,
    textAlign: "center",
  },
  summaryRight: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 9,
    color: INK_2,
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  summaryMetric: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: RULE,
    borderStyle: "solid",
  },
  summaryMetricLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryMetricValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },

  // ── Sections ──
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    borderBottomStyle: "solid",
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: BRAND,
    borderRadius: 1.5,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },
  sectionCount: {
    marginLeft: 6,
    fontSize: 9,
    color: MUTED,
  },

  // ── Findings ──
  finding: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
  },
  findingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  findingBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  findingTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  findingDescription: {
    fontSize: 8.5,
    color: INK_2,
    marginBottom: 4,
  },
  findingRecommendation: {
    fontSize: 8.5,
    color: INK_2,
    fontFamily: "Helvetica-Oblique",
  },
  truncationNote: {
    fontSize: 8,
    color: MUTED,
    fontFamily: "Helvetica-Oblique",
    marginTop: 6,
    textAlign: "center",
  },

  // ── Tables ──
  table: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: RULE,
    borderStyle: "solid",
    overflow: "hidden",
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: RULE,
    borderTopStyle: "solid",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    flex: 1,
    fontSize: 8.5,
    color: INK_2,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },
  badgeWarn: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },

  // ── Severity breakdown ──
  severityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  severityItem: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    alignItems: "center",
  },
  severityCount: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  severityLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: RULE,
    borderTopStyle: "solid",
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
  footerDisclaimer: {
    fontSize: 7,
    color: MUTED,
    fontFamily: "Helvetica-Oblique",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScanReportProps {
  website: {
    name: string;
    url: string;
  };
  scan: {
    score: number | null;
    createdAt: Date;
    cookies: Array<{
      name: string;
      domain: string;
      category: string | null;
      secure: boolean;
      expires: Date | null;
    }>;
    scripts: Array<{
      name: string | null;
      category: string | null;
      type: string;
      url: string | null;
    }>;
    findings: Array<{
      type: string;
      severity: string;
      title: string;
      description: string;
      recommendation: string | null;
    }>;
  };
}

// ─── Shared footer ────────────────────────────────────────────────────────────
function ReportFooter({ generated }: { generated: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>
        ComplianceKit  •  Generated {generated}
      </Text>
      <Text style={S.footerDisclaimer}>
        Informational purposes only — not legal advice
      </Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ScanReportPDF({ website, scan }: ScanReportProps) {
  const score   = scan.score ?? 0;
  const generated = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const scannedAt = new Date(scan.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const scoreLabel =
    score >= 80 ? "Excellent" :
    score >= 60 ? "Good" :
    score >= 40 ? "Needs Attention" :
    "Non-Compliant";

  const cookieStats = {
    total:     scan.cookies.length,
    necessary: scan.cookies.filter((c) => c.category === "necessary").length,
    analytics: scan.cookies.filter((c) => c.category === "analytics").length,
    marketing: scan.cookies.filter((c) => c.category === "marketing").length,
  };

  const trackingScripts = scan.scripts.filter(
    (s) => s.category && s.category !== "unknown"
  );

  const findingsBySeverity = {
    critical: scan.findings.filter((f) => ["critical", "error"].includes(f.severity.toLowerCase())).length,
    warning:  scan.findings.filter((f) => f.severity.toLowerCase() === "warning").length,
    info:     scan.findings.filter((f) => f.severity.toLowerCase() === "info").length,
  };

  const FINDING_LIMIT = 8;
  const COOKIE_LIMIT  = 25;
  const SCRIPT_LIMIT  = 20;

  return (
    <Document
      title={`Compliance Scan Report — ${website.name}`}
      author="ComplianceKit"
      subject="GDPR Compliance Scan"
    >
      {/* ══════════════════════════════════════════════════ Page 1: Executive Summary */}
      <Page size="A4" style={S.page}>
        {/* Brand accent bar */}
        <View style={S.coverAccent} />

        {/* Report identity */}
        <Text style={S.reportLabel}>GDPR Compliance Report</Text>
        <Text style={S.reportTitle}>Compliance Scan Report</Text>
        <Text style={S.reportSubtitle}>{website.name}</Text>
        <Text style={S.reportSubtitle}>{website.url}</Text>
        <Text style={S.reportMeta}>
          Scan date: {scannedAt}  •  Report generated: {generated}
        </Text>
        <View style={S.headerDivider} />

        {/* Executive summary box */}
        <View style={S.summaryBox}>
          {/* Score circle */}
          <View style={S.scoreCircle}>
            <Text style={S.scoreNumber}>{score}</Text>
            <Text style={S.scorePercent}>/ 100</Text>
          </View>

          {/* Summary metrics */}
          <View style={S.summaryRight}>
            <Text style={S.summaryLabel}>
              Overall Compliance: {scoreLabel}
            </Text>
            <Text style={S.summaryDescription}>
              Score based on cookie practices, tracking scripts, and GDPR compliance indicators.
            </Text>
            <View style={S.summaryGrid}>
              <View style={S.summaryMetric}>
                <Text style={S.summaryMetricLabel}>Cookies</Text>
                <Text style={S.summaryMetricValue}>{cookieStats.total}</Text>
              </View>
              <View style={S.summaryMetric}>
                <Text style={S.summaryMetricLabel}>Trackers</Text>
                <Text style={S.summaryMetricValue}>{cookieStats.analytics + cookieStats.marketing}</Text>
              </View>
              <View style={S.summaryMetric}>
                <Text style={S.summaryMetricLabel}>Scripts</Text>
                <Text style={S.summaryMetricValue}>{trackingScripts.length}</Text>
              </View>
              <View style={S.summaryMetric}>
                <Text style={S.summaryMetricLabel}>Issues</Text>
                <Text style={S.summaryMetricValue}>{scan.findings.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Findings severity breakdown */}
        {scan.findings.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <View style={S.sectionAccent} />
              <Text style={S.sectionTitle}>Issue Severity Breakdown</Text>
            </View>
            <View style={S.severityRow}>
              <View style={[S.severityItem, { borderColor: "#ef4444", backgroundColor: "#fef2f2" }]}>
                <Text style={[S.severityCount, { color: "#b91c1c" }]}>{findingsBySeverity.critical}</Text>
                <Text style={[S.severityLabel, { color: "#b91c1c" }]}>Critical / High</Text>
              </View>
              <View style={[S.severityItem, { borderColor: "#f59e0b", backgroundColor: "#fffbeb" }]}>
                <Text style={[S.severityCount, { color: "#b45309" }]}>{findingsBySeverity.warning}</Text>
                <Text style={[S.severityLabel, { color: "#b45309" }]}>Medium</Text>
              </View>
              <View style={[S.severityItem, { borderColor: "#3b82f6", backgroundColor: "#eff6ff" }]}>
                <Text style={[S.severityCount, { color: "#1d4ed8" }]}>{findingsBySeverity.info}</Text>
                <Text style={[S.severityLabel, { color: "#1d4ed8" }]}>Informational</Text>
              </View>
            </View>
          </View>
        )}

        {/* Compliance findings */}
        {scan.findings.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionHeader}>
              <View style={S.sectionAccent} />
              <Text style={S.sectionTitle}>Compliance Issues</Text>
              <Text style={S.sectionCount}>({scan.findings.length} total)</Text>
            </View>
            {scan.findings.slice(0, FINDING_LIMIT).map((finding, index) => {
              const sev = getSeverityStyle(finding.severity);
              return (
                <View
                  key={index}
                  style={[
                    S.finding,
                    { backgroundColor: sev.bg, borderLeftColor: sev.border },
                  ]}
                >
                  <View style={S.findingHeader}>
                    <Text style={[S.findingBadge, { backgroundColor: sev.border, color: "#ffffff" }]}>
                      {sev.label}
                    </Text>
                    <Text style={[S.findingTitle, { color: sev.text }]}>
                      {finding.title}
                    </Text>
                  </View>
                  <Text style={S.findingDescription}>{finding.description}</Text>
                  {finding.recommendation && (
                    <Text style={S.findingRecommendation}>
                      ↳ {finding.recommendation}
                    </Text>
                  )}
                </View>
              );
            })}
            {scan.findings.length > FINDING_LIMIT && (
              <Text style={S.truncationNote}>
                Showing {FINDING_LIMIT} of {scan.findings.length} findings. See detailed pages for full list.
              </Text>
            )}
          </View>
        )}

        {scan.findings.length === 0 && (
          <View style={[S.section, { padding: 16, backgroundColor: "#f0fdf4", borderRadius: 6 }]}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#15803d", marginBottom: 4 }}>
              ✓  No compliance issues detected
            </Text>
            <Text style={{ fontSize: 9, color: "#166534" }}>
              Your website passed all compliance checks in this scan.
            </Text>
          </View>
        )}

        <ReportFooter generated={generated} />
      </Page>

      {/* ══════════════════════════════════════════════════ Page 2: Cookies & Scripts */}
      {(scan.cookies.length > 0 || trackingScripts.length > 0) && (
        <Page size="A4" style={S.page}>
          <View style={S.coverAccent} />

          {/* Cookies table */}
          {scan.cookies.length > 0 && (
            <View style={S.section}>
              <View style={S.sectionHeader}>
                <View style={S.sectionAccent} />
                <Text style={S.sectionTitle}>Detected Cookies</Text>
                <Text style={S.sectionCount}>({scan.cookies.length} total)</Text>
              </View>
              <View style={S.table}>
                <View style={S.tableHeader}>
                  <Text style={[S.tableHeaderCell, { flex: 2 }]}>Name</Text>
                  <Text style={[S.tableHeaderCell, { flex: 2 }]}>Domain</Text>
                  <Text style={S.tableHeaderCell}>Category</Text>
                  <Text style={S.tableHeaderCell}>Secure</Text>
                </View>
                {scan.cookies.slice(0, COOKIE_LIMIT).map((cookie, index) => (
                  <View
                    key={index}
                    style={[S.tableRow, index % 2 === 1 ? S.tableRowAlt : {}]}
                  >
                    <Text style={[S.tableCell, { flex: 2 }]}>{cookie.name}</Text>
                    <Text style={[S.tableCell, { flex: 2 }]}>{cookie.domain}</Text>
                    <Text style={S.tableCell}>{cookie.category ?? "unknown"}</Text>
                    <Text style={S.tableCell}>
                      {cookie.secure ? "✓ Yes" : "✗ No"}
                    </Text>
                  </View>
                ))}
              </View>
              {scan.cookies.length > COOKIE_LIMIT && (
                <Text style={S.truncationNote}>
                  Showing {COOKIE_LIMIT} of {scan.cookies.length} cookies.
                </Text>
              )}
            </View>
          )}

          {/* Tracking scripts table */}
          {trackingScripts.length > 0 && (
            <View style={S.section}>
              <View style={S.sectionHeader}>
                <View style={S.sectionAccent} />
                <Text style={S.sectionTitle}>Tracking Scripts</Text>
                <Text style={S.sectionCount}>({trackingScripts.length} total)</Text>
              </View>
              <View style={S.table}>
                <View style={S.tableHeader}>
                  <Text style={[S.tableHeaderCell, { flex: 2 }]}>Script Name</Text>
                  <Text style={S.tableHeaderCell}>Category</Text>
                  <Text style={S.tableHeaderCell}>Type</Text>
                </View>
                {trackingScripts.slice(0, SCRIPT_LIMIT).map((script, index) => (
                  <View
                    key={index}
                    style={[S.tableRow, index % 2 === 1 ? S.tableRowAlt : {}]}
                  >
                    <Text style={[S.tableCell, { flex: 2 }]}>{script.name ?? "Unknown"}</Text>
                    <Text style={S.tableCell}>{script.category}</Text>
                    <Text style={S.tableCell}>{script.type}</Text>
                  </View>
                ))}
              </View>
              {trackingScripts.length > SCRIPT_LIMIT && (
                <Text style={S.truncationNote}>
                  Showing {SCRIPT_LIMIT} of {trackingScripts.length} scripts.
                </Text>
              )}
            </View>
          )}

          <ReportFooter generated={generated} />
        </Page>
      )}
    </Document>
  );
}
