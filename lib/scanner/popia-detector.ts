import type { Finding } from "./types";

/**
 * POPIA Compliance Checks
 * Protection of Personal Information Act 4 of 2013 (South Africa)
 * Effective 1 July 2021 — enforced by the Information Regulator (SA)
 *
 * POPIA has 8 Conditions for Lawful Processing (similar to GDPR principles):
 *   1. Accountability        4. Further Processing Limitation  7. Documentation
 *   2. Processing Limitation 5. Information Quality            8. Data Subject Participation
 *   3. Purpose Specification 6. Openness (transparency/policy)
 */

export interface PopiaChecks {
  // Condition 6 — Openness: privacy notice must be provided
  policyMentionsPopia: boolean;        // Policy references POPIA by name
  policyMentionsInfoRegulator: boolean; // Mentions the Information Regulator (SA)
  policyMentionsInformationOfficer: boolean; // Mentions Information Officer (POPIA §55)

  // Condition 8 — Data Subject Participation: rights must be disclosed
  policyListsDataSubjectRights: boolean; // Lists rights to access, correct, delete, object
  hasAccessRequestMechanism: boolean;   // Contact method for PAIA/POPIA access requests

  // Condition 2/3 — Limitation and Purpose: disclosures
  policyDescribesPurpose: boolean;      // Describes why personal info is collected
  policyDescribesThirdPartySharing: boolean; // Discloses third-party operators

  // Cross-border transfer (POPIA §72)
  policyAddressesCrossBorderTransfer: boolean;

  // General
  hasPrivacyPolicy: boolean;
  policyHasLastUpdated: boolean;
}

/**
 * Analyse privacy policy text for POPIA compliance.
 * Call this with the lowercased body text of the privacy policy page.
 */
export function analyzePopiaPolicyContent(policyText: string): Omit<
  PopiaChecks,
  "hasAccessRequestMechanism" | "hasPrivacyPolicy"
> {
  const text = policyText.toLowerCase();

  // Condition 6 — explicit POPIA references
  const policyMentionsPopia =
    /\bpopia\b/.test(text) ||
    /protection of personal information/.test(text) ||
    /act 4 of 2013/.test(text) ||
    /act no\.?\s*4 of 2013/.test(text);

  const policyMentionsInfoRegulator =
    /information regulator/.test(text) ||
    /inforegulator\.org\.za/.test(text) ||
    /inforeg\.org\.za/.test(text);

  const policyMentionsInformationOfficer =
    /information officer/.test(text) ||
    /deputy information officer/.test(text);

  // Condition 8 — data subject rights (right to access, correction, deletion, objection)
  const policyListsDataSubjectRights =
    (text.includes("access") || text.includes("right to access")) &&
    (text.includes("correction") || text.includes("rectif") || text.includes("right to correct")) &&
    (text.includes("deletion") || text.includes("erasure") || text.includes("right to delete") ||
     text.includes("right to be forgotten")) &&
    (text.includes("object") || text.includes("opt-out") || text.includes("right to object"));

  // Condition 3 — purpose must be specified
  const policyDescribesPurpose =
    /purpose(s)? (of|for) (collect|process|using)/.test(text) ||
    /we collect.*in order to/.test(text) ||
    /why we collect/.test(text) ||
    /for the (purpose|following purposes)/.test(text);

  // Condition 2 — third-party operators/sharing
  const policyDescribesThirdPartySharing =
    /third.?part(y|ies)/.test(text) &&
    (text.includes("share") || text.includes("disclose") || text.includes("transfer") ||
     text.includes("operator"));

  // POPIA §72 — cross-border transfers
  const policyAddressesCrossBorderTransfer =
    /cross.?border/.test(text) ||
    /transfer.*outside.*south africa/.test(text) ||
    /international transfer/.test(text) ||
    /outside (the )?south africa/.test(text) ||
    /third (country|countries)/.test(text);

  // Last updated date
  const policyHasLastUpdated =
    /last (updated|revised|modified)/.test(text) ||
    /effective date/.test(text) ||
    /updated\s*:/.test(text);

  return {
    policyMentionsPopia,
    policyMentionsInfoRegulator,
    policyMentionsInformationOfficer,
    policyListsDataSubjectRights,
    policyDescribesPurpose,
    policyDescribesThirdPartySharing,
    policyAddressesCrossBorderTransfer,
    policyHasLastUpdated,
  };
}

