import type { Page } from "puppeteer";
import type { DetectedScript, ScriptCategory } from "./types";
import { TRACKER_PATTERNS } from "./types";

/**
 * Detect and categorize scripts from a Puppeteer page
 */
export async function detectScripts(page: Page): Promise<DetectedScript[]> {
  const scripts: DetectedScript[] = [];

  // Get all script elements
  const scriptElements = await page.$$eval("script", (elements) => {
    return elements.map((el) => ({
      src: el.src || null,
      content: el.src ? null : el.textContent?.slice(0, 1000) || null, // Limit inline content
      type: el.src ? "external" : "inline",
    }));
  });

  for (const script of scriptElements) {
    if (script.src) {
      // External script
      const { name, category } = identifyTracker(script.src);
      scripts.push({
        url: script.src,
        type: "external",
        category,
        name,
      });
    } else if (script.content) {
      // Inline script - check for tracker patterns
      const { name, category } = identifyInlineTracker(script.content);
      if (category !== "unknown") {
        scripts.push({
          content: script.content,
          type: "inline",
          category,
          name,
        });
      }
    }
  }

  // Also check for tracking pixels (img tags with tracking URLs)
  const trackingPixels = await page.$$eval("img", (elements) => {
    return elements
      .filter((el) => el.width <= 3 && el.height <= 3)
      .map((el) => el.src)
      .filter((src) => src && src.startsWith("http"));
  });

  for (const pixelUrl of trackingPixels) {
    const { name, category } = identifyTracker(pixelUrl);
    if (category !== "unknown") {
      scripts.push({
        url: pixelUrl,
        type: "external",
        category,
        name: name ? `${name} (Pixel)` : "Tracking Pixel",
      });
    }
  }

  return scripts;
}

/**
 * Identify a tracker from its URL
 */
function identifyTracker(url: string): { name?: string; category: ScriptCategory } {
  const lowerUrl = url.toLowerCase();

  for (const [pattern, info] of Object.entries(TRACKER_PATTERNS)) {
    if (lowerUrl.includes(pattern.toLowerCase())) {
      return info;
    }
  }

  // Check for common CDN patterns that might indicate tracking
  if (lowerUrl.includes("cdn") && (
    lowerUrl.includes("analytics") ||
    lowerUrl.includes("tracking") ||
    lowerUrl.includes("pixel")
  )) {
    return { category: "analytics" };
  }

  return { category: "unknown" };
}

/**
 * Identify trackers in inline scripts
 */
function identifyInlineTracker(content: string): { name?: string; category: ScriptCategory } {
  const lowerContent = content.toLowerCase();

  // Google Analytics patterns
  if (
    lowerContent.includes("gtag(") ||
    lowerContent.includes("ga(") ||
    lowerContent.includes("google-analytics") ||
    lowerContent.includes("ua-") // Universal Analytics ID
  ) {
    return { name: "Google Analytics", category: "analytics" };
  }

  // Google Tag Manager
  if (lowerContent.includes("gtm.js") || lowerContent.includes("googletagmanager")) {
    return { name: "Google Tag Manager", category: "analytics" };
  }

  // Facebook Pixel
  if (
    lowerContent.includes("fbq(") ||
    lowerContent.includes("facebook") && lowerContent.includes("pixel")
  ) {
    return { name: "Facebook Pixel", category: "marketing" };
  }

  // Hotjar
  if (lowerContent.includes("hotjar") || lowerContent.includes("_hjSettings")) {
    return { name: "Hotjar", category: "analytics" };
  }

  // Microsoft Clarity
  if (lowerContent.includes("clarity.ms") || lowerContent.includes("clarity(")) {
    return { name: "Microsoft Clarity", category: "analytics" };
  }

  // Mixpanel
  if (lowerContent.includes("mixpanel")) {
    return { name: "Mixpanel", category: "analytics" };
  }

  // Segment
  if (lowerContent.includes("segment") && lowerContent.includes("analytics")) {
    return { name: "Segment", category: "analytics" };
  }

  // Intercom
  if (lowerContent.includes("intercom")) {
    return { name: "Intercom", category: "marketing" };
  }

  // HubSpot
  if (lowerContent.includes("hubspot") || lowerContent.includes("hs-scripts")) {
    return { name: "HubSpot", category: "marketing" };
  }

  return { category: "unknown" };
}

/**
 * Get script statistics
 */
export function getScriptStats(scripts: DetectedScript[]) {
  const stats = {
    total: scripts.length,
    analytics: 0,
    marketing: 0,
    functional: 0,
    social: 0,
    unknown: 0,
    external: 0,
    inline: 0,
  };

  for (const script of scripts) {
    // Category counts
    switch (script.category) {
      case "analytics":
        stats.analytics++;
        break;
      case "marketing":
        stats.marketing++;
        break;
      case "functional":
        stats.functional++;
        break;
      case "social":
        stats.social++;
        break;
      default:
        stats.unknown++;
    }

    // Type counts
    if (script.type === "external") {
      stats.external++;
    } else {
      stats.inline++;
    }
  }

  return stats;
}



