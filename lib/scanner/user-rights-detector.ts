import { Page } from "puppeteer";
import type { UserRightsDetection, Finding } from "./types";

/**
 * Patterns to detect user profile/settings pages (multi-language)
 */
const PROFILE_PATTERNS = [
  // English
  /profile/i, /account/i, /settings/i, /my-account/i, /user-settings/i,
  /edit-profile/i, /personal-info/i, /update-profile/i,
  // German
  /profil/i, /konto/i, /einstellungen/i, /mein-konto/i, /benutzerkonto/i,
  /profil.*bearbeiten/i, /persönliche.*daten/i,
  // French
  /profil/i, /compte/i, /paramètres/i, /mon-compte/i, /mes-paramètres/i,
  /modifier.*profil/i, /informations.*personnelles/i,
  // Spanish
  /perfil/i, /cuenta/i, /configuración/i, /mi-cuenta/i, /ajustes/i,
  /editar.*perfil/i, /información.*personal/i,
  // Dutch
  /profiel/i, /account/i, /instellingen/i, /mijn-account/i,
  /profiel.*bewerken/i, /persoonlijke.*gegevens/i,
];

/**
 * Patterns to detect data export functionality (multi-language)
 */
const DATA_EXPORT_PATTERNS = [
  // English
  /export.*data/i, /download.*data/i, /data.*portability/i,
  /download.*information/i, /export.*account/i, /request.*data/i, /get.*my.*data/i,
  // German
  /daten.*exportieren/i, /daten.*herunterladen/i, /datenübertragbarkeit/i,
  /daten.*anfordern/i, /meine.*daten.*laden/i,
  // French
  /exporter.*données/i, /télécharger.*données/i, /portabilité.*données/i,
  /demander.*données/i, /obtenir.*mes.*données/i,
  // Spanish
  /exportar.*datos/i, /descargar.*datos/i, /portabilidad.*datos/i,
  /solicitar.*datos/i, /obtener.*mis.*datos/i,
  // Dutch
  /gegevens.*exporteren/i, /gegevens.*downloaden/i, /gegevensoverdraagbaarheid/i,
  /gegevens.*aanvragen/i, /mijn.*gegevens.*ophalen/i,
];

/**
 * Patterns to detect account deletion (multi-language)
 */
const ACCOUNT_DELETION_PATTERNS = [
  // English
  /delete.*account/i, /close.*account/i, /remove.*account/i,
  /deactivate.*account/i, /cancel.*account/i, /erase.*data/i,
  /right.*to.*erasure/i, /right.*to.*be.*forgotten/i,
  // German
  /konto.*löschen/i, /konto.*schließen/i, /konto.*entfernen/i,
  /konto.*deaktivieren/i, /daten.*löschen/i, /recht.*auf.*löschung/i,
  /recht.*auf.*vergessenwerden/i,
  // French
  /supprimer.*compte/i, /fermer.*compte/i, /effacer.*compte/i,
  /désactiver.*compte/i, /effacer.*données/i, /droit.*à.*l'effacement/i,
  /droit.*à.*l'oubli/i,
  // Spanish
  /eliminar.*cuenta/i, /cerrar.*cuenta/i, /borrar.*cuenta/i,
  /desactivar.*cuenta/i, /borrar.*datos/i, /derecho.*al.*olvido/i,
  /derecho.*de.*supresión/i,
  // Dutch
  /account.*verwijderen/i, /account.*sluiten/i, /account.*wissen/i,
  /account.*deactiveren/i, /gegevens.*wissen/i, /recht.*op.*vergetelheid/i,
  /recht.*op.*gegevenswissing/i,
];

/**
 * Patterns to detect DSAR (Data Subject Access Request) mechanisms (multi-language)
 */
const DSAR_PATTERNS = [
  // English
  /dsar/i, /data.*subject.*request/i, /privacy.*request/i,
  /data.*request/i, /gdpr.*request/i, /submit.*request/i,
  /access.*request/i, /data.*protection/i,
  // German
  /dsar/i, /auskunftsersuchen/i, /datenschutzanfrage/i, /betroffenenanfrage/i,
  /dsgvo.*anfrage/i, /anfrage.*einreichen/i, /datenschutz/i,
  // French
  /dsar/i, /demande.*d'accès/i, /demande.*de.*confidentialité/i,
  /demande.*rgpd/i, /soumettre.*demande/i, /protection.*des.*données/i,
  // Spanish
  /dsar/i, /solicitud.*de.*acceso/i, /solicitud.*de.*privacidad/i,
  /solicitud.*rgpd/i, /enviar.*solicitud/i, /protección.*de.*datos/i,
  // Dutch
  /dsar/i, /verzoek.*inzage/i, /privacyverzoek/i, /gegevensverzoek/i,
  /avg.*verzoek/i, /verzoek.*indienen/i, /gegevensbescherming/i,
];