/**
 * Calculate POPIA compliance score (0–100).
 *
 * Weighting:
 *   hasPrivacyPolicy (required)          25 pts
 *   policyMentionsPopia                  20 pts — explicit POPIA reference
 *   policyListsDataSubjectRights         15 pts — Condition 8
 *   policyMentionsInfoRegulator          10 pts — Condition 6
 *   hasAccessRequestMechanism            10 pts — Condition 8
 *   policyDescribesPurpose                8 pts — Condition 3
 *   policyDescribesThirdPartySharing      7 pts — Condition 2
 *   policyMentionsInformationOfficer      3 pts — §55
 *   policyAddressesCrossBorderTransfer    2 pts — §72
 */
export function calculatePopiaScore(checks: PopiaChecks): number {
  if (!checks.hasPrivacyPolicy) return 0;

  let score = 25; // has a policy
  if (checks.policyMentionsPopia)            score += 20;
  if (checks.policyListsDataSubjectRights)   score += 15;
  if (checks.policyMentionsInfoRegulator)    score += 10;
  if (checks.hasAccessRequestMechanism)      score += 10;
  if (checks.policyDescribesPurpose)         score +=  8;
  if (checks.policyDescribesThirdPartySharing) score += 7;
  if (checks.policyMentionsInformationOfficer) score += 3;
  if (checks.policyAddressesCrossBorderTransfer) score += 2;

  return Math.min(100, score);
}

/**
 * Generate POPIA compliance findings.
 */
export function generatePopiaFindings(
  checks: PopiaChecks,
  hasTrackingScripts: boolean
): Finding[] {
  const findings: Finding[] = [];

  if (!checks.hasPrivacyPolicy) {
    // Already covered by the main privacy policy finding — skip duplicate
    return findings;
  }

  if (!checks.policyMentionsPopia) {
    findings.push({
      type: "popia_policy_reference",
      severity: "error",
      title: "Privacy Policy Does Not Reference POPIA",
      description:
        "Your privacy policy does not explicitly reference the Protection of Personal Information Act (POPIA). South African law requires operators to notify data subjects of the legal basis for processing their information.",
      recommendation:
        'Add a dedicated POPIA section to your privacy policy that references "Protection of Personal Information Act 4 of 2013 (POPIA)" and explains your basis for lawful processing under Condition 2.',
    });
  }

  if (!checks.policyMentionsInfoRegulator) {
    findings.push({
      type: "popia_information_regulator",
      severity: "warning",
      title: "Privacy Policy Missing Information Regulator Reference",
      description:
        "Your privacy policy does not reference the Information Regulator of South Africa. Data subjects have the right to lodge complaints with the Regulator.",
      recommendation:
        "Add a reference to the Information Regulator: website inforeg.org.za, complaints email inforeg@justice.gov.za.",
    });
  }

  if (!checks.policyListsDataSubjectRights) {
    findings.push({
      type: "popia_data_subject_rights",
      severity: "error",
      title: "Privacy Policy Does Not List POPIA Data Subject Rights",
      description:
        "Your privacy policy does not clearly list all data subject rights under POPIA Condition 8: right to access, correction, deletion, and objection to processing.",
      recommendation:
        "Add a 'Your Rights Under POPIA' section listing: (1) Right to access your personal information, (2) Right to correction or deletion, (3) Right to object to processing, (4) Right to lodge a complaint with the Information Regulator.",
    });
  }

  if (!checks.hasAccessRequestMechanism) {
    findings.push({
      type: "popia_access_request",
      severity: "warning",
      title: "No Clear POPIA Access Request Mechanism",
      description:
        "There is no clearly visible way for data subjects to submit a POPIA access or correction request. POPIA Condition 8 requires operators to facilitate such requests.",
      recommendation:
        "Provide a dedicated email address or form for POPIA/PAIA requests, referenced in your privacy policy and ideally also linked in your site footer.",
    });
  }

  if (hasTrackingScripts && !checks.policyDescribesThirdPartySharing) {
    findings.push({
      type: "popia_third_party_operators",
      severity: "warning",
      title: "Third-Party Data Sharing Not Disclosed (POPIA Condition 2)",
      description:
        "Your site uses third-party tracking scripts but your privacy policy does not clearly disclose sharing personal information with third-party operators.",
      recommendation:
        "Add a section listing each third-party service that processes personal data (analytics, advertising, etc.), what data they receive, and their own privacy policies.",
    });
  }

  return findings;
}
