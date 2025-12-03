// Scanner Types

export interface ScanOptions {
  url: string;
  timeout?: number;
  waitForNetworkIdle?: boolean;
  userAgent?: string;
}

export interface DetectedCookie {
  name: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
  expires?: Date;
  category?: CookieCategory;
  description?: string;
}

export type CookieCategory = "necessary" | "analytics" | "marketing" | "functional" | "unknown";

export interface DetectedScript {
  url?: string;
  content?: string;
  type: "inline" | "external";
  category?: ScriptCategory;
  name?: string;
}

export type ScriptCategory = "analytics" | "marketing" | "functional" | "social" | "unknown";

export interface Finding {
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  recommendation?: string;
}

export type FindingType = 
  | "cookie_banner"
  | "privacy_policy"
  | "tracking_script"
  | "third_party_cookie"
  | "secure_cookie"
  | "consent_management";

export type FindingSeverity = "info" | "warning" | "error";

export interface ScanResult {
  success: boolean;
  url: string;
  cookies: DetectedCookie[];
  scripts: DetectedScript[];
  findings: Finding[];
  hasPrivacyPolicy: boolean;
  hasCookieBanner: boolean;
  score: number;
  error?: string;
  scannedAt: Date;
  duration: number;
}

// Known tracker patterns
export const TRACKER_PATTERNS: Record<string, { name: string; category: ScriptCategory }> = {
  // Google
  "google-analytics.com": { name: "Google Analytics", category: "analytics" },
  "googletagmanager.com": { name: "Google Tag Manager", category: "analytics" },
  "gtag": { name: "Google Analytics (gtag)", category: "analytics" },
  "ga.js": { name: "Google Analytics (legacy)", category: "analytics" },
  "analytics.js": { name: "Google Analytics", category: "analytics" },
  "googlesyndication.com": { name: "Google AdSense", category: "marketing" },
  "googleadservices.com": { name: "Google Ads", category: "marketing" },
  "doubleclick.net": { name: "DoubleClick", category: "marketing" },
  
  // Facebook
  "facebook.net": { name: "Facebook SDK", category: "social" },
  "facebook.com/tr": { name: "Facebook Pixel", category: "marketing" },
  "fbevents.js": { name: "Facebook Pixel", category: "marketing" },
  "connect.facebook.net": { name: "Facebook Connect", category: "social" },
  
  // Microsoft
  "clarity.ms": { name: "Microsoft Clarity", category: "analytics" },
  "bing.com": { name: "Bing Ads", category: "marketing" },
  
  // Analytics
  "hotjar.com": { name: "Hotjar", category: "analytics" },
  "mixpanel.com": { name: "Mixpanel", category: "analytics" },
  "segment.com": { name: "Segment", category: "analytics" },
  "amplitude.com": { name: "Amplitude", category: "analytics" },
  "heap.io": { name: "Heap Analytics", category: "analytics" },
  "fullstory.com": { name: "FullStory", category: "analytics" },
  "mouseflow.com": { name: "Mouseflow", category: "analytics" },
  "crazyegg.com": { name: "Crazy Egg", category: "analytics" },
  "plausible.io": { name: "Plausible Analytics", category: "analytics" },
  "matomo": { name: "Matomo", category: "analytics" },
  
  // Marketing
  "hubspot.com": { name: "HubSpot", category: "marketing" },
  "marketo.com": { name: "Marketo", category: "marketing" },
  "pardot.com": { name: "Pardot", category: "marketing" },
  "mailchimp.com": { name: "Mailchimp", category: "marketing" },
  "intercom.io": { name: "Intercom", category: "marketing" },
  "drift.com": { name: "Drift", category: "marketing" },
  "crisp.chat": { name: "Crisp", category: "functional" },
  "tawk.to": { name: "Tawk.to", category: "functional" },
  "zendesk.com": { name: "Zendesk", category: "functional" },
  
  // Social
  "twitter.com/widgets": { name: "Twitter Widgets", category: "social" },
  "platform.twitter.com": { name: "Twitter Platform", category: "social" },
  "linkedin.com": { name: "LinkedIn", category: "social" },
  "pinterest.com": { name: "Pinterest", category: "social" },
  
  // Advertising
  "adroll.com": { name: "AdRoll", category: "marketing" },
  "criteo.com": { name: "Criteo", category: "marketing" },
  "taboola.com": { name: "Taboola", category: "marketing" },
  "outbrain.com": { name: "Outbrain", category: "marketing" },
};

// Cookie categorization patterns
export const COOKIE_PATTERNS: Record<string, { category: CookieCategory; description: string }> = {
  // Necessary cookies
  "session": { category: "necessary", description: "Session management" },
  "csrf": { category: "necessary", description: "Security token" },
  "xsrf": { category: "necessary", description: "Security token" },
  "auth": { category: "necessary", description: "Authentication" },
  "token": { category: "necessary", description: "Authentication token" },
  "login": { category: "necessary", description: "Login state" },
  "consent": { category: "necessary", description: "Cookie consent preferences" },
  "gdpr": { category: "necessary", description: "GDPR consent" },
  "cookieconsent": { category: "necessary", description: "Cookie consent preferences" },
  
  // Analytics cookies
  "_ga": { category: "analytics", description: "Google Analytics user identifier" },
  "_gid": { category: "analytics", description: "Google Analytics session identifier" },
  "_gat": { category: "analytics", description: "Google Analytics throttling" },
  "__utma": { category: "analytics", description: "Google Analytics (legacy)" },
  "__utmb": { category: "analytics", description: "Google Analytics (legacy)" },
  "__utmc": { category: "analytics", description: "Google Analytics (legacy)" },
  "__utmz": { category: "analytics", description: "Google Analytics (legacy)" },
  "_hjid": { category: "analytics", description: "Hotjar user identifier" },
  "_hjSessionUser": { category: "analytics", description: "Hotjar session" },
  "mp_": { category: "analytics", description: "Mixpanel tracking" },
  "ajs_": { category: "analytics", description: "Segment analytics" },
  "_clck": { category: "analytics", description: "Microsoft Clarity" },
  "_clsk": { category: "analytics", description: "Microsoft Clarity session" },
  
  // Marketing cookies
  "_fbp": { category: "marketing", description: "Facebook Pixel" },
  "_fbc": { category: "marketing", description: "Facebook click identifier" },
  "fr": { category: "marketing", description: "Facebook advertising" },
  "_gcl_au": { category: "marketing", description: "Google Ads conversion" },
  "IDE": { category: "marketing", description: "DoubleClick advertising" },
  "NID": { category: "marketing", description: "Google advertising preferences" },
  "_uetsid": { category: "marketing", description: "Bing Ads" },
  "_uetvid": { category: "marketing", description: "Bing Ads visitor" },
  "hubspotutk": { category: "marketing", description: "HubSpot tracking" },
  
  // Functional cookies
  "lang": { category: "functional", description: "Language preference" },
  "locale": { category: "functional", description: "Locale preference" },
  "timezone": { category: "functional", description: "Timezone preference" },
  "theme": { category: "functional", description: "Theme preference" },
  "preferences": { category: "functional", description: "User preferences" },
};



