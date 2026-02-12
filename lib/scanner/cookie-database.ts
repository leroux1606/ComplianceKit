/**
 * Cookie Database - Known cookie purposes and data collection info
 * This helps provide better descriptions for common cookies
 */

export interface CookieInfo {
  name: string;
  provider: string;
  category: "necessary" | "functional" | "analytics" | "marketing";
  purpose: string;
  dataCollected: string[];
  duration: string;
  gdprCompliant: boolean;
}

/**
 * Database of common cookies with their purposes
 * Add more as needed from cookiedatabase.org or similar sources
 */
export const KNOWN_COOKIES: Record<string, CookieInfo> = {
  // Google Analytics
  "_ga": {
    name: "_ga",
    provider: "Google Analytics",
    category: "analytics",
    purpose: "Used to distinguish unique users by assigning a randomly generated number as a client identifier",
    dataCollected: ["User ID", "Timestamp", "Page views", "Session duration"],
    duration: "2 years",
    gdprCompliant: false,
  },
  "_gid": {
    name: "_gid",
    provider: "Google Analytics",
    category: "analytics",
    purpose: "Used to distinguish users and store information about how visitors use a website",
    dataCollected: ["User ID", "Page views", "Events"],
    duration: "24 hours",
    gdprCompliant: false,
  },
  "_gat": {
    name: "_gat",
    provider: "Google Analytics",
    category: "analytics",
    purpose: "Used to throttle request rate to limit data collection on high traffic sites",
    dataCollected: ["Request rate"],
    duration: "1 minute",
    gdprCompliant: false,
  },

  // Google Ads / DoubleClick
  "IDE": {
    name: "IDE",
    provider: "Google DoubleClick",
    category: "marketing",
    purpose: "Used by Google DoubleClick to register and report the website user's actions after viewing or clicking one of the advertiser's ads",
    dataCollected: ["User behavior", "Ad interactions", "Browsing history"],
    duration: "1 year",
    gdprCompliant: false,
  },
  "test_cookie": {
    name: "test_cookie",
    provider: "Google DoubleClick",
    category: "marketing",
    purpose: "Used to check if the user's browser supports cookies",
    dataCollected: ["Cookie support"],
    duration: "15 minutes",
    gdprCompliant: false,
  },

  // Facebook
  "_fbp": {
    name: "_fbp",
    provider: "Facebook",
    category: "marketing",
    purpose: "Used by Facebook to deliver advertising products such as real time bidding from third party advertisers",
    dataCollected: ["User behavior", "Ad interactions", "Pixel ID"],
    duration: "3 months",
    gdprCompliant: false,
  },
  "fr": {
    name: "fr",
    provider: "Facebook",
    category: "marketing",
    purpose: "Used by Facebook to deliver advertising and measure advertising effectiveness",
    dataCollected: ["User ID", "Browser info", "Ad interactions"],
    duration: "3 months",
    gdprCompliant: false,
  },

  // YouTube
  "VISITOR_INFO1_LIVE": {
    name: "VISITOR_INFO1_LIVE",
    provider: "YouTube",
    category: "marketing",
    purpose: "Tries to estimate the users' bandwidth on pages with integrated YouTube videos",
    dataCollected: ["Bandwidth", "Video views"],
    duration: "179 days",
    gdprCompliant: false,
  },
  "YSC": {
    name: "YSC",
    provider: "YouTube",
    category: "marketing",
    purpose: "Registers a unique ID to keep statistics of what videos from YouTube the user has seen",
    dataCollected: ["Video views", "User preferences"],
    duration: "Session",
    gdprCompliant: false,
  },

  // Common Session/Auth Cookies
  "PHPSESSID": {
    name: "PHPSESSID",
    provider: "PHP",
    category: "necessary",
    purpose: "Preserves user session state across page requests",
    dataCollected: ["Session ID"],
    duration: "Session",
    gdprCompliant: true,
  },
  "JSESSIONID": {
    name: "JSESSIONID",
    provider: "Java",
    category: "necessary",
    purpose: "Used by sites written in JSP to maintain session state",
    dataCollected: ["Session ID"],
    duration: "Session",
    gdprCompliant: true,
  },
  "ASP.NET_SessionId": {
    name: "ASP.NET_SessionId",
    provider: "Microsoft ASP.NET",
    category: "necessary",
    purpose: "Used to maintain an anonymous user session by the server",
    dataCollected: ["Session ID"],
    duration: "Session",
    gdprCompliant: true,
  },

  // Cookie Consent
  "cookie_consent": {
    name: "cookie_consent",
    provider: "Website",
    category: "necessary",
    purpose: "Stores the user's cookie consent preferences",
    dataCollected: ["Consent preferences"],
    duration: "1 year",
    gdprCompliant: true,
  },
  "cookieyes-consent": {
    name: "cookieyes-consent",
    provider: "CookieYes",
    category: "necessary",
    purpose: "Stores cookie consent preferences",
    dataCollected: ["Consent preferences"],
    duration: "1 year",
    gdprCompliant: true,
  },

  // BBC Specific (since you tested with BBC)
  "ckns_policy": {
    name: "ckns_policy",
    provider: "BBC",
    category: "necessary",
    purpose: "Stores cookie policy acceptance",
    dataCollected: ["Policy acceptance"],
    duration: "1 year",
    gdprCompliant: true,
  },
  "ckns_explicit": {
    name: "ckns_explicit",
    provider: "BBC",
    category: "analytics",
    purpose: "Stores explicit consent for analytics cookies",
    dataCollected: ["Consent preferences"],
    duration: "1 year",
    gdprCompliant: true,
  },
};