/**
 * Patterns to detect login/signup/register functionality (multi-language)
 * These indicate the site likely has user accounts
 */
const AUTH_PATTERNS = [
  // English
  /\bsign\s*in\b/i, /\blog\s*in\b/i, /\blogin\b/i, /\bsign\s*up\b/i, /\bregister\b/i,
  /\bcreate.*account\b/i, /\bjoin\b/i, /\bmember.*login\b/i, /\buser.*login\b/i,
  // German
  /\banmelden\b/i, /\beinloggen\b/i, /\bregistrieren\b/i, /\bkonto.*erstellen\b/i,
  // French
  /\bse\s*connecter\b/i, /\bconnexion\b/i, /\bs'inscrire\b/i, /\bcréer.*compte\b/i,
  // Spanish
  /\biniciar.*sesión\b/i, /\bacceder\b/i, /\bregistrarse\b/i, /\bcrear.*cuenta\b/i,
  // Dutch
  /\binloggen\b/i, /\baanmelden\b/i, /\bregistreren\b/i, /\baccount.*aanmaken\b/i,
];

/**
 * Detect user rights features on the page
 */
export async function detectUserRights(page: Page): Promise<UserRightsDetection> {
  try {
    // Get all links and buttons text
    const pageContent = await page.evaluate(() => {
      const links: Array<{ text: string; href: string }> = [];
      const buttons: string[] = [];

      // Collect all links
      document.querySelectorAll("a").forEach((link) => {
        const text = link.textContent?.trim() || "";
        const href = link.getAttribute("href") || "";
        if (text || href) {
          links.push({ text, href });
        }
      });

      // Collect all buttons
      document.querySelectorAll("button, input[type='button'], input[type='submit']").forEach((btn) => {
        const text = btn.textContent?.trim() || btn.getAttribute("value") || "";
        if (text) {
          buttons.push(text);
        }
      });

      // Also check for forms with specific actions
      const forms: string[] = [];
      document.querySelectorAll("form").forEach((form) => {
        const action = form.getAttribute("action") || "";
        if (action) {
          forms.push(action);
        }
      });

      return { links, buttons, forms };
    });

    const detection: UserRightsDetection = {
      hasProfileSettings: false,
      hasDataExport: false,
      hasAccountDeletion: false,
      hasDsarMechanism: false,
      hasAuthOrRegistration: false, // NEW: Track if site has login/signup
    };

    // Check for profile/settings
    for (const link of pageContent.links) {
      const combinedText = `${link.text} ${link.href}`.toLowerCase();

      // Check profile/settings patterns
      if (PROFILE_PATTERNS.some((pattern) => pattern.test(combinedText))) {
        detection.hasProfileSettings = true;
        detection.profileSettingsUrl = link.href;
      }

      // Check data export patterns
      if (DATA_EXPORT_PATTERNS.some((pattern) => pattern.test(combinedText))) {
        detection.hasDataExport = true;
        detection.dataExportUrl = link.href;
      }

      // Check account deletion patterns
      if (ACCOUNT_DELETION_PATTERNS.some((pattern) => pattern.test(combinedText))) {
        detection.hasAccountDeletion = true;
        detection.accountDeletionUrl = link.href;
      }

      // Check DSAR patterns
      if (DSAR_PATTERNS.some((pattern) => pattern.test(combinedText))) {
        detection.hasDsarMechanism = true;
        detection.dsarUrl = link.href;
      }

      // Check for login/signup/register (indicates user accounts)
      if (AUTH_PATTERNS.some((pattern) => pattern.test(combinedText))) {
        detection.hasAuthOrRegistration = true;
      }
    }

    // Check buttons and forms as well
    const allText = [
      ...pageContent.buttons,
      ...pageContent.forms,
    ].join(" ").toLowerCase();

    if (!detection.hasDataExport && DATA_EXPORT_PATTERNS.some((pattern) => pattern.test(allText))) {
      detection.hasDataExport = true;
    }

    if (!detection.hasAccountDeletion && ACCOUNT_DELETION_PATTERNS.some((pattern) => pattern.test(allText))) {
      detection.hasAccountDeletion = true;
    }

    if (!detection.hasDsarMechanism && DSAR_PATTERNS.some((pattern) => pattern.test(allText))) {
      detection.hasDsarMechanism = true;
    }

    // Check for auth patterns in buttons/forms too
    if (!detection.hasAuthOrRegistration && AUTH_PATTERNS.some((pattern) => pattern.test(allText))) {
      detection.hasAuthOrRegistration = true;
    }

    return detection;
  } catch (error) {
    console.error("User rights detection error:", error);
    return {
      hasProfileSettings: false,
      hasDataExport: false,
      hasAccountDeletion: false,
      hasDsarMechanism: false,
      hasAuthOrRegistration: false,
    };
  }
}

