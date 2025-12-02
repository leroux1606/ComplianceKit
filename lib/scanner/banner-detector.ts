import type { Page } from "puppeteer";
import type { Finding } from "./types";

// Common cookie banner selectors
const BANNER_SELECTORS = [
  // ID-based selectors
  "#cookie-banner",
  "#cookie-consent",
  "#cookie-notice",
  "#cookie-popup",
  "#cookie-bar",
  "#cookie-law",
  "#gdpr-banner",
  "#gdpr-consent",
  "#consent-banner",
  "#consent-popup",
  "#privacy-banner",
  "#cc-banner",
  "#cookieConsent",
  "#CookieConsent",
  "#onetrust-banner-sdk",
  "#onetrust-consent-sdk",
  "#truste-consent-track",
  "#sp-cc",
  "#qc-cmp2-container",
  
  // Class-based selectors
  ".cookie-banner",
  ".cookie-consent",
  ".cookie-notice",
  ".cookie-popup",
  ".cookie-bar",
  ".gdpr-banner",
  ".gdpr-consent",
  ".consent-banner",
  ".consent-popup",
  ".privacy-banner",
  ".cc-banner",
  ".cc-window",
  ".cky-consent-container",
  ".osano-cm-window",
  ".termly-consent-banner",
  
  // Attribute-based selectors
  "[data-cookie-consent]",
  "[data-gdpr]",
  "[data-consent]",
  "[aria-label*='cookie']",
  "[aria-label*='consent']",
  "[role='dialog'][aria-label*='cookie']",
  "[role='dialog'][aria-label*='privacy']",
];

// Text patterns that indicate a cookie banner
const BANNER_TEXT_PATTERNS = [
  /we\s*use\s*cookies/i,
  /this\s*(website|site)\s*uses?\s*cookies/i,
  /cookie\s*(consent|preferences|settings)/i,
  /accept\s*(all\s*)?cookies/i,
  /reject\s*(all\s*)?cookies/i,
  /manage\s*(cookie\s*)?preferences/i,
  /customize\s*cookies/i,
  /cookie\s*policy/i,
  /privacy\s*preferences/i,
  /gdpr\s*consent/i,
  /your\s*privacy/i,
  /wir\s*verwenden\s*cookies/i, // German
  /nous\s*utilisons\s*des\s*cookies/i, // French
  /utilizamos\s*cookies/i, // Spanish
];

/**
 * Detect if a cookie consent banner exists on the page
 */
export async function detectCookieBanner(page: Page): Promise<{
  found: boolean;
  selector?: string;
  finding?: Finding;
}> {
  // First, check for known banner selectors
  for (const selector of BANNER_SELECTORS) {
    try {
      const element = await page.$(selector);
      if (element) {
        // Check if the element is visible
        const isVisible = await element.isVisible();
        if (isVisible) {
          return {
            found: true,
            selector,
          };
        }
      }
    } catch {
      // Selector might be invalid, continue
    }
  }

  // Check for text patterns in visible elements
  const bodyText = await page.evaluate(() => {
    // Get text from elements that might be banners (fixed position, modals, etc.)
    const potentialBanners = document.querySelectorAll(
      "[style*='fixed'], [style*='sticky'], [role='dialog'], [role='alertdialog'], .modal, .popup, .overlay"
    );
    
    let text = "";
    potentialBanners.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.offsetParent !== null) {
        // Element is visible
        text += " " + (el.textContent || "");
      }
    });
    
    return text;
  });

  for (const pattern of BANNER_TEXT_PATTERNS) {
    if (pattern.test(bodyText)) {
      return {
        found: true,
      };
    }
  }

  // Also check the entire page for cookie-related dialogs
  const hasConsentUI = await page.evaluate(() => {
    // Check for common consent management platforms
    const cmps = [
      "OneTrust",
      "Cookiebot",
      "TrustArc",
      "Quantcast",
      "Osano",
      "Termly",
      "CookieYes",
      "Complianz",
      "GDPR Cookie Consent",
    ];

    const pageText = document.body.innerText || "";
    const pageHtml = document.body.innerHTML || "";

    for (const cmp of cmps) {
      if (pageHtml.toLowerCase().includes(cmp.toLowerCase())) {
        return true;
      }
    }

    // Check for accept/reject buttons
    const buttons = document.querySelectorAll("button, [role='button'], .btn, .button");
    for (const button of buttons) {
      const text = (button.textContent || "").toLowerCase();
      if (
        text.includes("accept") && text.includes("cookie") ||
        text.includes("reject") && text.includes("cookie") ||
        text.includes("accept all") ||
        text.includes("reject all") ||
        text.includes("allow cookies") ||
        text.includes("deny cookies")
      ) {
        return true;
      }
    }

    return false;
  });

  if (hasConsentUI) {
    return {
      found: true,
    };
  }

  // Cookie banner not found
  return {
    found: false,
    finding: {
      type: "cookie_banner",
      severity: "error",
      title: "No Cookie Consent Banner Found",
      description:
        "We could not find a cookie consent banner on your website. GDPR requires websites to obtain consent before setting non-essential cookies.",
      recommendation:
        "Implement a cookie consent banner that allows users to accept or reject different categories of cookies before they are set.",
    },
  };
}

/**
 * Analyze cookie banner compliance
 */
export async function analyzeBannerCompliance(page: Page): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Check for reject option
  const hasRejectOption = await page.evaluate(() => {
    const buttons = document.querySelectorAll("button, [role='button'], a.btn, a.button");
    for (const button of buttons) {
      const text = (button.textContent || "").toLowerCase();
      if (
        text.includes("reject") ||
        text.includes("deny") ||
        text.includes("decline") ||
        text.includes("refuse")
      ) {
        return true;
      }
    }
    return false;
  });

  if (!hasRejectOption) {
    findings.push({
      type: "consent_management",
      severity: "warning",
      title: "No Clear Reject Option",
      description:
        "Your cookie banner may not have a clear option to reject non-essential cookies. GDPR requires that rejecting cookies should be as easy as accepting them.",
      recommendation:
        'Add a visible "Reject All" or "Decline" button alongside your "Accept All" button.',
    });
  }

  // Check for granular controls
  const hasGranularControls = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return (
      text.includes("preferences") ||
      text.includes("settings") ||
      text.includes("customize") ||
      text.includes("manage") ||
      document.querySelectorAll("input[type='checkbox']").length > 0
    );
  });

  if (!hasGranularControls) {
    findings.push({
      type: "consent_management",
      severity: "info",
      title: "Consider Adding Granular Controls",
      description:
        "Your cookie banner could benefit from granular consent controls that allow users to choose specific cookie categories.",
      recommendation:
        "Add options for users to enable/disable specific cookie categories (e.g., Analytics, Marketing, Functional).",
    });
  }

  return findings;
}

