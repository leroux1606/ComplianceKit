import type { Page } from "puppeteer";
import type { Finding } from "./types";

// Common privacy policy link patterns
const PRIVACY_POLICY_PATTERNS = [
  /privacy\s*policy/i,
  /privacy\s*notice/i,
  /privacy\s*statement/i,
  /datenschutz/i, // German
  /politique\s*de\s*confidentialit/i, // French
  /privacybeleid/i, // Dutch
  /informativa\s*privacy/i, // Italian
  /política\s*de\s*privacidad/i, // Spanish
];

const PRIVACY_POLICY_HREF_PATTERNS = [
  /privacy/i,
  /datenschutz/i,
  /confidentialit/i,
  /privacidad/i,
];

/**
 * Detect if a privacy policy link exists on the page
 */
export async function detectPrivacyPolicy(page: Page): Promise<{
  found: boolean;
  url?: string;
  finding?: Finding;
}> {
  // Search for privacy policy links
  const links = await page.$$eval("a", (elements) => {
    return elements.map((el) => ({
      href: el.href,
      text: el.textContent?.trim() || "",
      ariaLabel: el.getAttribute("aria-label") || "",
    }));
  });

  // Check each link for privacy policy patterns
  for (const link of links) {
    const textToCheck = `${link.text} ${link.ariaLabel}`;
    
    // Check link text
    for (const pattern of PRIVACY_POLICY_PATTERNS) {
      if (pattern.test(textToCheck)) {
        return {
          found: true,
          url: link.href,
        };
      }
    }

    // Check href
    for (const pattern of PRIVACY_POLICY_HREF_PATTERNS) {
      if (pattern.test(link.href)) {
        return {
          found: true,
          url: link.href,
        };
      }
    }
  }

  // Also check footer specifically (common location)
  const footerLinks = await page.$$eval(
    "footer a, [class*='footer'] a, #footer a",
    (elements) => {
      return elements.map((el) => ({
        href: el.href,
        text: el.textContent?.trim() || "",
      }));
    }
  );

  for (const link of footerLinks) {
    for (const pattern of PRIVACY_POLICY_PATTERNS) {
      if (pattern.test(link.text)) {
        return {
          found: true,
          url: link.href,
        };
      }
    }
  }

  // Privacy policy not found
  return {
    found: false,
    finding: {
      type: "privacy_policy",
      severity: "error",
      title: "No Privacy Policy Found",
      description:
        "We could not find a privacy policy link on your website. GDPR requires websites to have a clear and accessible privacy policy.",
      recommendation:
        "Add a privacy policy page and link to it prominently in your website footer and/or navigation menu.",
    },
  };
}

/**
 * Detect terms of service link
 */
export async function detectTermsOfService(page: Page): Promise<{
  found: boolean;
  url?: string;
}> {
  const termsPatterns = [
    /terms\s*(of\s*)?(service|use|conditions)/i,
    /conditions\s*(of\s*)?use/i,
    /nutzungsbedingungen/i, // German
    /conditions\s*générales/i, // French
    /términos\s*(y\s*)?condiciones/i, // Spanish
  ];

  const links = await page.$$eval("a", (elements) => {
    return elements.map((el) => ({
      href: el.href,
      text: el.textContent?.trim() || "",
    }));
  });

  for (const link of links) {
    for (const pattern of termsPatterns) {
      if (pattern.test(link.text) || pattern.test(link.href)) {
        return {
          found: true,
          url: link.href,
        };
      }
    }
  }

  return { found: false };
}

/**
 * Detect cookie policy link
 */
export async function detectCookiePolicy(page: Page): Promise<{
  found: boolean;
  url?: string;
}> {
  const cookiePatterns = [
    /cookie\s*policy/i,
    /cookie\s*notice/i,
    /cookie\s*richtlinie/i, // German
    /politique\s*(des\s*)?cookies/i, // French
    /política\s*de\s*cookies/i, // Spanish
  ];

  const links = await page.$$eval("a", (elements) => {
    return elements.map((el) => ({
      href: el.href,
      text: el.textContent?.trim() || "",
    }));
  });

  for (const link of links) {
    for (const pattern of cookiePatterns) {
      if (pattern.test(link.text) || pattern.test(link.href)) {
        return {
          found: true,
          url: link.href,
        };
      }
    }
  }

  return { found: false };
}



