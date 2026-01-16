import { Page } from "puppeteer";
import type { Finding } from "./types";

/**
 * Cookie Consent Banner Quality Analysis
 * Analyzes consent banner for GDPR Article 7 compliance
 */

export interface ConsentQualityAnalysis {
  hasRejectButton: boolean;
  rejectAsProminentAsAccept: boolean;
  hasGranularConsent: boolean;
  noPretickedBoxes: boolean;
  hasClearLanguage: boolean;
  hasWithdrawOption: boolean;
  qualityScore: number; // 0-100
}

/**
 * Analyze cookie consent banner quality
 */
export async function analyzeConsentQuality(page: Page, hasBanner: boolean): Promise<ConsentQualityAnalysis> {
  if (!hasBanner) {
    return {
      hasRejectButton: false,
      rejectAsProminentAsAccept: false,
      hasGranularConsent: false,
      noPretickedBoxes: true, // N/A if no banner
      hasClearLanguage: false,
      hasWithdrawOption: false,
      qualityScore: 0,
    };
  }

  try {
    const analysis = await page.evaluate(() => {
      const result = {
        hasRejectButton: false,
        rejectAsProminentAsAccept: false,
        hasGranularConsent: false,
        noPretickedBoxes: true,
        hasClearLanguage: false,
        hasWithdrawOption: false,
      };

      // Common cookie banner selectors
      const bannerSelectors = [
        '[class*="cookie"]',
        '[id*="cookie"]',
        '[class*="consent"]',
        '[id*="consent"]',
        '[class*="gdpr"]',
        '[id*="gdpr"]',
        '[class*="banner"]',
        '[aria-label*="cookie"]',
        '[aria-label*="consent"]',
      ];

      let bannerElement: Element | null = null;

      for (const selector of bannerSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          // Check if element is visible and has substantial size
          const rect = el.getBoundingClientRect();
          if (rect.width > 200 && rect.height > 50) {
            bannerElement = el;
            break;
          }
        }
        if (bannerElement) break;
      }

      if (!bannerElement) {
        return result;
      }

      // Get all buttons in the banner
      const buttons = bannerElement.querySelectorAll("button, a[role='button'], input[type='button']");
      const buttonTexts: Array<{ text: string; element: Element }> = [];

      buttons.forEach((btn) => {
        const text = (btn.textContent || btn.getAttribute("aria-label") || "").toLowerCase().trim();
        if (text) {
          buttonTexts.push({ text, element: btn as Element });
        }
      });

      // Check for accept button
      const acceptPatterns = [/accept/i, /agree/i, /allow/i, /ok/i, /got\s*it/i, /understood/i];
      const acceptButtons = buttonTexts.filter((btn) =>
        acceptPatterns.some((pattern) => pattern.test(btn.text))
      );

      // Check for reject button
      const rejectPatterns = [/reject/i, /decline/i, /deny/i, /refuse/i, /no\s*thanks/i, /dismiss/i];
      const rejectButtons = buttonTexts.filter((btn) =>
        rejectPatterns.some((pattern) => pattern.test(btn.text))
      );

      result.hasRejectButton = rejectButtons.length > 0;

      // Check if reject button is as prominent as accept button
      if (acceptButtons.length > 0 && rejectButtons.length > 0) {
        const acceptBtn = acceptButtons[0].element as HTMLElement;
        const rejectBtn = rejectButtons[0].element as HTMLElement;

        const acceptStyle = window.getComputedStyle(acceptBtn);
        const rejectStyle = window.getComputedStyle(rejectBtn);

        // Compare visual prominence
        const acceptFontSize = parseFloat(acceptStyle.fontSize);
        const rejectFontSize = parseFloat(rejectStyle.fontSize);
        const acceptPadding =
          parseFloat(acceptStyle.paddingTop) + parseFloat(acceptStyle.paddingBottom);
        const rejectPadding =
          parseFloat(rejectStyle.paddingTop) + parseFloat(rejectStyle.paddingBottom);

        // Buttons should be roughly equal in size
        const fontSizeDiff = Math.abs(acceptFontSize - rejectFontSize);
        const paddingDiff = Math.abs(acceptPadding - rejectPadding);

        result.rejectAsProminentAsAccept = fontSizeDiff < 4 && paddingDiff < 10;
      }

      // Check for granular consent (checkboxes for different categories)
      const checkboxes = bannerElement.querySelectorAll('input[type="checkbox"]');
      const categoryKeywords = [
        /necessary/i,
        /functional/i,
        /analytics/i,
        /marketing/i,
        /advertising/i,
        /preferences/i,
        /statistics/i,
      ];

      let categoryCheckboxes = 0;
      checkboxes.forEach((checkbox) => {
        const label =
          checkbox.parentElement?.textContent ||
          checkbox.nextElementSibling?.textContent ||
          checkbox.getAttribute("aria-label") ||
          "";
        if (categoryKeywords.some((pattern) => pattern.test(label))) {
          categoryCheckboxes++;
        }
      });

      result.hasGranularConsent = categoryCheckboxes >= 2;

      // Check for pre-ticked boxes (bad practice)
      let hasPretickedBoxes = false;
      checkboxes.forEach((checkbox) => {
        const input = checkbox as HTMLInputElement;
        // Skip "necessary" cookies which can be pre-checked
        const label = (
          checkbox.parentElement?.textContent ||
          checkbox.nextElementSibling?.textContent ||
          ""
        ).toLowerCase();
        if (input.checked && !label.includes("necessary") && !label.includes("essential")) {
          hasPretickedBoxes = true;
        }
      });
      result.noPretickedBoxes = !hasPretickedBoxes;

      // Check for clear language
      const bannerText = (bannerElement.textContent || "").toLowerCase();
      const clarityKeywords = [
        /cookie/i,
        /consent/i,
        /privacy/i,
        /data/i,
        /personal information/i,
      ];
      result.hasClearLanguage = clarityKeywords.some((pattern) => pattern.test(bannerText));

      // Check for withdraw option
      const withdrawPatterns = [
        /withdraw/i,
        /change.*preference/i,
        /manage.*cookie/i,
        /cookie.*setting/i,
        /privacy.*setting/i,
      ];

      const allText = document.body.textContent || "";
      const allLinks = Array.from(document.querySelectorAll("a")).map(
        (a) => a.textContent?.toLowerCase() || ""
      );

      result.hasWithdrawOption =
        withdrawPatterns.some((pattern) => pattern.test(allText)) ||
        allLinks.some((text) => withdrawPatterns.some((pattern) => pattern.test(text)));

      return result;
    });

    // Calculate quality score
    let score = 0;
    if (analysis.hasRejectButton) score += 25;
    if (analysis.rejectAsProminentAsAccept) score += 20;
    if (analysis.hasGranularConsent) score += 20;
    if (analysis.noPretickedBoxes) score += 15;
    if (analysis.hasClearLanguage) score += 10;
    if (analysis.hasWithdrawOption) score += 10;

    return {
      ...analysis,
      qualityScore: score,
    };
  } catch (error) {
    console.error("Consent quality analysis error:", error);
    return {
      hasRejectButton: false,
      rejectAsProminentAsAccept: false,
      hasGranularConsent: false,
      noPretickedBoxes: true,
      hasClearLanguage: false,
      hasWithdrawOption: false,
      qualityScore: 0,
    };
  }
}

