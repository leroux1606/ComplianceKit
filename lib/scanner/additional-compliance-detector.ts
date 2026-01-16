import { Page } from "puppeteer";
import type { Finding } from "./types";

/**
 * Additional GDPR Compliance Checks
 * Articles 8, 9, 22
 */

export interface AdditionalComplianceChecks {
  // Article 8: Children's data
  hasAgeVerification: boolean;
  hasParentalConsent: boolean;

  // Article 9: Special category data
  processesSensitiveData: boolean;
  hasExplicitConsent: boolean;

  // Article 22: Automated decision-making
  hasAutomatedDecisions: boolean;
  disclosesAutomation: boolean;

  // Article 6: Legal basis
  hasLegalBasisStatement: boolean;
}

/**
 * Detect age verification and parental consent mechanisms
 */
export async function detectAgeVerification(page: Page): Promise<{
  hasAgeVerification: boolean;
  hasParentalConsent: boolean;
}> {
  try {
    const pageText = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase() || "";
    });

    const forms = await page.$$eval("form, input", (elements) => {
      const formData: Array<{ type: string; name: string; label: string }> = [];

      elements.forEach((el) => {
        if (el.tagName === "INPUT") {
          const input = el as HTMLInputElement;
          formData.push({
            type: input.type,
            name: input.name || input.id || "",
            label: input.placeholder || input.getAttribute("aria-label") || "",
          });
        }
      });

      return formData;
    });

    // Check for age verification
    const agePatterns = [
      /age\s*verification/i,
      /verify.*age/i,
      /confirm.*age/i,
      /18\+/i,
      /over\s*18/i,
      /13\+/i,
      /minimum\s*age/i,
      /date\s*of\s*birth/i,
      /dob/i,
      /birthday/i,
    ];

    const hasAgeVerification =
      agePatterns.some((pattern) => pattern.test(pageText)) ||
      forms.some((f) =>
        ["date", "number"].includes(f.type) &&
        (f.name.includes("age") || f.name.includes("birth") || f.label.includes("age"))
      );

    // Check for parental consent
    const parentalPatterns = [
      /parental\s*consent/i,
      /parent.*permission/i,
      /guardian.*consent/i,
      /parent.*approval/i,
    ];

    const hasParentalConsent = parentalPatterns.some((pattern) => pattern.test(pageText));

    return {
      hasAgeVerification,
      hasParentalConsent,
    };
  } catch (error) {
    console.error("Age verification detection error:", error);
    return {
      hasAgeVerification: false,
      hasParentalConsent: false,
    };
  }
}

/**
 * Detect processing of special category data (Article 9)
 */
export async function detectSensitiveDataProcessing(page: Page): Promise<{
  processesSensitiveData: boolean;
  hasExplicitConsent: boolean;
  categories: string[];
}> {
  try {
    const pageText = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase() || "";
    });

    // Article 9 special categories of data
    const sensitiveDataPatterns = {
      health: [/health\s*data/i, /medical/i, /fitness/i, /wellness/i, /disease/i],
      biometric: [/biometric/i, /fingerprint/i, /facial\s*recognition/i, /face\s*id/i],
      genetic: [/genetic/i, /DNA/i, /genomic/i],
      racial: [/race/i, /ethnicity/i, /ethnic\s*origin/i],
      political: [/political\s*opinion/i, /political\s*view/i],
      religious: [/religious\s*belief/i, /religion/i, /faith/i],
      philosophical: [/philosophical\s*belief/i],
      union: [/trade\s*union/i, /union\s*membership/i],
      sexual: [/sexual\s*orientation/i, /gender\s*identity/i],
    };

    const foundCategories: string[] = [];
    let processesSensitiveData = false;

    for (const [category, patterns] of Object.entries(sensitiveDataPatterns)) {
      if (patterns.some((pattern) => pattern.test(pageText))) {
        foundCategories.push(category);
        processesSensitiveData = true;
      }
    }

    // Check for explicit consent
    const explicitConsentPatterns = [
      /explicit\s*consent/i,
      /special\s*category/i,
      /sensitive\s*data/i,
      /sensitive\s*personal/i,
    ];

    const hasExplicitConsent = explicitConsentPatterns.some((pattern) => pattern.test(pageText));

    return {
      processesSensitiveData,
      hasExplicitConsent,
      categories: foundCategories,
    };
  } catch (error) {
    console.error("Sensitive data detection error:", error);
    return {
      processesSensitiveData: false,
      hasExplicitConsent: false,
      categories: [],
    };
  }
}

/**
 * Detect automated decision-making and profiling (Article 22)
 */
export async function detectAutomatedDecisions(page: Page): Promise<{
  hasAutomatedDecisions: boolean;
  disclosesAutomation: boolean;
}> {
  try {
    const pageText = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase() || "";
    });

    // Check for mentions of automated decisions
    const automationPatterns = [
      /automated\s*decision/i,
      /algorithmic\s*decision/i,
      /profiling/i,
      /machine\s*learning/i,
      /AI\s*decision/i,
      /artificial\s*intelligence/i,
      /credit\s*scoring/i,
      /risk\s*assessment/i,
      /recommendation\s*engine/i,
      /personalization/i,
      /automated\s*processing/i,
    ];

    const hasAutomatedDecisions = automationPatterns.some((pattern) => pattern.test(pageText));

    // Check if automation is disclosed
    const disclosurePatterns = [
      /automated\s*decision.*article\s*22/i,
      /right.*not.*subject.*automated/i,
      /solely.*automated/i,
      /human\s*review/i,
      /human\s*intervention/i,
    ];

    const disclosesAutomation = disclosurePatterns.some((pattern) => pattern.test(pageText));

    return {
      hasAutomatedDecisions,
      disclosesAutomation,
    };
  } catch (error) {
    console.error("Automated decision detection error:", error);
    return {
      hasAutomatedDecisions: false,
      disclosesAutomation: false,
    };
  }
}

