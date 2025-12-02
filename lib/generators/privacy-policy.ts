import { processTemplate, formatPolicyDate, type TemplateData } from "./template-engine";
import { PRIVACY_POLICY_TEMPLATE } from "./templates/privacy-policy";
import type { Cookie, Script } from "@prisma/client";

export interface PrivacyPolicyData {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  dpoName?: string;
  dpoEmail?: string;
  websiteUrl: string;
  cookies?: Cookie[];
  scripts?: Script[];
}

/**
 * Generate a privacy policy based on website data
 */
export function generatePrivacyPolicy(data: PrivacyPolicyData): string {
  const hasCookies = data.cookies && data.cookies.length > 0;
  const hasAnalyticsCookies = data.cookies?.some(c => c.category === "analytics");
  const hasMarketingCookies = data.cookies?.some(c => c.category === "marketing");
  
  const trackingScripts = data.scripts?.filter(
    s => s.category === "analytics" || s.category === "marketing"
  ) || [];

  const templateData: TemplateData = {
    lastUpdated: formatPolicyDate(),
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyEmail: data.companyEmail,
    dpoName: data.dpoName || "",
    dpoEmail: data.dpoEmail || "",
    websiteUrl: data.websiteUrl,
    hasCookies: hasCookies,
    hasAnalyticsCookies: hasAnalyticsCookies,
    hasMarketingCookies: hasMarketingCookies,
    hasTrackingScripts: trackingScripts.length > 0,
    trackingScripts: trackingScripts.map(s => ({
      name: s.name || "Unknown Service",
      category: formatCategory(s.category || "unknown"),
    })),
  };

  return processTemplate(PRIVACY_POLICY_TEMPLATE, templateData);
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  const categories: Record<string, string> = {
    analytics: "Analytics and performance tracking",
    marketing: "Marketing and advertising",
    functional: "Functionality and preferences",
    social: "Social media integration",
    unknown: "Third-party service",
  };
  return categories[category] || category;
}

