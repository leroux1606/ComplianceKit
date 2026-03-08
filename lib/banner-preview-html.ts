/**
 * Pure TypeScript functions that generate the srcdoc HTML for the live banner
 * preview iframe (E4).
 *
 * These functions mirror getBannerStyles() and getBannerHTML() in public/widget.js
 * so the preview matches the real widget exactly. They are pure (no DOM, no fetch)
 * so they can be used on both server and client and are trivially testable.
 */

import type { BannerConfigInput } from "./validations";

export type PreviewPanel = "banner" | "settings" | "withdrawal";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape user-supplied strings for safe embedding in HTML attributes and text. */
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// CSS generation — mirrors getBannerStyles() in widget.js
// ---------------------------------------------------------------------------

export function generateBannerCss(config: BannerConfigInput): string {
  const bgColor = config.theme === "dark" ? "#1f2937" : "#ffffff";
  const textColor = config.theme === "dark" ? "#f9fafb" : "#1f2937";
  const borderRadius =
    config.buttonStyle === "pill"
      ? "9999px"
      : config.buttonStyle === "square"
      ? "0"
      : "6px";

  return `
    .ck-preview-bg {
      position: fixed; inset: 0;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      overflow: hidden;
    }
    .ck-preview-bg__block {
      background: #94a3b8;
      border-radius: 4px;
      position: absolute;
    }
    .ck-banner {
      position: fixed; z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px; line-height: 1.5;
      background: ${bgColor}; color: ${textColor};
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
      opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .ck-banner--visible { opacity: 1 !important; }
    .ck-banner--bottom { bottom: 0; left: 0; right: 0; transform: translateY(100%); }
    .ck-banner--bottom.ck-banner--visible { transform: translateY(0); }
    .ck-banner--top { top: 0; left: 0; right: 0; transform: translateY(-100%); }
    .ck-banner--top.ck-banner--visible { transform: translateY(0); }
    .ck-banner--center {
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      max-width: 500px; border-radius: 12px;
    }
    .ck-banner--center.ck-banner--visible { transform: translate(-50%, -50%) scale(1); }
    .ck-banner__content { padding: 16px 24px; max-width: 1200px; margin: 0 auto; }
    .ck-banner p { margin: 0 0 12px 0; }
    .ck-banner__buttons { display: flex; flex-wrap: wrap; gap: 8px; }
    .ck-banner button {
      padding: 10px 20px; border: none; cursor: pointer;
      font-size: 14px; font-weight: 500;
      border-radius: ${borderRadius}; transition: opacity 0.2s;
    }
    .ck-banner button:hover { opacity: 0.9; }
    .ck-accept-all { background: ${config.primaryColor}; color: ${config.textColor}; }
    .ck-reject-all {
      background: transparent;
      border: 1px solid ${config.primaryColor} !important;
      color: ${config.theme === "dark" ? "#f9fafb" : config.primaryColor};
    }
    .ck-customize {
      background: transparent;
      color: ${config.theme === "dark" ? "#f9fafb" : config.primaryColor};
    }
    .ck-banner__links { margin-top: 8px; font-size: 12px; opacity: 0.7; }
    .ck-banner__links a { color: inherit; }
    .ck-settings { display: none; }
    .ck-settings--visible { display: block !important; }
    .ck-main--hidden { display: none !important; }
    .ck-settings__header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 16px;
    }
    .ck-settings__header h4 { margin: 0; font-size: 16px; }
    .ck-back { background: transparent !important; padding: 4px !important; }
    .ck-setting {
      display: flex; justify-content: space-between;
      align-items: center; padding: 12px 0;
      border-bottom: 1px solid rgba(128,128,128,0.2);
    }
    .ck-setting:last-child { border-bottom: none; }
    .ck-setting__info h5 { margin: 0 0 4px 0; font-size: 14px; }
    .ck-setting__info p { margin: 0; font-size: 12px; opacity: 0.7; }
    .ck-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
    .ck-toggle input { opacity: 0; width: 0; height: 0; }
    .ck-toggle__slider {
      position: absolute; cursor: pointer; inset: 0;
      background: #ccc; border-radius: 24px; transition: 0.3s;
    }
    .ck-toggle__slider:before {
      position: absolute; content: '';
      height: 18px; width: 18px; left: 3px; bottom: 3px;
      background: white; border-radius: 50%; transition: 0.3s;
    }
    .ck-toggle input:checked + .ck-toggle__slider { background: ${config.primaryColor}; }
    .ck-toggle input:checked + .ck-toggle__slider:before { transform: translateX(20px); }
    .ck-toggle input:disabled + .ck-toggle__slider { opacity: 0.6; cursor: not-allowed; }
    .ck-save-prefs {
      width: 100%; margin-top: 16px; padding: 10px; border: none;
      border-radius: ${borderRadius};
      background: ${config.primaryColor}; color: ${config.textColor};
      font-size: 14px; font-weight: 500; cursor: pointer;
    }
    ${config.customCss || ""}
  `;
}

// ---------------------------------------------------------------------------
// Banner HTML — mirrors getBannerHTML() in widget.js exactly
// ---------------------------------------------------------------------------

