import { Page } from "puppeteer";
import type { Finding } from "./types";

/**
 * Privacy Policy Content Analysis
 * Analyzes privacy policy content for GDPR Articles 13-14 requirements
 */

interface PrivacyPolicyAnalysis {
  hasControllerIdentity: boolean;
  hasDpoContact: boolean;
  hasProcessingPurposes: boolean;
  hasLegalBasis: boolean;
  hasDataCategories: boolean;
  hasRetentionPeriods: boolean;
  hasDataRecipients: boolean;
  hasInternationalTransfers: boolean;
  hasUserRights: boolean;
  hasComplaintRight: boolean;
  hasDataSource: boolean;
  hasAutomatedDecisions: boolean;
  completenessScore: number; // 0-100
}

/**
 * Patterns to detect required privacy policy elements (multi-language)
 */
const REQUIRED_ELEMENTS = {
  controllerIdentity: [
    // English
    /controller/i, /data\s*controller/i, /company\s*name/i,
    /contact\s*information/i, /registered\s*office/i,
    // German
    /verantwortlich/i, /datenverantwortlich/i, /firmenname/i,
    /kontaktinformationen/i, /eingetragener.*sitz/i,
    // French
    /responsable/i, /responsable.*du.*traitement/i, /nom.*de.*la.*société/i,
    /coordonnées/i, /siège.*social/i,
    // Spanish
    /responsable/i, /responsable.*del.*tratamiento/i, /nombre.*de.*la.*empresa/i,
    /información.*de.*contacto/i, /domicilio.*social/i,
    // Dutch
    /verwerkingsverantwoordelijke/i, /bedrijfsnaam/i,
    /contactgegevens/i, /geregistreerd.*kantoor/i,
  ],
  dpoContact: [
    // English
    /data\s*protection\s*officer/i, /dpo/i, /privacy\s*officer/i,
    /dpo@/i, /privacy@/i,
    // German
    /datenschutzbeauftragter/i, /dsb/i, /datenschutzbeauftragte/i,
    /dsb@/i, /datenschutz@/i,
    // French
    /délégué.*à.*la.*protection.*des.*données/i, /dpd/i, /dpo/i,
    /dpd@/i, /confidentialite@/i,
    // Spanish
    /delegado.*de.*protección.*de.*datos/i, /dpd/i, /dpo/i,
    /dpd@/i, /privacidad@/i,
    // Dutch
    /functionaris.*gegevensbescherming/i, /fg/i, /dpo/i,
    /fg@/i, /privacy@/i,
  ],
  processingPurposes: [
    // English
    /purpose/i, /why\s*we\s*collect/i, /how\s*we\s*use/i, /processing\s*purposes/i,
    // German
    /zweck/i, /verarbeitungszweck/i, /warum.*wir.*erheben/i, /wie.*wir.*verwenden/i,
    // French
    /finalité/i, /objectif/i, /pourquoi.*nous.*collectons/i, /comment.*nous.*utilisons/i,
    // Spanish
    /finalidad/i, /propósito/i, /por.*qué.*recopilamos/i, /cómo.*usamos/i,
    // Dutch
    /doel/i, /verwerkingsdoel/i, /waarom.*we.*verzamelen/i, /hoe.*we.*gebruiken/i,
  ],
  legalBasis: [
    // English
    /legal\s*basis/i, /lawful\s*basis/i, /consent/i, /legitimate\s*interest/i,
    /contractual\s*necessity/i, /legal\s*obligation/i, /article\s*6/i,
    // German
    /rechtsgrundlage/i, /einwilligung/i, /berechtigtes.*interesse/i,
    /vertragserfüllung/i, /rechtliche.*verpflichtung/i, /artikel\s*6/i,
    // French
    /base.*légale/i, /fondement.*juridique/i, /consentement/i, /intérêt.*légitime/i,
    /nécessité.*contractuelle/i, /obligation.*légale/i, /article\s*6/i,
    // Spanish
    /base.*legal/i, /fundamento.*jurídico/i, /consentimiento/i, /interés.*legítimo/i,
    /necesidad.*contractual/i, /obligación.*legal/i, /artículo\s*6/i,
    // Dutch
    /rechtsgrond/i, /toestemming/i, /gerechtvaardigd.*belang/i,
    /contractuele.*noodzaak/i, /wettelijke.*verplichting/i, /artikel\s*6/i,
  ],
  dataCategories: [
    // English
    /personal\s*data/i, /information\s*we\s*collect/i, /data\s*categories/i, /types\s*of\s*data/i,
    // German
    /personenbezogene.*daten/i, /informationen.*die.*wir.*erheben/i,
    /datenkategorien/i, /arten.*von.*daten/i,
    // French
    /données.*personnelles/i, /informations.*que.*nous.*collectons/i,
    /catégories.*de.*données/i, /types.*de.*données/i,
    // Spanish
    /datos.*personales/i, /información.*que.*recopilamos/i,
    /categorías.*de.*datos/i, /tipos.*de.*datos/i,
    // Dutch
    /persoonsgegevens/i, /informatie.*die.*we.*verzamelen/i,
    /gegevenscategorieën/i, /soorten.*gegevens/i,
  ],
  retentionPeriods: [
    // English
    /retention/i, /how\s*long/i, /storage\s*period/i, /keep\s*your\s*data/i, /delete.*data/i,
    // German
    /aufbewahrung/i, /speicherdauer/i, /wie\s*lange/i, /daten.*aufbewahren/i, /daten.*löschen/i,
    // French
    /conservation/i, /durée.*de.*conservation/i, /combien.*de.*temps/i,
    /conserver.*données/i, /supprimer.*données/i,
    // Spanish
    /conservación/i, /período.*de.*retención/i, /cuánto.*tiempo/i,
    /conservar.*datos/i, /eliminar.*datos/i,
    // Dutch
    /bewaring/i, /bewaartermijn/i, /hoe.*lang/i, /gegevens.*bewaren/i, /gegevens.*verwijderen/i,
  ],
  dataRecipients: [
    // English
    /third.*part/i, /recipient/i, /share.*with/i, /disclose.*to/i, /service\s*provider/i,
    // German
    /dritte/i, /empfänger/i, /teilen.*mit/i, /weitergabe/i, /dienstleister/i,
    // French
    /tiers/i, /destinataire/i, /partager.*avec/i, /divulguer/i, /prestataire/i,
    // Spanish
    /tercero/i, /destinatario/i, /compartir.*con/i, /divulgar/i, /proveedor.*de.*servicio/i,
    // Dutch
    /derde/i, /ontvanger/i, /delen.*met/i, /verstrekken/i, /dienstverlener/i,
  ],
  internationalTransfers: [
    // English
    /international\s*transfer/i, /outside.*EEA/i, /outside.*EU/i, /cross.*border/i,
    /adequacy\s*decision/i, /standard\s*contractual\s*clauses/i, /SCC/i,
    // German
    /internationale.*übermittlung/i, /außerhalb.*EWR/i, /außerhalb.*EU/i,
    /grenzüberschreitend/i, /angemessenheitsbeschluss/i, /standardvertragsklauseln/i,
    // French
    /transfert.*international/i, /en.*dehors.*de.*l'EEE/i, /hors.*UE/i,
    /transfrontière/i, /décision.*d'adéquation/i, /clauses.*contractuelles.*types/i,
    // Spanish
    /transferencia.*internacional/i, /fuera.*del.*EEE/i, /fuera.*de.*la.*UE/i,
    /transfronterizo/i, /decisión.*de.*adecuación/i, /cláusulas.*contractuales.*tipo/i,
    // Dutch
    /internationale.*doorgifte/i, /buiten.*EER/i, /buiten.*EU/i,
    /grensoverschrijdend/i, /adequaatheidsbesluit/i, /modelcontractbepalingen/i,
  ],
  userRights: [
    // English
    /your\s*rights/i, /data\s*subject\s*rights/i, /right\s*to\s*access/i,
    /right\s*to\s*erasure/i, /right\s*to\s*rectification/i, /right\s*to\s*portability/i,
    // German
    /ihre.*rechte/i, /betroffenenrechte/i, /auskunftsrecht/i, /recht.*auf.*löschung/i,
    /recht.*auf.*berichtigung/i, /recht.*auf.*datenübertragbarkeit/i,
    // French
    /vos.*droits/i, /droits.*des.*personnes.*concernées/i, /droit.*d'accès/i,
    /droit.*à.*l'effacement/i, /droit.*de.*rectification/i, /droit.*à.*la.*portabilité/i,
    // Spanish
    /sus.*derechos/i, /derechos.*del.*interesado/i, /derecho.*de.*acceso/i,
    /derecho.*de.*supresión/i, /derecho.*de.*rectificación/i, /derecho.*a.*la.*portabilidad/i,
    // Dutch
    /uw.*rechten/i, /rechten.*van.*betrokkenen/i, /recht.*op.*inzage/i,
    /recht.*op.*vergetelheid/i, /recht.*op.*rectificatie/i, /recht.*op.*overdraagbaarheid/i,
  ],
  complaintRight: [
    // English
    /supervisory\s*authority/i, /lodge.*complaint/i, /data\s*protection\s*authority/i,
    /right\s*to\s*complain/i,
    // German
    /aufsichtsbehörde/i, /beschwerde.*einreichen/i, /datenschutzbehörde/i,
    /beschwerderecht/i,
    // French
    /autorité.*de.*contrôle/i, /déposer.*une.*plainte/i, /autorité.*de.*protection/i,
    /droit.*de.*réclamation/i,
    // Spanish
    /autoridad.*de.*control/i, /presentar.*queja/i, /autoridad.*de.*protección/i,
    /derecho.*a.*reclamar/i,
    // Dutch
    /toezichthoudende.*autoriteit/i, /klacht.*indienen/i, /autoriteit.*persoonsgegevens/i,
    /recht.*op.*klacht/i,
  ],
  dataSource: [
    // English
    /source.*data/i, /where.*obtain/i, /collect.*from/i,
    // German
    /datenquelle/i, /herkunft.*daten/i, /woher.*erhalten/i, /erheben.*von/i,
    // French
    /source.*données/i, /provenance.*données/i, /où.*obtenir/i, /collecter.*auprès/i,
    // Spanish
    /fuente.*datos/i, /origen.*datos/i, /dónde.*obtener/i, /recopilar.*de/i,
    // Dutch
    /gegevensbron/i, /herkomst.*gegevens/i, /waar.*verkrijgen/i, /verzamelen.*van/i,
  ],
  automatedDecisions: [
    // English
    /automated\s*decision/i, /profiling/i, /algorithmic/i, /automated\s*processing/i,
    // German
    /automatisierte.*entscheidung/i, /profiling/i, /profilbildung/i,
    /algorithmisch/i, /automatisierte.*verarbeitung/i,
    // French
    /décision.*automatisée/i, /profilage/i, /algorithmique/i,
    /traitement.*automatisé/i,
    // Spanish
    /decisión.*automatizada/i, /elaboración.*de.*perfiles/i, /algorítmico/i,
    /tratamiento.*automatizado/i,
    // Dutch
    /geautomatiseerde.*besluitvorming/i, /profilering/i, /algoritmisch/i,
    /geautomatiseerde.*verwerking/i,
  ],
};

