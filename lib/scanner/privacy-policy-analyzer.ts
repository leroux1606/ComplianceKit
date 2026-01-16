import { Page } from "puppeteer";
import type { Finding } from "./types";

/**
 * Privacy Policy Content Analysis
 * Analyzes privacy policy content for GDPR Articles 13-14 requirements
 */

interface PrivacyPolicyAnalysis {
  hasControllerIdentity: boolean;
  hasDpoContact: boolean;
  hasProcessingPurposes: boolean;
  hasLegalBasis: boolean;
  hasDataCategories: boolean;
  hasRetentionPeriods: boolean;
  hasDataRecipients: boolean;
  hasInternationalTransfers: boolean;
  hasUserRights: boolean;
  hasComplaintRight: boolean;
  hasDataSource: boolean;
  hasAutomatedDecisions: boolean;
  completenessScore: number; // 0-100
}

/**
 * Patterns to detect required privacy policy elements
 */
const REQUIRED_ELEMENTS = {
  controllerIdentity: [
    /controller/i,
    /data\s*controller/i,
    /company\s*name/i,
    /contact\s*information/i,
    /registered\s*office/i,
  ],
  dpoContact: [
    /data\s*protection\s*officer/i,
    /dpo/i,
    /privacy\s*officer/i,
    /dpo@/i,
    /privacy@/i,
  ],
  processingPurposes: [
    /purpose/i,
    /why\s*we\s*collect/i,
    /how\s*we\s*use/i,
    /processing\s*purposes/i,
  ],
  legalBasis: [
    /legal\s*basis/i,
    /lawful\s*basis/i,
    /consent/i,
    /legitimate\s*interest/i,
    /contractual\s*necessity/i,
    /legal\s*obligation/i,
    /article\s*6/i,
  ],
  dataCategories: [
    /personal\s*data/i,
    /information\s*we\s*collect/i,
    /data\s*categories/i,
    /types\s*of\s*data/i,
  ],
  retentionPeriods: [
    /retention/i,
    /how\s*long/i,
    /storage\s*period/i,
    /keep\s*your\s*data/i,
    /delete.*data/i,
  ],
  dataRecipients: [
    /third.*part/i,
    /recipient/i,
    /share.*with/i,
    /disclose.*to/i,
    /service\s*provider/i,
  ],
  internationalTransfers: [
    /international\s*transfer/i,
    /outside.*EEA/i,
    /outside.*EU/i,
    /cross.*border/i,
    /adequacy\s*decision/i,
    /standard\s*contractual\s*clauses/i,
    /SCC/i,
  ],
  userRights: [
    /your\s*rights/i,
    /data\s*subject\s*rights/i,
    /right\s*to\s*access/i,
    /right\s*to\s*erasure/i,
    /right\s*to\s*rectification/i,
    /right\s*to\s*portability/i,
  ],
  complaintRight: [
    /supervisory\s*authority/i,
    /lodge.*complaint/i,
    /data\s*protection\s*authority/i,
    /right\s*to\s*complain/i,
  ],
  dataSource: [
    /source.*data/i,
    /where.*obtain/i,
    /collect.*from/i,
  ],
  automatedDecisions: [
    /automated\s*decision/i,
    /profiling/i,
    /algorithmic/i,
    /automated\s*processing/i,
  ],
};

/**
 * Analyze privacy policy content
 */
export async function analyzePrivacyPolicyContent(
  page: Page,
  policyUrl?: string
): Promise<PrivacyPolicyAnalysis> {
  let content = "";

  try {
    // If policy URL is provided, navigate to it
    if (policyUrl && !policyUrl.includes("#")) {
      // Don't navigate if it's just an anchor link
      try {
        await page.goto(policyUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Failed to navigate to privacy policy:", error);
      }
    }

    // Extract all text content from the page
    content = await page.evaluate(() => {
      // Get main content area (common containers)
      const selectors = [
        "main",
        "article",
        '[role="main"]',
        ".privacy-policy",
        "#privacy-policy",
        ".content",
        ".page-content",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent || "";
        }
      }

      // Fallback to body
      return document.body.textContent || "";
    });

    content = content.toLowerCase();
  } catch (error) {
    console.error("Privacy policy content extraction error:", error);
  }

  // Analyze content for required elements
  const analysis: PrivacyPolicyAnalysis = {
    hasControllerIdentity: hasMatch(content, REQUIRED_ELEMENTS.controllerIdentity),
    hasDpoContact: hasMatch(content, REQUIRED_ELEMENTS.dpoContact),
    hasProcessingPurposes: hasMatch(content, REQUIRED_ELEMENTS.processingPurposes),
    hasLegalBasis: hasMatch(content, REQUIRED_ELEMENTS.legalBasis),
    hasDataCategories: hasMatch(content, REQUIRED_ELEMENTS.dataCategories),
    hasRetentionPeriods: hasMatch(content, REQUIRED_ELEMENTS.retentionPeriods),
    hasDataRecipients: hasMatch(content, REQUIRED_ELEMENTS.dataRecipients),
    hasInternationalTransfers: hasMatch(content, REQUIRED_ELEMENTS.internationalTransfers),
    hasUserRights: hasMatch(content, REQUIRED_ELEMENTS.userRights),
    hasComplaintRight: hasMatch(content, REQUIRED_ELEMENTS.complaintRight),
    hasDataSource: hasMatch(content, REQUIRED_ELEMENTS.dataSource),
    hasAutomatedDecisions: hasMatch(content, REQUIRED_ELEMENTS.automatedDecisions),
    completenessScore: 0,
  };

  // Calculate completeness score
  // Controller identity, purposes, legal basis, data categories, user rights are critical (10 points each)
  // Others are important (5 points each)
  let score = 0;

  // Critical elements (10 points each = 50 points)
  if (analysis.hasControllerIdentity) score += 10;
  if (analysis.hasProcessingPurposes) score += 10;
  if (analysis.hasLegalBasis) score += 10;
  if (analysis.hasDataCategories) score += 10;
  if (analysis.hasUserRights) score += 10;

  // Important elements (5 points each = 35 points)
  if (analysis.hasDpoContact) score += 5;
  if (analysis.hasRetentionPeriods) score += 5;
  if (analysis.hasDataRecipients) score += 5;
  if (analysis.hasInternationalTransfers) score += 5;
  if (analysis.hasComplaintRight) score += 5;
  if (analysis.hasDataSource) score += 5;
  if (analysis.hasAutomatedDecisions) score += 5;

  analysis.completenessScore = Math.min(100, score);

  return analysis;
}