/**
 * Detect legal basis statement (Article 6)
 */
export async function detectLegalBasis(page: Page): Promise<boolean> {
  try {
    const pageText = await page.evaluate(() => {
      return document.body.textContent?.toLowerCase() || "";
    });

    const legalBasisPatterns = [
      /legal\s*basis/i,
      /lawful\s*basis/i,
      /article\s*6/i,
      /legitimate\s*interest/i,
      /contractual\s*necessity/i,
      /legal\s*obligation/i,
      /vital\s*interest/i,
      /public\s*task/i,
    ];

    return legalBasisPatterns.some((pattern) => pattern.test(pageText));
  } catch (error) {
    console.error("Legal basis detection error:", error);
    return false;
  }
}

/**
 * Run all additional compliance checks
 */
export async function runAdditionalComplianceChecks(page: Page): Promise<AdditionalComplianceChecks> {
  const [ageVerification, sensitiveData, automatedDecisions, hasLegalBasis] = await Promise.all([
    detectAgeVerification(page),
    detectSensitiveDataProcessing(page),
    detectAutomatedDecisions(page),
    detectLegalBasis(page),
  ]);

  return {
    hasAgeVerification: ageVerification.hasAgeVerification,
    hasParentalConsent: ageVerification.hasParentalConsent,
    processesSensitiveData: sensitiveData.processesSensitiveData,
    hasExplicitConsent: sensitiveData.hasExplicitConsent,
    hasAutomatedDecisions: automatedDecisions.hasAutomatedDecisions,
    disclosesAutomation: automatedDecisions.disclosesAutomation,
    hasLegalBasisStatement: hasLegalBasis,
  };
}

/**
 * Generate findings for additional compliance issues
 */
export function generateAdditionalComplianceFindings(
  checks: AdditionalComplianceChecks,
  sensitiveDataCategories?: string[]
): Finding[] {
  const findings: Finding[] = [];

  // Article 8: Children's data
  // Note: Age verification is context-dependent, so we provide info rather than error
  if (!checks.hasAgeVerification) {
    findings.push({
      type: "consent_management",
      severity: "info",
      title: "No Age Verification Detected (Article 8)",
      description:
        "We did not detect age verification on your website. If your service is directed at children or collects data from children under 16 (or 13 in some countries), GDPR Article 8 requires age verification and parental consent.",
      recommendation:
        "If your service targets children or may be used by minors, implement age verification and obtain parental consent for users under the age of digital consent (16 in most EU countries, 13-16 depending on national law).",
    });
  }

  // Article 9: Special category data
  if (checks.processesSensitiveData && !checks.hasExplicitConsent) {
    findings.push({
      type: "consent_management",
      severity: "error",
      title: "Sensitive Data Without Explicit Consent (Article 9)",
      description: `Your website appears to process special categories of personal data (${sensitiveDataCategories?.join(", ") || "sensitive data"}) without obtaining explicit consent. GDPR Article 9 prohibits processing of sensitive data unless explicit consent is obtained or another legal exception applies.`,
      recommendation:
        "If you process special category data (health, biometric, genetic, racial/ethnic origin, political opinions, religious beliefs, trade union membership, sexual orientation), you must obtain explicit consent or ensure you have another valid legal basis under Article 9(2). Update your privacy policy and consent mechanisms accordingly.",
    });
  }

  // Article 22: Automated decision-making
  if (checks.hasAutomatedDecisions && !checks.disclosesAutomation) {
    findings.push({
      type: "consent_management",
      severity: "warning",
      title: "Automated Decisions Not Disclosed (Article 22)",
      description:
        "Your website appears to use automated decision-making or profiling but does not clearly disclose this to users. GDPR Article 22 grants users the right not to be subject to solely automated decisions with legal or significant effects, and requires disclosure of such processing.",
      recommendation:
        "In your privacy policy, disclose: (1) The existence of automated decision-making or profiling, (2) Meaningful information about the logic involved, (3) The significance and consequences for users, and (4) Users' right to human intervention and to contest automated decisions.",
    });
  }

  // Article 6: Legal basis
  if (!checks.hasLegalBasisStatement) {
    findings.push({
      type: "privacy_policy",
      severity: "warning",
      title: "No Legal Basis Disclosed (Article 6)",
      description:
        "Your website does not clearly state the legal basis for processing personal data. GDPR Article 6 requires organizations to identify whether they process data based on consent, contract, legal obligation, vital interests, public task, or legitimate interests.",
      recommendation:
        "Add a clear statement to your privacy policy explaining the legal basis for each type of data processing. For example: 'We process your email address based on contractual necessity (Article 6(1)(b)) to provide you with our services.'",
    });
  }

  return findings;
}
