import { processTemplate, formatPolicyDate, type TemplateData } from "./template-engine";
import { COOKIE_POLICY_TEMPLATE } from "./templates/cookie-policy";
import type { Cookie, Script } from "@prisma/client";

export interface CookiePolicyData {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  websiteUrl: string;
  cookies?: Cookie[];
  scripts?: Script[];
}

/**
 * Generate a cookie policy based on website scan data
 */
export function generateCookiePolicy(data: CookiePolicyData): string {
  const cookies = data.cookies || [];
  
  const necessaryCookies = cookies.filter(c => c.category === "necessary");
  const analyticsCookies = cookies.filter(c => c.category === "analytics");
  const marketingCookies = cookies.filter(c => c.category === "marketing");
  const functionalCookies = cookies.filter(c => c.category === "functional");

  const trackingScripts = data.scripts?.filter(
    s => s.category === "analytics" || s.category === "marketing"
  ) || [];

  const templateData: TemplateData = {
    lastUpdated: formatPolicyDate(),
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyEmail: data.companyEmail,
    websiteUrl: data.websiteUrl,
    
    hasNecessaryCookies: necessaryCookies.length > 0,
    necessaryCookies: formatCookies(necessaryCookies),
    
    hasAnalyticsCookies: analyticsCookies.length > 0,
    analyticsCookies: formatCookies(analyticsCookies),
    
    hasMarketingCookies: marketingCookies.length > 0,
    marketingCookies: formatCookies(marketingCookies),
    
    hasFunctionalCookies: functionalCookies.length > 0,
    functionalCookies: formatCookies(functionalCookies),
    
    hasTrackingScripts: trackingScripts.length > 0,
    trackingScripts: trackingScripts.map(s => ({
      name: s.name || "Unknown Service",
      category: formatCategory(s.category || "unknown"),
    })),
  };

  return processTemplate(COOKIE_POLICY_TEMPLATE, templateData);
}

/**
 * Format cookies for template
 */
function formatCookies(cookies: Cookie[]): TemplateData[] {
  return cookies.map(cookie => ({
    name: cookie.name,
    description: cookie.description || getDefaultDescription(cookie.category),
    expires: cookie.expires ? formatExpiry(cookie.expires) : null,
  }));
}

/**
 * Format expiry date
 */
function formatExpiry(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days <= 1) return "1 day";
  if (days <= 7) return `${days} days`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
  if (days <= 365) return `${Math.ceil(days / 30)} months`;
  return `${Math.ceil(days / 365)} years`;
}

/**
 * Get default description for cookie category
 */
function getDefaultDescription(category: string | null): string {
  const descriptions: Record<string, string> = {
    necessary: "Essential for website functionality",
    analytics: "Used for analytics and performance tracking",
    marketing: "Used for advertising and marketing purposes",
    functional: "Enables enhanced functionality and personalization",
  };
  return descriptions[category || ""] || "Third-party cookie";
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  const categories: Record<string, string> = {
    analytics: "Analytics",
    marketing: "Marketing",
    functional: "Functionality",
    social: "Social Media",
    unknown: "Other",
  };
  return categories[category] || category;
}