/**
 * Get cookie information from database
 */
export function getCookieInfo(cookieName: string): CookieInfo | null {
  // Exact match
  if (KNOWN_COOKIES[cookieName]) {
    return KNOWN_COOKIES[cookieName];
  }

  // Partial match for cookies with dynamic suffixes
  const baseName = cookieName.split("_")[0];
  if (KNOWN_COOKIES[baseName]) {
    return KNOWN_COOKIES[baseName];
  }

  return null;
}

/**
 * Categorize cookie based on name patterns
 */
export function categorizeCookie(cookieName: string): "necessary" | "functional" | "analytics" | "marketing" | null {
  const lowerName = cookieName.toLowerCase();

  // Analytics patterns
  if (
    lowerName.includes("_ga") ||
    lowerName.includes("analytics") ||
    lowerName.includes("_gid") ||
    lowerName.includes("_gat")
  ) {
    return "analytics";
  }

  // Marketing/Advertising patterns
  if (
    lowerName.includes("_fb") ||
    lowerName.includes("doubleclick") ||
    lowerName.includes("ads") ||
    lowerName.includes("advertis") ||
    lowerName.includes("marketing") ||
    lowerName.includes("tracking")
  ) {
    return "marketing";
  }

  // Session/Necessary patterns
  if (
    lowerName.includes("session") ||
    lowerName.includes("csrf") ||
    lowerName.includes("xsrf") ||
    lowerName.includes("auth") ||
    lowerName.includes("login") ||
    lowerName.includes("consent")
  ) {
    return "necessary";
  }

  return null;
}

/**
 * Generate a generic description for unknown cookies
 */
export function generateGenericDescription(cookieName: string, domain: string): string {
  const category = categorizeCookie(cookieName);

  switch (category) {
    case "analytics":
      return `This cookie is used for analytics purposes by ${domain}. It may track user behavior and page views.`;
    case "marketing":
      return `This cookie is used for marketing and advertising purposes. It may track user behavior for targeted advertising.`;
    case "necessary":
      return `This cookie appears to be necessary for the website's core functionality, such as maintaining your session or security.`;
    case "functional":
      return `This cookie enhances website functionality and user experience.`;
    default:
      return `This cookie is set by ${domain}. Its specific purpose has not been identified.`;
  }
}