/**
 * Generate findings for consent banner quality issues
 */
export function generateConsentQualityFindings(
  analysis: ConsentQualityAnalysis,
  hasBanner: boolean
): Finding[] {
  const findings: Finding[] = [];

  if (!hasBanner) {
    return findings; // No banner = handled elsewhere
  }

  const issues: string[] = [];

  if (!analysis.hasRejectButton) {
    issues.push("No reject/decline button");
  }

  if (analysis.hasRejectButton && !analysis.rejectAsProminentAsAccept) {
    issues.push("Reject button is less prominent than accept button");
  }

  if (!analysis.hasGranularConsent) {
    issues.push("No granular consent by category");
  }

  if (!analysis.noPretickedBoxes) {
    issues.push("Pre-ticked consent boxes detected");
  }

  if (!analysis.hasWithdrawOption) {
    issues.push("No clear way to withdraw consent");
  }

  // Generate findings based on quality score
  if (analysis.qualityScore < 50) {
    findings.push({
      type: "consent_management",
      severity: "error",
      title: "Non-Compliant Cookie Consent Banner (Article 7)",
      description: `Your cookie consent banner fails ${issues.length} GDPR Article 7 requirements. Quality score: ${analysis.qualityScore}/100. Issues: ${issues.join("; ")}.`,
      recommendation:
        "GDPR requires consent to be freely given, specific, informed, and unambiguous. Ensure your consent banner has: (1) A reject button as prominent as accept, (2) Granular consent by cookie category, (3) No pre-ticked boxes, (4) Clear language, and (5) Easy withdrawal option.",
    });
  } else if (analysis.qualityScore < 80) {
    findings.push({
      type: "consent_management",
      severity: "warning",
      title: "Cookie Consent Banner Needs Improvement (Article 7)",
      description: `Your cookie consent banner has ${issues.length} compliance issues. Quality score: ${analysis.qualityScore}/100. Issues: ${issues.join("; ")}.`,
      recommendation: "Improve your consent banner to address: " + issues.join(", ") + ".",
    });
  }

  // Specific critical issues
  if (!analysis.hasRejectButton) {
    findings.push({
      type: "consent_management",
      severity: "error",
      title: "No Reject Button in Consent Banner (Article 7)",
      description:
        "Your consent banner does not have a reject/decline button. GDPR Article 7 requires consent to be 'freely given', meaning users must be able to refuse consent as easily as they can accept it.",
      recommendation:
        "Add a reject/decline button to your consent banner that is as visually prominent as the accept button. Users should not be forced or manipulated into accepting cookies.",
    });
  }

  if (!analysis.noPretickedBoxes) {
    findings.push({
      type: "consent_management",
      severity: "error",
      title: "Pre-Ticked Consent Boxes (Article 7)",
      description:
        "Your consent banner has pre-ticked checkboxes for non-essential cookies. GDPR Article 7 requires consent to be obtained through a clear affirmative action - pre-ticked boxes do not constitute valid consent.",
      recommendation:
        "Remove pre-ticked boxes from your consent banner. Only 'strictly necessary' cookies can be enabled by default. All other cookie categories must require active user consent.",
    });
  }

  return findings;
}
