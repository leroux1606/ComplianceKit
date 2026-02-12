import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - using default Helvetica)
// You can add custom fonts later for better branding

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    borderBottomStyle: "solid",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#0f172a",
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  scoreNumber: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  scoreText: {
    fontSize: 10,
    color: "#64748b",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  summaryItem: {
    width: "48%",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  finding: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
    borderLeftStyle: "solid",
    borderRadius: 4,
  },
  findingTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
    marginBottom: 5,
  },
  findingDescription: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 5,
  },
  findingRecommendation: {
    fontSize: 9,
    color: "#0f172a",
    fontFamily: "Helvetica-Oblique",
  },
  badge: {
    padding: "3 8",
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  badgeError: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  badgeWarning: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#64748b",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
});

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

export function ScanReportPDF({ website, scan }: ScanReportProps) {
  const score = scan.score || 0;
  const scoreLabel =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

  const cookieStats = {
    total: scan.cookies.length,
    necessary: scan.cookies.filter((c) => c.category === "necessary").length,
    analytics: scan.cookies.filter((c) => c.category === "analytics").length,
    marketing: scan.cookies.filter((c) => c.category === "marketing").length,
  };

  const scriptStats = {
    total: scan.scripts.filter((s) => s.category && s.category !== "unknown").length,
    analytics: scan.scripts.filter((s) => s.category === "analytics").length,
    marketing: scan.scripts.filter((s) => s.category === "marketing").length,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Compliance Scan Report</Text>
          <Text style={styles.subtitle}>
            {website.name} • {website.url}
          </Text>
          <Text style={styles.subtitle}>
            Scanned on {new Date(scan.createdAt).toLocaleDateString()} at{" "}
            {new Date(scan.createdAt).toLocaleTimeString()}
          </Text>
        </View>

        {/* Compliance Score */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Compliance Score: {scoreLabel}</Text>
            <Text style={styles.scoreText}>
              Your website's GDPR compliance score based on cookies, tracking scripts, and
              compliance features.
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Cookies</Text>
              <Text style={styles.summaryValue}>{cookieStats.total}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tracking Cookies</Text>
              <Text style={styles.summaryValue}>
                {cookieStats.analytics + cookieStats.marketing}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tracking Scripts</Text>
              <Text style={styles.summaryValue}>{scriptStats.total}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Issues Found</Text>
              <Text style={styles.summaryValue}>{scan.findings.length}</Text>
            </View>
          </View>
        </View>

        {/* Findings */}
        {scan.findings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compliance Issues</Text>
            {scan.findings.slice(0, 5).map((finding, index) => (
              <View key={index} style={styles.finding}>
                <Text style={styles.findingTitle}>{finding.title}</Text>
                <Text style={styles.findingDescription}>{finding.description}</Text>
                {finding.recommendation && (
                  <Text style={styles.findingRecommendation}>
                    Recommendation: {finding.recommendation}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by ComplianceKit • https://compliancekit.app</Text>
          <Text>This report is for informational purposes only and does not constitute legal advice.</Text>
        </View>
      </Page>

      {/* Page 2: Detailed Cookies */}
      {scan.cookies.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected Cookies ({scan.cookies.length})</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Name</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>Domain</Text>
                <Text style={styles.tableCell}>Category</Text>
                <Text style={styles.tableCell}>Secure</Text>
              </View>
              {scan.cookies.slice(0, 30).map((cookie, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{cookie.name}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{cookie.domain}</Text>
                  <Text style={styles.tableCell}>{cookie.category || "unknown"}</Text>
                  <Text style={styles.tableCell}>{cookie.secure ? "Yes" : "No"}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Scripts */}
          {scriptStats.total > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tracking Scripts ({scriptStats.total})</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Script</Text>
                  <Text style={styles.tableCell}>Category</Text>
                  <Text style={styles.tableCell}>Type</Text>
                </View>
                {scan.scripts
                  .filter((s) => s.category && s.category !== "unknown")
                  .slice(0, 20)
                  .map((script, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>
                        {script.name || "Unknown"}
                      </Text>
                      <Text style={styles.tableCell}>{script.category}</Text>
                      <Text style={styles.tableCell}>{script.type}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text>Generated by ComplianceKit • https://compliancekit.app</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
