import type { Page, Cookie as PuppeteerCookie } from "puppeteer";
import type { DetectedCookie, CookieCategory } from "./types";
import { COOKIE_PATTERNS } from "./types";
import { getCookieInfo, generateGenericDescription, categorizeCookie as categorizeCookieByName } from "./cookie-database";

/**
 * Detect and categorize cookies from a Puppeteer page
 */
export async function detectCookies(
  page: Page,
  websiteUrl: string
): Promise<DetectedCookie[]> {
  const puppeteerCookies = await page.cookies();
  const websiteDomain = new URL(websiteUrl).hostname;

  return puppeteerCookies.map((cookie) => {
    const isThirdParty = !isFirstPartyCookie(cookie.domain, websiteDomain);
    
    // First, check our cookie database for known cookies
    const cookieInfo = getCookieInfo(cookie.name);
    
    let category: CookieCategory;
    let description: string | undefined;
    
    if (cookieInfo) {
      // Use information from database
      category = cookieInfo.category;
      description = `${cookieInfo.purpose} (${cookieInfo.provider})`;
    } else {
      // Fall back to pattern matching
      const fallback = categorizeCookie(cookie.name, cookie.domain);
      category = fallback.category;
      description = fallback.description || generateGenericDescription(cookie.name, cookie.domain);
    }
    
    // Override unknown third-party cookies as marketing
    if (isThirdParty && category === "unknown") {
      category = "marketing";
      description = `Third-party marketing cookie from ${cookie.domain}`;
    }

    return {
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure ?? false,
      httpOnly: cookie.httpOnly ?? false,
      sameSite: cookie.sameSite ?? undefined,
      expires: cookie.expires && cookie.expires > 0 
        ? new Date(cookie.expires * 1000) 
        : undefined,
      category,
      description,
    };
  });
}

/**
 * Categorize a cookie based on its name
 */
function categorizeCookie(
  name: string,
  domain: string
): { category: CookieCategory; description?: string } {
  const lowerName = name.toLowerCase();
  
  // Check exact matches first
  for (const [pattern, info] of Object.entries(COOKIE_PATTERNS)) {
    if (lowerName === pattern.toLowerCase()) {
      return info;
    }
  }

  // Check prefix matches
  for (const [pattern, info] of Object.entries(COOKIE_PATTERNS)) {
    if (lowerName.startsWith(pattern.toLowerCase())) {
      return info;
    }
  }

  // Check contains matches for common patterns
  if (lowerName.includes("session") || lowerName.includes("sess")) {
    return { category: "necessary", description: "Session cookie" };
  }
  if (lowerName.includes("auth") || lowerName.includes("login") || lowerName.includes("user")) {
    return { category: "necessary", description: "Authentication cookie" };
  }
  if (lowerName.includes("csrf") || lowerName.includes("xsrf") || lowerName.includes("token")) {
    return { category: "necessary", description: "Security cookie" };
  }
  if (lowerName.includes("analytics") || lowerName.includes("track")) {
    return { category: "analytics", description: "Analytics cookie" };
  }
  if (lowerName.includes("ad") || lowerName.includes("marketing") || lowerName.includes("pixel")) {
    return { category: "marketing", description: "Marketing cookie" };
  }
  if (lowerName.includes("pref") || lowerName.includes("setting") || lowerName.includes("lang")) {
    return { category: "functional", description: "Preference cookie" };
  }

  return { category: "unknown" };
}

/**
 * Check if a cookie is first-party (same domain as website)
 */
function isFirstPartyCookie(cookieDomain: string, websiteDomain: string): boolean {
  // Remove leading dot from cookie domain
  const normalizedCookieDomain = cookieDomain.startsWith(".")
    ? cookieDomain.slice(1)
    : cookieDomain;

  // Check if cookie domain matches or is a subdomain
  return (
    normalizedCookieDomain === websiteDomain ||
    websiteDomain.endsWith("." + normalizedCookieDomain) ||
    normalizedCookieDomain.endsWith("." + websiteDomain)
  );
}

/**
 * Get cookie statistics
 */
export function getCookieStats(cookies: DetectedCookie[]) {
  const stats = {
    total: cookies.length,
    necessary: 0,
    analytics: 0,
    marketing: 0,
    functional: 0,
    unknown: 0,
    firstParty: 0,
    thirdParty: 0,
    secure: 0,
    httpOnly: 0,
  };

  for (const cookie of cookies) {
    // Category counts
    switch (cookie.category) {
      case "necessary":
        stats.necessary++;
        break;
      case "analytics":
        stats.analytics++;
        break;
      case "marketing":
        stats.marketing++;
        break;
      case "functional":
        stats.functional++;
        break;
      default:
        stats.unknown++;
    }

    // Security flags
    if (cookie.secure) stats.secure++;
    if (cookie.httpOnly) stats.httpOnly++;
  }

  return stats;
}

