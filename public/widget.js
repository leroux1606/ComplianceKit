/**
 * ComplianceKit Widget — Universal Static Script
 *
 * Embed on any website:
 *   <script src="https://app.compliancekit.com/widget.js" data-embed-code="YOUR_CODE" defer></script>
 *
 * Public API (available on window.ComplianceKit after the script loads):
 *   getConsent()              — returns current preferences object or null
 *   openSettings()            — opens the cookie preferences modal
 *   onConsentChange(callback) — fires on every consent change; returns unsubscribe fn
 *
 * This file is intentionally static and identical for all customers.
 * The embed code is read at runtime from the script tag's data-embed-code attribute.
 * The API base URL is derived from this script's own origin, so it works in any environment.
 *
 * CDN deployment: upload this file to Cloudflare R2 / S3+CloudFront and update
 * the embed snippet URL. No other changes required.
 */
(function () {
  'use strict';

  var CK_VERSION = '1.0.1';

  // ── Bootstrap: identify this script tag and extract configuration ─────────
  // document.currentScript is populated synchronously during script execution.
  // Capture it immediately before any async code can null it out.
  var _script = document.currentScript;

  // Fallback: find script tag by matching src pattern (handles async/defer edge cases
  // and eval-in-test environments where currentScript is always null).
  if (!_script) {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (all[i].src && (
        all[i].src.indexOf('widget.js') !== -1 ||
        all[i].src.indexOf('/script.js') !== -1
      )) {
        _script = all[i];
        break;
      }
    }
  }

  // Embed code: prefer data attribute, fall back to URL path extraction (legacy format)
  var CK_EMBED_CODE = '';
  if (_script) {
    CK_EMBED_CODE = _script.getAttribute('data-embed-code') || '';
    if (!CK_EMBED_CODE && _script.src) {
      // Legacy URL format: /api/widget/[embedCode]/script.js
      var urlMatch = _script.src.match(/\/api\/widget\/([^/]+)\/script\.js/);
      if (urlMatch) CK_EMBED_CODE = urlMatch[1];
    }
  }

  if (!CK_EMBED_CODE) {
    console.warn('ComplianceKit: No embed code found. Add data-embed-code="YOUR_CODE" to the script tag.');
    return;
  }

  // API base URL derived from this script's origin — works in dev and production
  // without hardcoding. When served from a CDN, the origin of the script tag URL
  // points back to the app server where the API lives.
  var _apiOrigin = (_script && _script.src)
    ? new URL(_script.src).origin
    : window.location.origin;

  var CK_API_URL    = _apiOrigin + '/api/widget/' + CK_EMBED_CODE;
  var CK_STORAGE_KEY = 'ck_consent_' + CK_EMBED_CODE;
  var CK_VISITOR_KEY = 'ck_visitor_id';
  // ─────────────────────────────────────────────────────────────────────────

  // ── Private shared state ──────────────────────────────────────────────────
  // These are set once the config fetch resolves and used by the public API.
  var _ckConfig              = null;   // banner config object from /config
  var _ckConsentModeV2       = false;  // Google Consent Mode v2 flag
  var _ckPendingOpenSettings = false;  // openSettings() called before config arrived
  var _ckCallbacks           = [];     // onConsentChange listeners
  // ─────────────────────────────────────────────────────────────────────────

  // ── Public API (D6) ───────────────────────────────────────────────────────
  // Exposed synchronously — before the config fetch — so integrators can
  // register callbacks before the banner appears.  All methods are safe to
  // call at any point in the page lifecycle.
  window.ComplianceKit = {
    version: CK_VERSION,

    /**
     * Returns the visitor's current consent preferences, or null if no consent
     * decision has been recorded on this browser yet.
     *
     * @returns {{ necessary: boolean, analytics: boolean, marketing: boolean, functional: boolean } | null}
     *
     * @example
     * var prefs = window.ComplianceKit.getConsent();
     * if (prefs && prefs.analytics) { initAnalytics(); }
     */
    getConsent: function () {
      return window.CK_CONSENT || null;
    },

    /**
     * Programmatically opens the cookie preferences modal.
     *
     * - If the banner config is already loaded: opens the modal immediately.
     * - If the config is still loading: queues the call and opens the modal
     *   as soon as the config arrives (returning visitors only; first-time
     *   visitors see the banner instead of the modal for their initial choice).
     * - If the modal is already open: no-op.
     *
     * @example
     * document.getElementById('my-cookie-link').addEventListener('click', function () {
     *   window.ComplianceKit.openSettings();
     * });
     */
    openSettings: function () {
      if (_ckConfig) {
        openSettingsModal(_ckConfig, _ckConsentModeV2);
      } else {
        // Config not loaded yet — set flag; modal will open after fetch resolves
        // (only for returning visitors who have existing consent; first-time
        // visitors will see the banner, which is the canonical first-choice UI).
        _ckPendingOpenSettings = true;
      }
    },

    /**
     * Registers a callback that fires whenever the visitor's consent changes.
     *
     * If consent already exists on this page load, the callback is called
     * immediately with the current preferences so integrators do not need to
     * separately check getConsent().
     *
     * @param {function} callback - Receives the preferences object on each change.
     * @returns {function} Unsubscribe — call to remove this listener.
     *
     * @example
     * var unsub = window.ComplianceKit.onConsentChange(function (prefs) {
     *   if (prefs.analytics)  { initGoogleAnalytics(); }
     *   if (prefs.marketing)  { initFacebookPixel();   }
     * });
     * // To stop listening:
     * unsub();
     */
    onConsentChange: function (callback) {
      if (typeof callback !== 'function') {
        return function () {};
      }
      _ckCallbacks.push(callback);

      // Fire immediately if consent already exists (catch-up for late registrations)
      if (window.CK_CONSENT) {
        try {
          callback(window.CK_CONSENT);
        } catch (e) {
          console.error('ComplianceKit: onConsentChange callback error', e);
        }
      }

      // Return an unsubscribe function
      return function () {
        var idx = _ckCallbacks.indexOf(callback);
        if (idx !== -1) _ckCallbacks.splice(idx, 1);
      };
    },

    // Internal — exposed for WordPress footer link and testing.
    // Not part of the public API contract; may change without notice.
    _callbacks: _ckCallbacks,
  };
  // ─────────────────────────────────────────────────────────────────────────

  function getVisitorId() {
    var id = localStorage.getItem(CK_VISITOR_KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem(CK_VISITOR_KEY, id);
    }
    return id;
  }

  function getStoredConsent() {
    try {
      var s = localStorage.getItem(CK_STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }

  // ── Google Consent Mode v2 (D1) ───────────────────────────────────────────
  function gtagConsent(type, params) {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag('consent', type, params);
  }
  function setDefaultGtagConsent() {
    gtagConsent('default', { 'ad_storage': 'denied', 'ad_user_data': 'denied', 'ad_personalization': 'denied', 'analytics_storage': 'denied' });
  }
  function updateGtagConsent(prefs) {
    gtagConsent('update', {
      'ad_storage':         prefs.marketing ? 'granted' : 'denied',
      'ad_user_data':       prefs.marketing ? 'granted' : 'denied',
      'ad_personalization': prefs.marketing ? 'granted' : 'denied',
      'analytics_storage':  prefs.analytics ? 'granted' : 'denied'
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Persist consent to localStorage, update window.CK_CONSENT, fire all
   * registered onConsentChange callbacks, then POST to the API.
   *
   * window.CK_CONSENT is set here (single source of truth) so getConsent()
   * returns the correct value immediately when callbacks run.
   */
  function saveConsent(preferences, consentModeV2, consentMethod) {
    var record = { preferences: preferences, timestamp: Date.now() };
    if (consentModeV2) {
      record.consentModeV2 = true;
      updateGtagConsent(preferences);
    }
    localStorage.setItem(CK_STORAGE_KEY, JSON.stringify(record));

    // Update the in-memory state before firing callbacks so getConsent() is
    // correct inside any callback that calls it.
    window.CK_CONSENT = preferences;

    // Fire all registered onConsentChange listeners.
    // Use a snapshot of the array so that unsubscribing inside a callback is safe.
    var snapshot = _ckCallbacks.slice();
    for (var ci = 0; ci < snapshot.length; ci++) {
      try {
        snapshot[ci](preferences);
      } catch (e) {
        console.error('ComplianceKit: onConsentChange callback error', e);
      }
    }

    // POST to API — fire-and-forget, never blocks the user
    fetch(CK_API_URL + '/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId(), preferences: preferences, consentMethod: consentMethod })
    }).catch(function () {});
  }

  // ── Restore returning visitor state ───────────────────────────────────────
  // Synchronous: read stored consent so getConsent() works immediately,
  // and fire gtag update for returning visitors without waiting for the fetch.
  var existingConsent = getStoredConsent();
  if (existingConsent) {
    window.CK_CONSENT = existingConsent.preferences;
    if (existingConsent.consentModeV2) { updateGtagConsent(existingConsent.preferences); }
  }

  // Always fetch config — needed to render the withdrawal button on return visits (A4).
  fetch(CK_API_URL + '/config')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.error) return;

      // Store config so openSettings() can use it at any point after this.
      _ckConfig        = data.config;
      _ckConsentModeV2 = data.consentModeV2 || false;

      injectStyles(data.config);

      if (existingConsent) {
        createWithdrawalButton(data.config, data.consentModeV2);
        // Honour a pending openSettings() call made before config arrived.
        // Only for returning visitors — first-time visitors will see the banner.
        if (_ckPendingOpenSettings) {
          _ckPendingOpenSettings = false;
          openSettingsModal(data.config, data.consentModeV2);
        }
      } else {
        if (data.consentModeV2) { setDefaultGtagConsent(); }
        createBanner(data.config, data.privacyPolicyUrl, data.cookiePolicyUrl, data.consentModeV2);
        _ckPendingOpenSettings = false; // first-time visitor — banner handles initial choice
      }
    })
    .catch(function (err) { console.error('ComplianceKit: Failed to load config', err); });

  // ── Withdrawal button (A4 — GDPR Article 7(3)) ───────────────────────────
  function createWithdrawalButton(config, consentModeV2) {
    if (document.getElementById('ck-manage-btn')) return;
    var pos = config.withdrawalButtonPosition || 'bottom-right';
    var btn = document.createElement('button');
    btn.id = 'ck-manage-btn';
    btn.setAttribute('aria-label', 'Manage Cookie Preferences');
    btn.textContent = 'Cookie Preferences';
    btn.style.cssText =
      'position:fixed;z-index:999998;bottom:16px;' +
      (pos === 'bottom-left' ? 'left:16px;' : 'right:16px;') +
      'background:' + config.primaryColor + ';color:' + config.textColor + ';' +
      'border:none;border-radius:20px;padding:8px 16px;font-size:13px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
      'cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:opacity 0.2s;';
    btn.addEventListener('mouseenter', function () { btn.style.opacity = '0.85'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '1'; });
    btn.addEventListener('click', function () { openSettingsModal(config, consentModeV2); });
    document.body.appendChild(btn);
  }

  function openSettingsModal(config, consentModeV2) {
    if (document.getElementById('ck-modal-overlay')) return;
    var prefs = window.CK_CONSENT || { necessary: true, analytics: false, marketing: false, functional: false };

    var overlay = document.createElement('div');
    overlay.id = 'ck-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Cookie Preferences');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;';

    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;padding:24px;width:90%;max-width:420px;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;color:#1f2937;';
    box.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
        '<strong style="font-size:16px;">Cookie Preferences</strong>' +
        '<button id="ck-modal-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280;line-height:1;" aria-label="Close">\u00d7</button>' +
      '</div>' +
      '<p style="margin:0 0 16px;font-size:13px;color:#6b7280;">You can update your preferences at any time. Changes take effect immediately.</p>' +
      '<div class="ck-setting"><div class="ck-setting__info"><h5>Necessary</h5><p>Required for the website to function</p></div><label class="ck-toggle"><input type="checkbox" checked disabled><span class="ck-toggle__slider"></span></label></div>' +
      '<div class="ck-setting"><div class="ck-setting__info"><h5>Analytics</h5><p>Help us improve our website</p></div><label class="ck-toggle"><input type="checkbox" id="ck-m-analytics"' + (prefs.analytics ? ' checked' : '') + '><span class="ck-toggle__slider"></span></label></div>' +
      '<div class="ck-setting"><div class="ck-setting__info"><h5>Marketing</h5><p>Personalised advertisements</p></div><label class="ck-toggle"><input type="checkbox" id="ck-m-marketing"' + (prefs.marketing ? ' checked' : '') + '><span class="ck-toggle__slider"></span></label></div>' +
      '<div class="ck-setting" style="border-bottom:none;"><div class="ck-setting__info"><h5>Functional</h5><p>Enhanced functionality and personalisation</p></div><label class="ck-toggle"><input type="checkbox" id="ck-m-functional"' + (prefs.functional ? ' checked' : '') + '><span class="ck-toggle__slider"></span></label></div>' +
      '<button id="ck-modal-save" class="ck-save-prefs" style="cursor:pointer;">Save Preferences</button>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    document.getElementById('ck-modal-close').addEventListener('click', function () { overlay.remove(); });
    document.getElementById('ck-modal-save').addEventListener('click', function () {
      var newPrefs = {
        necessary:  true,
        analytics:  document.getElementById('ck-m-analytics').checked,
        marketing:  document.getElementById('ck-m-marketing').checked,
        functional: document.getElementById('ck-m-functional').checked
      };
      saveConsent(newPrefs, consentModeV2, 'custom');
      overlay.remove();
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  function createBanner(config, privacyPolicyUrl, cookiePolicyUrl, consentModeV2) {
    var banner = document.createElement('div');
    banner.id = 'ck-cookie-banner';
    banner.className = 'ck-banner ck-banner--' + config.position + ' ck-banner--' + config.animation;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = getBannerHTML(config, privacyPolicyUrl, cookiePolicyUrl);
    document.body.appendChild(banner);
    setTimeout(function () { banner.classList.add('ck-banner--visible'); }, 100);

    banner.querySelector('.ck-accept-all').addEventListener('click', function () {
      var prefs = { necessary: true, analytics: true, marketing: true, functional: true };
      saveConsent(prefs, consentModeV2, 'accept_all');
      // NOTE: window.CK_CONSENT is set inside saveConsent() — do not set again here.
      hideBanner(banner, function () { createWithdrawalButton(config, consentModeV2); });
    });

    banner.querySelector('.ck-reject-all').addEventListener('click', function () {
      var prefs = { necessary: true, analytics: false, marketing: false, functional: false };
      saveConsent(prefs, consentModeV2, 'reject_all');
      hideBanner(banner, function () { createWithdrawalButton(config, consentModeV2); });
    });

    var customizeBtn = banner.querySelector('.ck-customize');
    var settingsPanel = banner.querySelector('.ck-settings');
    var mainPanel = banner.querySelector('.ck-main');

    if (customizeBtn && settingsPanel) {
      customizeBtn.addEventListener('click', function () {
        mainPanel.style.display = 'none';
        settingsPanel.style.display = 'block';
      });
      banner.querySelector('.ck-back').addEventListener('click', function () {
        settingsPanel.style.display = 'none';
        mainPanel.style.display = 'block';
      });
      banner.querySelector('.ck-save-prefs').addEventListener('click', function () {
        var prefs = {
          necessary:  true,
          analytics:  banner.querySelector('#ck-analytics').checked,
          marketing:  banner.querySelector('#ck-marketing').checked,
          functional: banner.querySelector('#ck-functional').checked
        };
        saveConsent(prefs, consentModeV2, 'custom');
        hideBanner(banner, function () { createWithdrawalButton(config, consentModeV2); });
      });
    }
  }

  function hideBanner(banner, callback) {
    banner.classList.remove('ck-banner--visible');
    setTimeout(function () { banner.remove(); if (callback) callback(); }, 300);
  }

  function injectStyles(config) {
    if (document.getElementById('ck-styles')) return;
    var style = document.createElement('style');
    style.id = 'ck-styles';
    style.textContent = getBannerStyles(config);
    document.head.appendChild(style);
  }

  function getBannerStyles(config) {
    var bgColor = config.theme === 'dark' ? '#1f2937' : '#ffffff';
    var textColor = config.theme === 'dark' ? '#f9fafb' : '#1f2937';
    var borderRadius = config.buttonStyle === 'pill' ? '9999px' : config.buttonStyle === 'square' ? '0' : '6px';
    return `
      .ck-banner {
        position: fixed; z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px; line-height: 1.5;
        background: ${bgColor}; color: ${textColor};
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, opacity 0.3s ease; opacity: 0;
      }
      .ck-banner--visible { opacity: 1; }
      .ck-banner--bottom { bottom: 0; left: 0; right: 0; transform: translateY(100%); }
      .ck-banner--bottom.ck-banner--visible { transform: translateY(0); }
      .ck-banner--top { top: 0; left: 0; right: 0; transform: translateY(-100%); }
      .ck-banner--top.ck-banner--visible { transform: translateY(0); }
      .ck-banner--center { top: 50%; left: 50%; transform: translate(-50%,-50%) scale(0.9); max-width: 500px; border-radius: 12px; }
      .ck-banner--center.ck-banner--visible { transform: translate(-50%,-50%) scale(1); }
      .ck-banner__content { padding: 16px 24px; max-width: 1200px; margin: 0 auto; }
      .ck-banner p { margin: 0 0 12px 0; }
      .ck-banner__buttons { display: flex; flex-wrap: wrap; gap: 8px; }
      .ck-banner button { padding: 10px 20px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; border-radius: ${borderRadius}; transition: opacity 0.2s; }
      .ck-banner button:hover { opacity: 0.9; }
      .ck-accept-all { background: ${config.primaryColor}; color: ${config.textColor}; }
      .ck-reject-all { background: transparent; border: 1px solid ${config.primaryColor} !important; color: ${config.theme === 'dark' ? '#f9fafb' : config.primaryColor}; }
      .ck-customize { background: transparent; color: ${config.theme === 'dark' ? '#f9fafb' : config.primaryColor}; }
      .ck-banner__links { margin-top: 8px; font-size: 12px; opacity: 0.7; }
      .ck-banner__links a { color: inherit; }
      .ck-settings { display: none; }
      .ck-settings__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .ck-settings__header h4 { margin: 0; font-size: 16px; }
      .ck-back { background: transparent !important; padding: 4px !important; }
      .ck-setting { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(128,128,128,0.2); }
      .ck-setting:last-child { border-bottom: none; }
      .ck-setting__info h5 { margin: 0 0 4px 0; font-size: 14px; }
      .ck-setting__info p { margin: 0; font-size: 12px; opacity: 0.7; }
      .ck-toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
      .ck-toggle input { opacity: 0; width: 0; height: 0; }
      .ck-toggle__slider { position: absolute; cursor: pointer; inset: 0; background: #ccc; border-radius: 24px; transition: 0.3s; }
      .ck-toggle__slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
      .ck-toggle input:checked + .ck-toggle__slider { background: ${config.primaryColor}; }
      .ck-toggle input:checked + .ck-toggle__slider:before { transform: translateX(20px); }
      .ck-toggle input:disabled + .ck-toggle__slider { opacity: 0.6; cursor: not-allowed; }
      .ck-save-prefs { width: 100%; margin-top: 16px; padding: 10px; border: none; border-radius: ${borderRadius}; background: ${config.primaryColor}; color: ${config.textColor}; font-size: 14px; font-weight: 500; }
      ${config.customCss || ''}
    `;
  }

  function getBannerHTML(config, privacyPolicyUrl, cookiePolicyUrl) {
    var privacyLink = privacyPolicyUrl || '/privacy-policy';
    var cookieLink  = cookiePolicyUrl  || '/cookie-policy';
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
            <a href="${privacyLink}">Privacy Policy</a> \u2022 <a href="${cookieLink}">Cookie Policy</a>
          </div>
        </div>
        <div class="ck-settings">
          <div class="ck-settings__header">
            <h4>Cookie Preferences</h4>
            <button class="ck-back">\u00d7</button>
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
})();