export function generateBannerHtml(
  config: BannerConfigInput,
  privacyPolicyUrl: string,
  cookiePolicyUrl: string
): string {
  const privacyLink = escapeHtml(privacyPolicyUrl || "/privacy-policy");
  const cookieLink = escapeHtml(cookiePolicyUrl || "/cookie-policy");

  return `
    <div class="ck-banner__content">
      <div class="ck-main">
        <p>We use cookies to improve your experience. Please choose your preferences below. Your consent choice is recorded along with your anonymised visitor ID and IP address for compliance purposes.</p>
        <div class="ck-banner__buttons">
          <button class="ck-accept-all">Accept All</button>
          <button class="ck-reject-all">Reject All</button>
          <button class="ck-customize">Customize</button>
        </div>
        <div class="ck-banner__links">
          <a href="${privacyLink}">Privacy Policy</a> &bull; <a href="${cookieLink}">Cookie Policy</a>
        </div>
      </div>
      <div class="ck-settings">
        <div class="ck-settings__header">
          <h4>Cookie Preferences</h4>
          <button class="ck-back">&times;</button>
        </div>
        <div class="ck-setting">
          <div class="ck-setting__info"><h5>Necessary</h5><p>Required for the website to function</p></div>
          <label class="ck-toggle"><input type="checkbox" checked disabled><span class="ck-toggle__slider"></span></label>
        </div>
        <div class="ck-setting">
          <div class="ck-setting__info"><h5>Analytics</h5><p>Help us improve our website</p></div>
          <label class="ck-toggle"><input type="checkbox" id="ck-analytics"><span class="ck-toggle__slider"></span></label>
        </div>
        <div class="ck-setting">
          <div class="ck-setting__info"><h5>Marketing</h5><p>Personalized advertisements</p></div>
          <label class="ck-toggle"><input type="checkbox" id="ck-marketing"><span class="ck-toggle__slider"></span></label>
        </div>
        <div class="ck-setting">
          <div class="ck-setting__info"><h5>Functional</h5><p>Enhanced functionality and personalization</p></div>
          <label class="ck-toggle"><input type="checkbox" id="ck-functional"><span class="ck-toggle__slider"></span></label>
        </div>
        <button class="ck-save-prefs">Save Preferences</button>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Withdrawal button HTML — mirrors createWithdrawalButton() in widget.js
// ---------------------------------------------------------------------------

export function generateWithdrawalButtonHtml(config: BannerConfigInput): string {
  const pos = config.withdrawalButtonPosition || "bottom-right";
  const posStyle = pos === "bottom-left" ? "left:16px;" : "right:16px;";

  return `<button
    id="ck-manage-btn"
    aria-label="Manage Cookie Preferences"
    style="position:fixed;z-index:999998;bottom:16px;${posStyle}background:${escapeHtml(config.primaryColor)};color:${escapeHtml(config.textColor)};border:none;border-radius:20px;padding:8px 16px;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);"
  >Cookie Preferences</button>`;
}

// ---------------------------------------------------------------------------
// Full preview document — wraps everything in a complete HTML page for srcdoc
// ---------------------------------------------------------------------------

/**
 * Generates a self-contained HTML document suitable for use as an iframe
 * srcDoc attribute. The panel argument controls which state is shown:
 *   "banner"     — the initial cookie banner (main panel)
 *   "settings"   — the Customize panel inside the banner
 *   "withdrawal" — the persistent "Cookie Preferences" floating button
 */
export function generatePreviewDocument(
  config: BannerConfigInput,
  panel: PreviewPanel
): string {
  const css = generateBannerCss(config);

  // Build the body content based on the requested panel
  let bodyContent = "";

  // Fake website background placeholder (always present for context)
  const fakeWebsite = `
    <div class="ck-preview-bg" aria-hidden="true">
      <div class="ck-preview-bg__block" style="top:12px;left:12px;width:80px;height:12px;opacity:0.5;"></div>
      <div class="ck-preview-bg__block" style="top:36px;left:12px;width:100%;height:10px;opacity:0.35;"></div>
      <div class="ck-preview-bg__block" style="top:56px;left:12px;width:75%;height:10px;opacity:0.35;"></div>
      <div class="ck-preview-bg__block" style="top:76px;left:12px;width:90%;height:10px;opacity:0.35;"></div>
      <div class="ck-preview-bg__block" style="top:104px;left:12px;right:12px;height:80px;opacity:0.3;"></div>
      <div class="ck-preview-bg__block" style="top:196px;left:12px;width:100%;height:10px;opacity:0.35;"></div>
      <div class="ck-preview-bg__block" style="top:216px;left:12px;width:60%;height:10px;opacity:0.35;"></div>
    </div>`;

  if (panel === "withdrawal") {
    bodyContent = fakeWebsite + generateWithdrawalButtonHtml(config);
  } else {
    // Banner panels: render the banner with the appropriate sub-panel shown
    const bannerContent = generateBannerHtml(
      config,
      config.privacyPolicyUrl || "",
      config.cookiePolicyUrl || ""
    );

    const mainClass = panel === "settings" ? "ck-main ck-main--hidden" : "ck-main";
    const settingsClass = panel === "settings" ? "ck-settings ck-settings--visible" : "ck-settings";

    // Replace the class names in the generated HTML
    const patchedContent = bannerContent
      .replace(/class="ck-main"/, `class="${mainClass}"`)
      .replace(/class="ck-settings"/, `class="${settingsClass}"`);

    bodyContent = `
      ${fakeWebsite}
      <div
        id="ck-cookie-banner"
        class="ck-banner ck-banner--${config.position} ck-banner--${config.animation} ck-banner--visible"
        role="dialog"
        aria-label="Cookie consent"
      >${patchedContent}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
  ${css}
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}
