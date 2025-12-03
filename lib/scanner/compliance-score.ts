import type { DetectedCookie, DetectedScript, Finding } from "./types";

interface ScoreInput {
  hasPrivacyPolicy: boolean;
  hasCookieBanner: boolean;
  cookies: DetectedCookie[];
  scripts: DetectedScript[];
  findings: Finding[];
}

interface ScoreBreakdown {
  total: number;
  privacyPolicy: number;
  cookieBanner: number;
  cookieCategories: number;
  trackingDisclosure: number;
  penalties: number;
}

/**
 * Calculate compliance score (0-100)
 */
export function calculateComplianceScore(input: ScoreInput): number {
  const breakdown = getScoreBreakdown(input);
  return Math.max(0, Math.min(100, breakdown.total));
}

/**
 * Get detailed score breakdown
 */
export function getScoreBreakdown(input: ScoreInput): ScoreBreakdown {
  let privacyPolicy = 0;
  let cookieBanner = 0;
  let cookieCategories = 0;
  let trackingDisclosure = 0;
  let penalties = 0;

  // Privacy Policy (25 points)
  if (input.hasPrivacyPolicy) {
    privacyPolicy = 25;
  }

  // Cookie Banner (25 points)
  if (input.hasCookieBanner) {
    cookieBanner = 25;
  }

  // Cookie Categorization (25 points)
  // Score based on how many cookies are properly categorized
  if (input.cookies.length > 0) {
    const categorizedCookies = input.cookies.filter(
      (c) => c.category && c.category !== "unknown"
    );
    const categorizedPercentage = categorizedCookies.length / input.cookies.length;
    cookieCategories = Math.round(25 * categorizedPercentage);
  } else {
    // No cookies is actually good - full points
    cookieCategories = 25;
  }

  // Tracking Script Disclosure (25 points)
  // If there are tracking scripts, they should be disclosed (banner + policy)
  const trackingScripts = input.scripts.filter(
    (s) => s.category === "analytics" || s.category === "marketing"
  );

  if (trackingScripts.length === 0) {
    // No tracking scripts - full points
    trackingDisclosure = 25;
  } else if (input.hasPrivacyPolicy && input.hasCookieBanner) {
    // Has both - assume proper disclosure
    trackingDisclosure = 25;
  } else if (input.hasPrivacyPolicy || input.hasCookieBanner) {
    // Has one - partial credit
    trackingDisclosure = 15;
  } else {
    // Has neither - minimal credit
    trackingDisclosure = 5;
  }

  // Penalties for severe issues
  const errorFindings = input.findings.filter((f) => f.severity === "error");
  penalties = errorFindings.length * 5; // -5 points per error

  const total =
    privacyPolicy +
    cookieBanner +
    cookieCategories +
    trackingDisclosure -
    penalties;

  return {
    total: Math.max(0, Math.min(100, total)),
    privacyPolicy,
    cookieBanner,
    cookieCategories,
    trackingDisclosure,
    penalties,
  };
}

/**
 * Get compliance level based on score
 */
export function getComplianceLevel(score: number): {
  level: "excellent" | "good" | "fair" | "poor";
  label: string;
  color: string;
} {
  if (score >= 80) {
    return {
      level: "excellent",
      label: "Excellent",
      color: "text-green-600",
    };
  } else if (score >= 60) {
    return {
      level: "good",
      label: "Good",
      color: "text-blue-600",
    };
  } else if (score >= 40) {
    return {
      level: "fair",
      label: "Fair",
      color: "text-yellow-600",
    };
  } else {
    return {
      level: "poor",
      label: "Needs Improvement",
      color: "text-red-600",
    };
  }
}

/**
 * Generate recommendations based on score
 */
export function generateRecommendations(input: ScoreInput): string[] {
  const recommendations: string[] = [];

  if (!input.hasPrivacyPolicy) {
    recommendations.push(
      "Add a privacy policy page that explains how you collect and process user data."
    );
  }

  if (!input.hasCookieBanner) {
    recommendations.push(
      "Implement a cookie consent banner to obtain user consent before setting non-essential cookies."
    );
  }

  const uncategorizedCookies = input.cookies.filter(
    (c) => !c.category || c.category === "unknown"
  );
  if (uncategorizedCookies.length > 0) {
    recommendations.push(
      `Review and categorize ${uncategorizedCookies.length} unidentified cookies on your website.`
    );
  }

  const trackingScripts = input.scripts.filter(
    (s) => s.category === "analytics" || s.category === "marketing"
  );
  if (trackingScripts.length > 0 && !input.hasCookieBanner) {
    recommendations.push(
      "Ensure tracking scripts are only loaded after obtaining user consent."
    );
  }

  const thirdPartyCookies = input.cookies.filter(
    (c) => c.category === "marketing" || c.category === "analytics"
  );
  if (thirdPartyCookies.length > 0) {
    recommendations.push(
      "Document all third-party cookies in your cookie policy with their purposes and retention periods."
    );
  }

  return recommendations;
}



