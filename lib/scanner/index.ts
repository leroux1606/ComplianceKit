import puppeteer, { Browser, Page } from "puppeteer";
import type { ScanOptions, ScanResult, Finding } from "./types";
import { detectCookies } from "./cookie-detector";
import { detectScripts } from "./script-detector";
import { detectPrivacyPolicy } from "./policy-detector";
import { detectCookieBanner, analyzeBannerCompliance } from "./banner-detector";
import { detectUserRights, generateUserRightsFindings } from "./user-rights-detector";
import { analyzePrivacyPolicyContent, generatePrivacyPolicyFindings } from "./privacy-policy-analyzer";
import { analyzeConsentQuality, generateConsentQualityFindings } from "./consent-quality-analyzer";
import { runAdditionalComplianceChecks, generateAdditionalComplianceFindings } from "./additional-compliance-detector";
import { calculateComplianceScore } from "./compliance-score";

const DEFAULT_TIMEOUT = 60000; // 60 seconds
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Website Scanner - Scans websites for cookies, trackers, and compliance issues
 */
export class Scanner {
  private options: Required<ScanOptions>;

  constructor(options: ScanOptions) {
    this.options = {
      url: options.url,
      timeout: options.timeout || DEFAULT_TIMEOUT,
      waitForNetworkIdle: options.waitForNetworkIdle ?? true,
      userAgent: options.userAgent || DEFAULT_USER_AGENT,
    };
  }

  /**
   * Run the scan
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now();
    let browser: Browser | null = null;

    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920,1080",
        ],
      });

      const page = await browser.newPage();

      // Configure page
      await page.setUserAgent(this.options.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      // Set timeout
      page.setDefaultTimeout(this.options.timeout);
      page.setDefaultNavigationTimeout(this.options.timeout);

      // Navigate to URL
      await page.goto(this.options.url, {
        waitUntil: this.options.waitForNetworkIdle
          ? "networkidle2"
          : "domcontentloaded",
        timeout: this.options.timeout,
      });

      // Wait a bit for any delayed scripts/banners
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Run all detectors in parallel
      const [cookies, scripts, privacyPolicy, cookieBanner, userRights] = await Promise.all([
        detectCookies(page, this.options.url),
        detectScripts(page),
        detectPrivacyPolicy(page),
        detectCookieBanner(page),
        detectUserRights(page),
      ]);

      // Collect findings
      const findings: Finding[] = [];

      // Add privacy policy finding if not found
      if (!privacyPolicy.found && privacyPolicy.finding) {
        findings.push(privacyPolicy.finding);
      }

      // Add cookie banner finding if not found
      if (!cookieBanner.found && cookieBanner.finding) {
        findings.push(cookieBanner.finding);
      }

      // Analyze banner compliance if banner exists
      if (cookieBanner.found) {
        const bannerFindings = await analyzeBannerCompliance(page);
        findings.push(...bannerFindings);
      }

      // Check for third-party cookies
      const thirdPartyCookies = cookies.filter(
        (c) => c.category === "marketing" || c.category === "analytics"
      );
      if (thirdPartyCookies.length > 0 && !cookieBanner.found) {
        findings.push({
          type: "third_party_cookie",
          severity: "error",
          title: "Third-Party Cookies Without Consent",
          description: `Your website sets ${thirdPartyCookies.length} third-party/tracking cookies without obtaining user consent first.`,
          recommendation:
            "Implement a cookie consent mechanism that blocks these cookies until the user provides consent.",
        });
      }

      // Check for tracking scripts
      const trackingScripts = scripts.filter(
        (s) => s.category === "analytics" || s.category === "marketing"
      );
      if (trackingScripts.length > 0) {
        const scriptNames = [...new Set(trackingScripts.map((s) => s.name).filter(Boolean))];
        findings.push({
          type: "tracking_script",
          severity: "info",
          title: `${trackingScripts.length} Tracking Scripts Detected`,
          description: `Found tracking scripts: ${scriptNames.join(", ") || "Various trackers"}. These should be disclosed in your privacy policy.`,
          recommendation:
            "Ensure all tracking scripts are listed in your privacy policy and loaded only after user consent.",
        });
      }

      // Add user rights findings
      const userRightsFindings = generateUserRightsFindings(userRights);
      findings.push(...userRightsFindings);

      // Analyze privacy policy content if found
      let privacyPolicyScore: number | undefined;
      if (privacyPolicy.found && privacyPolicy.url) {
        const policyAnalysis = await analyzePrivacyPolicyContent(page, privacyPolicy.url);
        privacyPolicyScore = policyAnalysis.completenessScore;
        const policyFindings = generatePrivacyPolicyFindings(policyAnalysis, privacyPolicy.found);
        findings.push(...policyFindings);
      }

      // Analyze consent banner quality if found
      let consentQualityScore: number | undefined;
      if (cookieBanner.found) {
        const consentAnalysis = await analyzeConsentQuality(page, cookieBanner.found);
        consentQualityScore = consentAnalysis.qualityScore;
        const consentFindings = generateConsentQualityFindings(consentAnalysis, cookieBanner.found);
        findings.push(...consentFindings);
      }

      // Run additional compliance checks
      const additionalChecks = await runAdditionalComplianceChecks(page);
      const additionalFindings = generateAdditionalComplianceFindings(additionalChecks);
      findings.push(...additionalFindings);

      // Calculate compliance score
      const score = calculateComplianceScore({
        hasPrivacyPolicy: privacyPolicy.found,
        hasCookieBanner: cookieBanner.found,
        cookies,
        scripts,
        findings,
        userRights,
        privacyPolicyScore,
        consentQualityScore,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        url: this.options.url,
        cookies,
        scripts,
        findings,
        hasPrivacyPolicy: privacyPolicy.found,
        hasCookieBanner: cookieBanner.found,
        userRights,
        privacyPolicyScore,
        consentQualityScore,
        score,
        scannedAt: new Date(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        success: false,
        url: this.options.url,
        cookies: [],
        scripts: [],
        findings: [],
        hasPrivacyPolicy: false,
        hasCookieBanner: false,
        score: 0,
        error: errorMessage,
        scannedAt: new Date(),
        duration,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

/**
 * Quick scan function for simple use cases
 */
export async function scanWebsite(url: string): Promise<ScanResult> {
  const scanner = new Scanner({ url });
  return scanner.scan();
}