/**
 * Generate findings for missing user rights
 * 
 * NOTE: User rights requirements only apply to websites that collect/process personal data
 * through user accounts. For sites without user accounts (e.g., informational sites, 
 * marketplaces), these are recommendations, not requirements.
 */
export function generateUserRightsFindings(detection: UserRightsDetection): Finding[] {
  const findings: Finding[] = [];

  // Check if the site appears to have user account functionality
  // Either: (1) Has ANY user rights features, OR (2) Has login/signup/register
  const hasUserAccountFeatures = 
    detection.hasProfileSettings || 
    detection.hasDataExport || 
    detection.hasAccountDeletion ||
    detection.hasDsarMechanism ||
    detection.hasAuthOrRegistration; // NEW: Also check for login/signup

  // Check if user rights features are missing
  const missingRights: string[] = [];

  if (!detection.hasProfileSettings) {
    missingRights.push("Profile/Account Settings");
  }

  if (!detection.hasDataExport) {
    missingRights.push("Data Export");
  }

  if (!detection.hasAccountDeletion) {
    missingRights.push("Account Deletion");
  }

  if (!detection.hasDsarMechanism) {
    missingRights.push("DSAR Request Form");
  }

  // If the site appears to have user accounts but is missing rights features, warn them
  if (hasUserAccountFeatures && missingRights.length > 0) {
    // Use "error" severity if site has auth (login/signup) and is missing most/all features
    // Use "warning" if missing some features
    // Use "info" if missing only 1-2 features
    const hasAuth = detection.hasAuthOrRegistration;
    const severity = 
      (hasAuth && missingRights.length === 4) ? "error" : // Has login but missing ALL 4 rights
      (missingRights.length >= 3) ? "warning" : // Missing 3+ features
      "info"; // Missing 1-2 features

    findings.push({
      type: "data_rectification",
      severity,
      title: "Missing GDPR User Rights Features",
      description: `Your website appears to be missing ${missingRights.length} of 4 recommended GDPR user rights features: ${missingRights.join(", ")}. If your website collects personal data through user accounts, GDPR requires providing users with the ability to access, rectify, and erase their personal data (Articles 15, 16, 17).`,
      recommendation:
        "If your website has user accounts, implement features that allow users to: (1) View and update their profile information (Article 16 - Right to Rectification), (2) Export their personal data in a machine-readable format (Article 20 - Right to Data Portability), (3) Delete their account and data (Article 17 - Right to Erasure), and (4) Submit data subject access requests (DSAR) for privacy inquiries.",
    });

    // Add specific findings only for sites with user accounts
    if (!detection.hasProfileSettings && !detection.hasDataExport) {
      const specificSeverity = hasAuth ? "error" : "warning";
      findings.push({
        type: "user_profile_settings",
        severity: specificSeverity,
        title: "No User Profile or Data Management Found",
        description:
          "Your website does not appear to have user profile settings or data management features. If you collect personal data, GDPR Article 16 requires that users can rectify (update) their personal data.",
        recommendation:
          "Add a user profile/account settings page where users can view and update their personal information (name, email, preferences, etc.).",
      });
    }

    if (!detection.hasAccountDeletion) {
      const specificSeverity = hasAuth ? "error" : "warning";
      findings.push({
        type: "account_deletion",
        severity: specificSeverity,
        title: "No Account Deletion Feature Found",
        description:
          "Your website does not appear to offer account deletion functionality. If you have user accounts, GDPR Article 17 grants users the 'Right to Erasure' (also known as 'Right to be Forgotten').",
        recommendation:
          "Implement an account deletion feature that allows users to permanently delete their account and associated personal data. Include a confirmation step to prevent accidental deletion.",
      });
    }
  }

  // For sites WITHOUT apparent user account features, only add an informational note
  // Don't penalize them - these requirements don't apply if they don't have user accounts
  if (!hasUserAccountFeatures && missingRights.length === 4) {
    findings.push({
      type: "user_rights_info",
      severity: "info",
      title: "User Rights Features Not Detected",
      description:
        "No user account or data management features were detected on your website. If your website collects personal data through user accounts (e.g., registration, login), you should implement GDPR user rights features.",
      recommendation:
        "If your website has user registration or collects personal data, ensure you provide: profile management, data export, account deletion, and a way to submit data access requests.",
    });
  }

  return findings;
}
