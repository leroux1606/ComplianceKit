/**
 * Static demo scan data for "Demo Store".
 * Used on the public /demo marketing page and the dashboard empty-state preview.
 * No DB queries — purely static.
 */

export const DEMO_SITE_NAME = "Demo Store";
export const DEMO_SITE_URL = "demostore.example.com";
export const DEMO_SCORE = 42;
export const DEMO_SCAN_DATE = new Date("2026-03-07T09:00:00Z");

export type DemoFinding = {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string | null;
};

export type DemoCookie = {
  id: string;
  name: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  expires: Date | null;
  category: string | null;
  description: string | null;
};

export type DemoScript = {
  id: string;
  url: string | null;
  content: string | null;
  type: string;
  category: string | null;
  name: string | null;
};

export const DEMO_FINDINGS: DemoFinding[] = [
  {
    id: "demo-f1",
    type: "cookie_banner",
    severity: "error",
    title: "No cookie consent banner detected",
    description:
      "Your website does not display a cookie consent banner before placing tracking cookies. All visitors are being tracked without their knowledge or consent.",
    recommendation:
      "Install a consent banner that lets visitors accept or decline non-essential cookies before they are set. ComplianceKit's widget handles this automatically.",
  },
  {
    id: "demo-f2",
    type: "privacy_policy",
    severity: "error",
    title: "No privacy policy page found",
    description:
      "No privacy policy was detected on this website. GDPR Articles 13–14 require you to inform visitors what data you collect, why, and who you share it with.",
    recommendation:
      "Generate a privacy policy using ComplianceKit's policy generator and link to it from your website footer.",
  },
  {
    id: "demo-f3",
    type: "tracking_script",
    severity: "warning",
    title: "Marketing trackers running without consent",
    description:
      "Google Analytics 4 and Facebook Pixel are loading on page load, before any user consent is obtained. These scripts can track visitors across multiple websites.",
    recommendation:
      "Configure Google Consent Mode v2 so these scripts only fire after a visitor grants consent. ComplianceKit handles this automatically.",
  },
  {
    id: "demo-f4",
    type: "third_party_cookie",
    severity: "warning",
    title: "Third-party advertising cookies detected",
    description:
      "Facebook's _fbp cookie and Google's IDE cookie are being set by advertising networks, building profiles of your visitors without their consent.",
    recommendation:
      "Block these cookies until marketing consent is granted. Configure your consent banner to block third-party marketing cookies by default.",
  },
  {
    id: "demo-f5",
    type: "secure_cookie",
    severity: "info",
    title: "2 cookies missing the Secure flag",
    description:
      "Two cookies lack the Secure attribute and could be transmitted over unencrypted HTTP connections.",
    recommendation:
      "Set the Secure flag on all cookies. Ensure your server sets cookies with Secure=true.",
  },
];

export const DEMO_COOKIES: DemoCookie[] = [
  {
    id: "demo-c1",
    name: "PHPSESSID",
    domain: "demostore.example.com",
    path: "/",
    secure: false,
    httpOnly: true,
    sameSite: "Lax",
    expires: null,
    category: "necessary",
    description: "PHP session identifier — keeps you logged in",
  },
  {
    id: "demo-c2",
    name: "cart_session",
    domain: "demostore.example.com",
    path: "/",
    secure: false,
    httpOnly: false,
    sameSite: "Lax",
    expires: null,
    category: "necessary",
    description: "Shopping cart contents",
  },
  {
    id: "demo-c3",
    name: "_ga",
    domain: ".demostore.example.com",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
    expires: new Date("2028-03-07T09:00:00Z"),
    category: "analytics",
    description: "Google Analytics — distinguishes unique users",
  },
  {
    id: "demo-c4",
    name: "_ga_XXXXXXXXXX",
    domain: ".demostore.example.com",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
    expires: new Date("2028-03-07T09:00:00Z"),
    category: "analytics",
    description: "Google Analytics 4 — session persistence",
  },
  {
    id: "demo-c5",
    name: "_hjid",
    domain: ".demostore.example.com",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
    expires: new Date("2027-03-07T09:00:00Z"),
    category: "analytics",
    description: "Hotjar — unique visitor ID for heatmaps and session recordings",
  },
  {
    id: "demo-c6",
    name: "_fbp",
    domain: ".demostore.example.com",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
    expires: new Date("2026-06-07T09:00:00Z"),
    category: "marketing",
    description: "Facebook Pixel — tracks visits for ad targeting",
  },
  {
    id: "demo-c7",
    name: "IDE",
    domain: ".doubleclick.net",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "None",
    expires: new Date("2026-09-07T09:00:00Z"),
    category: "marketing",
    description: "Google DoubleClick — used for targeted advertising",
  },
  {
    id: "demo-c8",
    name: "_gcl_au",
    domain: ".demostore.example.com",
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
    expires: new Date("2026-06-07T09:00:00Z"),
    category: "marketing",
    description: "Google Ads — conversion linker cookie",
  },
];

export const DEMO_SCRIPTS: DemoScript[] = [
  {
    id: "demo-s1",
    url: "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX",
    content: null,
    type: "external",
    category: "analytics",
    name: "Google Analytics 4",
  },
  {
    id: "demo-s2",
    url: "https://connect.facebook.net/en_US/fbevents.js",
    content: null,
    type: "external",
    category: "marketing",
    name: "Facebook Pixel",
  },
  {
    id: "demo-s3",
    url: "https://static.hotjar.com/c/hotjar-XXXXXXXX.js",
    content: null,
    type: "external",
    category: "analytics",
    name: "Hotjar",
  },
];
