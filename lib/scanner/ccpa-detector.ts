import { Page } from "puppeteer";
import type { Finding } from "./types";

/**
 * CCPA / CPRA Compliance Checks
 * California Consumer Privacy Act (2020) and California Privacy Rights Act (2023)
 */

export interface CcpaChecks {
  // Home page checks
  hasDoNotSellLink: boolean;      // "Do Not Sell or Share My Personal Information"
  hasPrivacyChoicesLink: boolean; // "Your Privacy Choices" (CPRA-approved alternative)

  // Privacy policy checks
  policyMentionsCcpa: boolean;           // Policy has a California/CCPA section
  policyListsCaliforniaRights: boolean;  // Discloses right to know, delete, opt-out, etc.
  hasCaliforniaContactMethod: boolean;   // Contact method for CA privacy requests
  policyHasLastUpdated: boolean;         // "Last Updated" date present
}

// ─── Home-page check (runs on the main page, no navigation) ───────────────────

/**
 * Detect "Do Not Sell or Share" and "Your Privacy Choices" links.
 * Must be called while the page is still on the website's home URL.
 */
export async function detectDoNotSellLink(page: Page): Promise<{
  hasDoNotSellLink: boolean;
  hasPrivacyChoicesLink: boolean;
}> {
  try {
    return await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('a, button, [role="link"], [role="button"]')
      ) as HTMLElement[];

      let hasDoNotSellLink = false;
      let hasPrivacyChoicesLink = false;

      for (const el of elements) {
        const text = ((el as HTMLElement).innerText || el.textContent || "")
          .trim()
          .toLowerCase();
        const href = ((el as HTMLAnchorElement).href || "").toLowerCase();
        const id = el.id.toLowerCase();
        const cls = (typeof el.className === "string" ? el.className : "").toLowerCase();

        // "Do Not Sell or Share" variants (CCPA §1798.120)
        if (
          text.includes("do not sell") ||
          text.includes("opt out of sale") ||
          text.includes("opt-out of sale") ||
          text.includes("opt out of selling") ||
          href.includes("do-not-sell") ||
          href.includes("opt-out-of-sale") ||
          href.includes("ccpa-opt-out") ||
          id.includes("do-not-sell") ||
          id.includes("ccpa-opt-out") ||
          cls.includes("do-not-sell") ||
          cls.includes("ccpa-opt-out")
        ) {
          hasDoNotSellLink = true;
        }

        // "Your Privacy Choices" — CPRA §1798.135 approved wording + icon
        if (
          text.includes("your privacy choices") ||
          text.includes("privacy choices") ||
          text.includes("limit the use of my sensitive personal information") ||
          text.includes("do not share my personal information") ||
          href.includes("privacy-choices") ||
          href.includes("your-privacy-choices") ||
          id.includes("privacy-choices") ||
          cls.includes("privacy-choices")
        ) {
          hasPrivacyChoicesLink = true;
        }
      }

      // Also catch opt-out iframes / scripts (e.g. OneTrust US, TrustArc)
      const iframes = Array.from(document.querySelectorAll("iframe"));
      for (const iframe of iframes) {
        const src = (iframe.src || "").toLowerCase();
        if (
          src.includes("opt-out") ||
          src.includes("ccpa") ||
          src.includes("do-not-sell") ||
          src.includes("privacy-choices")
        ) {
          hasDoNotSellLink = true;
        }
      }

      return { hasDoNotSellLink, hasPrivacyChoicesLink };
    });
  } catch {
    return { hasDoNotSellLink: false, hasPrivacyChoicesLink: false };
  }
}

// ─── Policy text analysis (pure function, no page navigation) ─────────────────

/**
 * Analyse privacy policy text content for CCPA compliance.
 * Call this after the page has navigated to the privacy policy URL.
 */
export function analyzeCcpaPolicyContent(content: string): Pick<
  CcpaChecks,
  | "policyMentionsCcpa"
  | "policyListsCaliforniaRights"
  | "hasCaliforniaContactMethod"
  | "policyHasLastUpdated"
> {
  const text = content.toLowerCase();

  // CCPA / CPRA regulatory mentions
  const ccpaPatterns = [
    /ccpa/,
    /california consumer privacy act/,
    /cpra/,
    /california privacy rights act/,
    /california residents/,
    /california privacy/,
    /\bshine the light\b/,
  ];
  const policyMentionsCcpa = ccpaPatterns.some((p) => p.test(text));

  // California consumer rights — need at least two distinct mentions
  const californiaRightsPatterns = [
    /right to know/,
    /right to delete/,
    /right to opt.?out/,
    /right to correct/,
    /right to limit/,
    /right to non.?discrimination/,
    /do not sell/,
    /opt out of sale/,
    /right to access/,
    /right of access/,
    /erasure request/,
  ];
  const californiaRightsCount = californiaRightsPatterns.filter((p) =>
    p.test(text)
  ).length;
  const policyListsCaliforniaRights = californiaRightsCount >= 2;

  // Contact method for California privacy requests
  const contactPatterns = [
    /privacy@/,
    /ccpa@/,
    /dpo@/,
    /california.*request/,
    /privacy.*request/,
    /data.*request/,
    /submit.*request/,
    /request.*form/,
    /1-?800/,
    /toll.?free/,
    /contact.*us.*privacy/,
  ];
  const hasCaliforniaContactMethod = contactPatterns.some((p) => p.test(text));

  // Last-updated / effective date
  const lastUpdatedPatterns = [
    /last updated/,
    /last revised/,
    /effective date/,
    /last modified/,
    /updated.*\d{4}/,
    /revised.*\d{4}/,
    /effective.*\d{4}/,
  ];
  const policyHasLastUpdated = lastUpdatedPatterns.some((p) => p.test(text));

  return {
    policyMentionsCcpa,
    policyListsCaliforniaRights,
    hasCaliforniaContactMethod,
    policyHasLastUpdated,
  };
}