/**
 * Analyze privacy policy content
 */
export async function analyzePrivacyPolicyContent(
  page: Page,
  policyUrl?: string
): Promise<PrivacyPolicyAnalysis> {
  let content = "";

  try {
    // If policy URL is provided, navigate to it
    if (policyUrl && !policyUrl.includes("#")) {
      // Don't navigate if it's just an anchor link
      try {
        await page.goto(policyUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Failed to navigate to privacy policy:", error);
      }
    }

    // Extract all text content from the page
    content = await page.evaluate(() => {
      // Get main content area (common containers)
      const selectors = [
        "main",
        "article",
        '[role="main"]',
        ".privacy-policy",
        "#privacy-policy",
        ".content",
        ".page-content",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent || "";
        }
      }

      // Fallback to body
      return document.body.textContent || "";
    });

    content = content.toLowerCase();
  } catch (error) {
    console.error("Privacy policy content extraction error:", error);
  }

  // Analyze content for required elements
  const analysis: PrivacyPolicyAnalysis = {
    hasControllerIdentity: hasMatch(content, REQUIRED_ELEMENTS.controllerIdentity),
    hasDpoContact: hasMatch(content, REQUIRED_ELEMENTS.dpoContact),
    hasProcessingPurposes: hasMatch(content, REQUIRED_ELEMENTS.processingPurposes),
    hasLegalBasis: hasMatch(content, REQUIRED_ELEMENTS.legalBasis),
    hasDataCategories: hasMatch(content, REQUIRED_ELEMENTS.dataCategories),
    hasRetentionPeriods: hasMatch(content, REQUIRED_ELEMENTS.retentionPeriods),
    hasDataRecipients: hasMatch(content, REQUIRED_ELEMENTS.dataRecipients),
    hasInternationalTransfers: hasMatch(content, REQUIRED_ELEMENTS.internationalTransfers),
    hasUserRights: hasMatch(content, REQUIRED_ELEMENTS.userRights),
    hasComplaintRight: hasMatch(content, REQUIRED_ELEMENTS.complaintRight),
    hasDataSource: hasMatch(content, REQUIRED_ELEMENTS.dataSource),
    hasAutomatedDecisions: hasMatch(content, REQUIRED_ELEMENTS.automatedDecisions),
    completenessScore: 0,
  };

  // Calculate completeness score
  // Controller identity, purposes, legal basis, data categories, user rights are critical (10 points each)
  // Others are important (5 points each)
  let score = 0;

  // Critical elements (10 points each = 50 points)
  if (analysis.hasControllerIdentity) score += 10;
  if (analysis.hasProcessingPurposes) score += 10;
  if (analysis.hasLegalBasis) score += 10;
  if (analysis.hasDataCategories) score += 10;
  if (analysis.hasUserRights) score += 10;

  // Important elements (5 points each = 35 points)
  if (analysis.hasDpoContact) score += 5;
  if (analysis.hasRetentionPeriods) score += 5;
  if (analysis.hasDataRecipients) score += 5;
  if (analysis.hasInternationalTransfers) score += 5;
  if (analysis.hasComplaintRight) score += 5;
  if (analysis.hasDataSource) score += 5;
  if (analysis.hasAutomatedDecisions) score += 5;

  analysis.completenessScore = Math.min(100, score);

  return analysis;
}

