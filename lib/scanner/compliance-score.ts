import type { DetectedCookie, DetectedScript, Finding, UserRightsDetection } from "./types";

interface ScoreInput {
  hasPrivacyPolicy: boolean;
  hasCookieBanner: boolean;
  cookies: DetectedCookie[];
  scripts: DetectedScript[];
  findings: Finding[];
  userRights?: UserRightsDetection;
  privacyPolicyScore?: number; // 0-100
  consentQualityScore?: number; // 0-100
}

interface ScoreBreakdown {
  total: number;
  privacyPolicy: number;
  cookieBanner: number;
  cookieCategories: number;
  trackingDisclosure: number;
  userRights: number;
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
  let userRights = 0;
  let penalties = 0;

  // Privacy Policy (20 points)
  // Now includes quality score if available
  if (input.hasPrivacyPolicy) {
    if (input.privacyPolicyScore !== undefined) {
      // Use quality score: 0-100 becomes 0-20 points
      privacyPolicy = Math.round((input.privacyPolicyScore / 100) * 20);
    } else {
      // If no quality analysis, give partial credit just for having one
      privacyPolicy = 10;
    }
  }

  // Cookie Banner (20 points)
  // Now includes quality score if available
  if (input.hasCookieBanner) {
    if (input.consentQualityScore !== undefined) {
      // Use quality score: 0-100 becomes 0-20 points
      cookieBanner = Math.round((input.consentQualityScore / 100) * 20);
    } else {
      // If no quality analysis, give partial credit just for having one
      cookieBanner = 10;
    }
  }

  // Cookie Categorization (20 points)
  // Score based on how many cookies are properly categorized
  if (input.cookies.length > 0) {
    const categorizedCookies = input.cookies.filter(
      (c) => c.category && c.category !== "unknown"
    );
    const categorizedPercentage = categorizedCookies.length / input.cookies.length;
    cookieCategories = Math.round(20 * categorizedPercentage);
  } else {
    // No cookies is actually good - full points
    cookieCategories = 20;
  }

  // Tracking Script Disclosure (20 points)
  // If there are tracking scripts, they should be disclosed (banner + policy)
  const trackingScripts = input.scripts.filter(
    (s) => s.category === "analytics" || s.category === "marketing"
  );

  if (trackingScripts.length === 0) {
    // No tracking scripts - full points
    trackingDisclosure = 20;
  } else if (input.hasPrivacyPolicy && input.hasCookieBanner) {
    // Has both - assume proper disclosure
    trackingDisclosure = 20;
  } else if (input.hasPrivacyPolicy || input.hasCookieBanner) {
    // Has one - partial credit
    trackingDisclosure = 12;
  } else {
    // Has neither - minimal credit
    trackingDisclosure = 4;
  }

  // User Rights (20 points) - GDPR Articles 15, 16, 17, 20
  // 5 points each for: profile settings, data export, account deletion, DSAR mechanism
  if (input.userRights) {
    if (input.userRights.hasProfileSettings) {
      userRights += 5; // Article 16 - Right to Rectification
    }
    if (input.userRights.hasDataExport) {
      userRights += 5; // Article 20 - Right to Data Portability
    }
    if (input.userRights.hasAccountDeletion) {
      userRights += 5; // Article 17 - Right to Erasure
    }
    if (input.userRights.hasDsarMechanism) {
      userRights += 5; // Article 15 - Right to Access
    }
  }

  // Penalties for severe issues
  // Count ALL error-severity findings (including user rights if they have auth)
  const errorFindings = input.findings.filter((f) => f.severity === "error");
  penalties = errorFindings.length * 5; // -5 points per error

  // Calculate subtotal before applying penalties
  const subtotal = privacyPolicy + cookieBanner + cookieCategories + trackingDisclosure + userRights;
  
  // Ensure a minimum score of 30 if the site has no cookies and no critical issues
  // This prevents "clean" sites from getting 0
  const hasNoCookiesOrTracking = input.cookies.length === 0 && 
    input.scripts.filter((s) => s.category === "analytics" || s.category === "marketing").length === 0;
  const minScore = hasNoCookiesOrTracking && errorFindings.length === 0 ? 30 : 0;

  const total = Math.max(minScore, subtotal - penalties);

  return {
    total: Math.max(0, Math.min(100, total)),
    privacyPolicy,
    cookieBanner,
    cookieCategories,
    trackingDisclosure,
    userRights,
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

  // User Rights recommendations
  if (input.userRights) {
    if (!input.userRights.hasProfileSettings) {
      recommendations.push(
        "Add user profile/account settings where users can view and update their personal information (GDPR Article 16 - Right to Rectification)."
      );
    }

    if (!input.userRights.hasDataExport) {
      recommendations.push(
        "Implement a data export feature allowing users to download their personal data in a machine-readable format (GDPR Article 20 - Right to Data Portability)."
      );
    }

    if (!input.userRights.hasAccountDeletion) {
      recommendations.push(
        "Add account deletion functionality so users can permanently delete their data (GDPR Article 17 - Right to Erasure)."
      );
    }

    if (!input.userRights.hasDsarMechanism) {
      recommendations.push(
        "Provide a clear mechanism for users to submit Data Subject Access Requests (DSARs) such as a contact form or email address (GDPR Article 15 - Right to Access)."
      );
    }
  }

  return recommendations;
}