// ─── Score calculation ─────────────────────────────────────────────────────────

/**
 * Calculate CCPA compliance score (0–100).
 *
 * Weighting rationale:
 * - "Do Not Sell" link (35 pts): the most visible, legally mandated CCPA signal
 * - CCPA section in policy (25 pts): explicit California disclosure required
 * - California rights list (20 pts): must enumerate all six rights
 * - CA contact method (15 pts): two-channel contact requirement
 * - Last-updated date (5 pts): best practice / some state requirements
 */
export function calculateCcpaScore(checks: CcpaChecks): number {
  let score = 0;
  if (checks.hasDoNotSellLink || checks.hasPrivacyChoicesLink) score += 35;
  if (checks.policyMentionsCcpa) score += 25;
  if (checks.policyListsCaliforniaRights) score += 20;
  if (checks.hasCaliforniaContactMethod) score += 15;
  if (checks.policyHasLastUpdated) score += 5;
  return Math.min(100, score);
}

// ─── Findings generation ───────────────────────────────────────────────────────

/**
 * Generate CCPA compliance findings.
 * @param checks       Result of CCPA checks.
 * @param hasTracking  True if the site uses analytics or marketing scripts/cookies.
 *                     When true, the "Do Not Sell" finding is escalated to error severity.
 */
export function generateCcpaFindings(
  checks: CcpaChecks,
  hasTracking: boolean
): Finding[] {
  const findings: Finding[] = [];

  // Missing "Do Not Sell or Share" link
  if (!checks.hasDoNotSellLink && !checks.hasPrivacyChoicesLink) {
    findings.push({
      type: "ccpa_do_not_sell",
      severity: hasTracking ? "error" : "warning",
      title: 'CCPA: Missing "Do Not Sell or Share My Personal Information" Link',
      description:
        'The California Consumer Privacy Act (CCPA/CPRA) requires businesses that sell or share personal information to provide a clear "Do Not Sell or Share My Personal Information" link — or the equivalent "Your Privacy Choices" wording — in the website footer and privacy policy.',
      recommendation:
        'Add a "Do Not Sell or Share My Personal Information" link (or "Your Privacy Choices" with the official privacy-options icon) to your website footer and privacy policy. The link must lead to a page or mechanism that allows California residents to opt out. Many cookie consent platforms (OneTrust, CookieYes, TrustArc) provide a ready-made CCPA opt-out flow.',
    });
  }

  // Privacy policy missing California disclosures
  if (!checks.policyMentionsCcpa) {
    findings.push({
      type: "ccpa_privacy_policy",
      severity: "warning",
      title: "CCPA: Privacy Policy Missing California-Specific Disclosures",
      description:
        "Your privacy policy does not appear to include a California-specific section required by CCPA/CPRA. California law requires businesses to disclose the categories of personal information collected, the purposes for collection, categories of third parties the data is shared with, and all California consumer rights.",
      recommendation:
        "Add a dedicated \"California Privacy Rights\" or \"Your California Privacy Rights\" section to your privacy policy. It must cover: categories of personal information collected in the last 12 months, the business purpose for each category, categories of third parties the data is disclosed to, and all six California consumer rights (right to know, delete, correct, opt-out of sale/sharing, limit use of sensitive personal information, and non-discrimination).",
    });
  }

  // Policy mentions CCPA but doesn't list California rights fully
  if (checks.policyMentionsCcpa && !checks.policyListsCaliforniaRights) {
    findings.push({
      type: "ccpa_consumer_rights",
      severity: "warning",
      title: "CCPA: California Consumer Rights Incomplete",
      description:
        "While your privacy policy references California privacy law, it does not appear to enumerate all required California consumer rights. CCPA/CPRA grants consumers six distinct rights that must be individually described.",
      recommendation:
        "Explicitly list and explain each of the six California consumer rights: (1) Right to Know — what data is collected and how it's used, (2) Right to Delete — request deletion of personal information, (3) Right to Correct — fix inaccurate personal information, (4) Right to Opt-Out — opt out of sale or sharing, (5) Right to Limit — restrict use of sensitive personal information, (6) Right to Non-Discrimination — no penalty for exercising rights. Describe how consumers can submit each type of request.",
    });
  }

  // CCPA policy exists but no contact method
  if (checks.policyMentionsCcpa && !checks.hasCaliforniaContactMethod) {
    findings.push({
      type: "ccpa_consumer_rights",
      severity: "warning",
      title: "CCPA: No Contact Method for California Privacy Requests",
      description:
        "California law requires businesses to provide at least two methods for consumers to submit privacy requests (e.g., a dedicated email address AND a webform or toll-free phone number).",
      recommendation:
        "Add at least two contact channels for California privacy requests in your privacy policy: a dedicated email address (e.g., privacy@yourcompany.com) and either a webform or a toll-free phone number. Ensure these are clearly labelled for CCPA/California privacy requests.",
    });
  }

  return findings;
}