/**
 * Check if content matches any pattern
 */
function hasMatch(content: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}

/**
 * Generate findings for privacy policy content issues
 */
export function generatePrivacyPolicyFindings(
  analysis: PrivacyPolicyAnalysis,
  hasPrivacyPolicy: boolean
): Finding[] {
  const findings: Finding[] = [];

  // If no privacy policy at all, this is handled elsewhere
  if (!hasPrivacyPolicy) {
    return findings;
  }

  // Check if privacy policy is incomplete
  const missingElements: string[] = [];

  if (!analysis.hasControllerIdentity) missingElements.push("Controller identity and contact");
  if (!analysis.hasDpoContact) missingElements.push("DPO contact details");
  if (!analysis.hasProcessingPurposes) missingElements.push("Processing purposes");
  if (!analysis.hasLegalBasis) missingElements.push("Legal basis for processing");
  if (!analysis.hasDataCategories) missingElements.push("Data categories collected");
  if (!analysis.hasRetentionPeriods) missingElements.push("Data retention periods");
  if (!analysis.hasDataRecipients) missingElements.push("Data recipients/third parties");
  if (!analysis.hasInternationalTransfers) missingElements.push("International transfer information");
  if (!analysis.hasUserRights) missingElements.push("Data subject rights");
  if (!analysis.hasComplaintRight) missingElements.push("Right to lodge complaint");

  // Generate finding based on completeness score
  if (analysis.completenessScore < 50) {
    findings.push({
      type: "privacy_policy",
      severity: "error",
      title: "Incomplete Privacy Policy",
      description: `Your privacy policy is missing ${missingElements.length} critical elements required by GDPR Articles 13-14. Completeness score: ${analysis.completenessScore}/100. Missing: ${missingElements.slice(0, 5).join(", ")}${missingElements.length > 5 ? `, and ${missingElements.length - 5} more` : ""}.`,
      recommendation:
        "Update your privacy policy to include all required GDPR elements: controller identity, DPO contact, processing purposes, legal basis, data categories, retention periods, data recipients, international transfers, user rights, and complaint rights.",
    });
  } else if (analysis.completenessScore < 80) {
    findings.push({
      type: "privacy_policy",
      severity: "warning",
      title: "Privacy Policy Needs Improvement",
      description: `Your privacy policy is missing ${missingElements.length} elements required by GDPR Articles 13-14. Completeness score: ${analysis.completenessScore}/100. Missing: ${missingElements.join(", ")}.`,
      recommendation:
        "Review and enhance your privacy policy to include: " + missingElements.join(", ") + ".",
    });
  }

  // Specific critical element warnings
  if (!analysis.hasLegalBasis) {
    findings.push({
      type: "privacy_policy",
      severity: "error",
      title: "No Legal Basis Disclosed (Article 6)",
      description:
        "Your privacy policy does not specify the legal basis for processing personal data. GDPR Article 6 requires you to identify whether you process data based on consent, contract, legal obligation, vital interests, public task, or legitimate interests.",
      recommendation:
        "Add a section to your privacy policy clearly stating the legal basis for each processing activity (e.g., 'We process your email address based on contractual necessity to provide you with our service').",
    });
  }

  if (!analysis.hasUserRights) {
    findings.push({
      type: "privacy_policy",
      severity: "error",
      title: "User Rights Not Disclosed (Articles 15-22)",
      description:
        "Your privacy policy does not explain users' GDPR rights. You must inform users of their right to access, rectify, erase, restrict, object, and port their data.",
      recommendation:
        "Add a 'Your Rights' section explaining all GDPR data subject rights (Articles 15-22) and how users can exercise them.",
    });
  }

  return findings;
}