/**
 * Check if content matches any pattern
 */
function hasMatch(content: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}

/**
 * Generate findings for privacy policy content issues
 */
export function generatePrivacyPolicyFindings(
  analysis: PrivacyPolicyAnalysis,
  hasPrivacyPolicy: boolean
): Finding[] {
  const findings: Finding[] = [];

  // If no privacy policy at all, this is handled elsewhere
  if (!hasPrivacyPolicy) {
    return findings;
  }

  // Check if privacy policy is incomplete
  const missingElements: string[] = [];

  if (!analysis.hasControllerIdentity) missingElements.push("Controller identity and contact");
  if (!analysis.hasDpoContact) missingElements.push("DPO contact details");
  if (!analysis.hasProcessingPurposes) missingElements.push("Processing purposes");
  if (!analysis.hasLegalBasis) missingElements.push("Legal basis for processing");
  if (!analysis.hasDataCategories) missingElements.push("Data categories collected");
  if (!analysis.hasRetentionPeriods) missingElements.push("Data retention periods");
  if (!analysis.hasDataRecipients) missingElements.push("Data recipients/third parties");
  if (!analysis.hasInternationalTransfers) missingElements.push("International transfer information");
  if (!analysis.hasUserRights) missingElements.push("Data subject rights");
  if (!analysis.hasComplaintRight) missingElements.push("Right to lodge complaint");

  // Generate finding based on completeness score
  if (analysis.completenessScore < 50) {
    findings.push({
      type: "privacy_policy",
      severity: "error",
      title: "Incomplete Privacy Policy",
      description: `Your privacy policy is missing ${missingElements.length} critical elements required by GDPR Articles 13-14. Completeness score: ${analysis.completenessScore}/100. Missing: ${missingElements.slice(0, 5).join(", ")}${missingElements.length > 5 ? `, and ${missingElements.length - 5} more` : ""}.`,
      recommendation:
        "Update your privacy policy to include all required GDPR elements: controller identity, DPO contact, processing purposes, legal basis, data categories, retention periods, data recipients, international transfers, user rights, and complaint rights.",
    });
  } else if (analysis.completenessScore < 80) {
    findings.push({
      type: "privacy_policy",
      severity: "warning",
      title: "Privacy Policy Needs Improvement",
      description: `Your privacy policy is missing ${missingElements.length} elements required by GDPR Articles 13-14. Completeness score: ${analysis.completenessScore}/100. Missing: ${missingElements.join(", ")}.`,
      recommendation:
        "Review and enhance your privacy policy to include: " + missingElements.join(", ") + ".",
    });
  }

  // Specific critical element warnings
  if (!analysis.hasLegalBasis) {
    findings.push({
      type: "privacy_policy",
      severity: "error",
      title: "No Legal Basis Disclosed (Article 6)",
      description:
        "Your privacy policy does not specify the legal basis for processing personal data. GDPR Article 6 requires you to identify whether you process data based on consent, contract, legal obligation, vital interests, public task, or legitimate interests.",
      recommendation:
        "Add a section to your privacy policy clearly stating the legal basis for each processing activity (e.g., 'We process your email address based on contractual necessity to provide you with our service').",
    });
  }

  if (!analysis.hasUserRights) {
    findings.push({
      type: "privacy_policy",
      severity: "error",
      title: "User Rights Not Disclosed (Articles 15-22)",
      description:
        "Your privacy policy does not explain users' GDPR rights. You must inform users of their right to access, rectify, erase, restrict, object, and port their data.",
      recommendation:
        "Add a 'Your Rights' section explaining all GDPR data subject rights (Articles 15-22) and how users can exercise them.",
    });
  }

  return findings;
}
