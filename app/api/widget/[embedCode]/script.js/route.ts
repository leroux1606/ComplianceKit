import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ embedCode: string }> }
) {
  const { embedCode } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://compliancekit.com";

  // The widget loader script
  const script = `
(function() {
  'use strict';
  
  var CK_EMBED_CODE = '${embedCode}';
  var CK_API_URL = '${appUrl}/api/widget/' + CK_EMBED_CODE;
  var CK_STORAGE_KEY = 'ck_consent_' + CK_EMBED_CODE;
  var CK_VISITOR_KEY = 'ck_visitor_id';
  
  // Generate or get visitor ID
  function getVisitorId() {
    var visitorId = localStorage.getItem(CK_VISITOR_KEY);
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem(CK_VISITOR_KEY, visitorId);
    }
    return visitorId;
  }
  
  // Get stored consent
  function getStoredConsent() {
    try {
      var stored = localStorage.getItem(CK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }
  
  // Save consent
  function saveConsent(preferences) {
    localStorage.setItem(CK_STORAGE_KEY, JSON.stringify({
      preferences: preferences,
      timestamp: Date.now()
    }));
    
    // Send to server
    fetch(CK_API_URL + '/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        preferences: preferences
      })
    }).catch(function() {});
  }
  
  // Check if consent already given
  var existingConsent = getStoredConsent();
  if (existingConsent) {
    window.CK_CONSENT = existingConsent.preferences;
    return;
  }
  
  // Fetch config and show banner
  fetch(CK_API_URL + '/config')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) return;
      createBanner(data.config, data.websiteId);
    })
    .catch(function(err) {
      console.error('ComplianceKit: Failed to load config', err);
    });
  
  function createBanner(config, websiteId) {
    // Inject styles
    var style = document.createElement('style');
    style.textContent = getBannerStyles(config);
    document.head.appendChild(style);
    
    // Create banner HTML
    var banner = document.createElement('div');
    banner.id = 'ck-cookie-banner';
    banner.className = 'ck-banner ck-banner--' + config.position + ' ck-banner--' + config.animation;
    banner.innerHTML = getBannerHTML(config);
    document.body.appendChild(banner);
    
    // Show banner with animation
    setTimeout(function() {
      banner.classList.add('ck-banner--visible');
    }, 100);
    
    // Event handlers
    banner.querySelector('.ck-accept-all').addEventListener('click', function() {
      var prefs = { necessary: true, analytics: true, marketing: true, functional: true };
      saveConsent(prefs);
      window.CK_CONSENT = prefs;
      hideBanner(banner);
    });
    
    banner.querySelector('.ck-reject-all').addEventListener('click', function() {
      var prefs = { necessary: true, analytics: false, marketing: false, functional: false };
      saveConsent(prefs);
      window.CK_CONSENT = prefs;
      hideBanner(banner);
    });
    
    var customizeBtn = banner.querySelector('.ck-customize');
    var settingsPanel = banner.querySelector('.ck-settings');
    var mainPanel = banner.querySelector('.ck-main');
    
    if (customizeBtn && settingsPanel) {
      customizeBtn.addEventListener('click', function() {
        mainPanel.style.display = 'none';
        settingsPanel.style.display = 'block';
      });
      
      banner.querySelector('.ck-back').addEventListener('click', function() {
        settingsPanel.style.display = 'none';
        mainPanel.style.display = 'block';
      });
      
      banner.querySelector('.ck-save-prefs').addEventListener('click', function() {
        var prefs = {
          necessary: true,
          analytics: banner.querySelector('#ck-analytics').checked,
          marketing: banner.querySelector('#ck-marketing').checked,
          functional: banner.querySelector('#ck-functional').checked
        };
        saveConsent(prefs);
        window.CK_CONSENT = prefs;
        hideBanner(banner);
      });
    }
  }
  
  function hideBanner(banner) {
    banner.classList.remove('ck-banner--visible');
    setTimeout(function() {
      banner.remove();
    }, 300);
  }
  
  function getBannerStyles(config) {
    var bgColor = config.theme === 'dark' ? '#1f2937' : '#ffffff';
    var textColor = config.theme === 'dark' ? '#f9fafb' : '#1f2937';
    var borderRadius = config.buttonStyle === 'pill' ? '9999px' : config.buttonStyle === 'square' ? '0' : '6px';
    
    return \`
      .ck-banner {
        position: fixed;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        background: \${bgColor};
        color: \${textColor};
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 0;
      }
      .ck-banner--visible { opacity: 1; }
      .ck-banner--bottom { bottom: 0; left: 0; right: 0; transform: translateY(100%); }
      .ck-banner--bottom.ck-banner--visible { transform: translateY(0); }
      .ck-banner--top { top: 0; left: 0; right: 0; transform: translateY(-100%); }
      .ck-banner--top.ck-banner--visible { transform: translateY(0); }
      .ck-banner--center { top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); max-width: 500px; border-radius: 12px; }
      .ck-banner--center.ck-banner--visible { transform: translate(-50%, -50%) scale(1); }
      .ck-banner__content { padding: 16px 24px; max-width: 1200px; margin: 0 auto; }
      .ck-banner p { margin: 0 0 12px 0; }
      .ck-banner__buttons { display: flex; flex-wrap: wrap; gap: 8px; }
      .ck-banner button {
        padding: 10px 20px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        border-radius: \${borderRadius};
        transition: opacity 0.2s;
      }
      .ck-banner button:hover { opacity: 0.9; }
      .ck-accept-all { background: \${config.primaryColor}; color: \${config.textColor}; }
      .ck-reject-all { background: transparent; border: 1px solid \${config.primaryColor} !important; color: \${config.theme === 'dark' ? '#f9fafb' : config.primaryColor}; }
      .ck-customize { background: transparent; color: \${config.theme === 'dark' ? '#f9fafb' : config.primaryColor}; }
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
      .ck-toggle { position: relative; width: 44px; height: 24px; }
      .ck-toggle input { opacity: 0; width: 0; height: 0; }
      .ck-toggle__slider {
        position: absolute; cursor: pointer; inset: 0;
        background: #ccc; border-radius: 24px; transition: 0.3s;
      }
      .ck-toggle__slider:before {
        position: absolute; content: ''; height: 18px; width: 18px;
        left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;
      }
      .ck-toggle input:checked + .ck-toggle__slider { background: \${config.primaryColor}; }
      .ck-toggle input:checked + .ck-toggle__slider:before { transform: translateX(20px); }
      .ck-toggle input:disabled + .ck-toggle__slider { opacity: 0.6; cursor: not-allowed; }
      .ck-save-prefs { width: 100%; margin-top: 16px; background: \${config.primaryColor}; color: \${config.textColor}; }
      \${config.customCss || ''}
    \`;
  }
  
  function getBannerHTML(config) {
    return \`
      <div class="ck-banner__content">
        <div class="ck-main">
          <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
          <div class="ck-banner__buttons">
            <button class="ck-accept-all">Accept All</button>
            <button class="ck-reject-all">Reject All</button>
            <button class="ck-customize">Customize</button>
          </div>
          <div class="ck-banner__links">
            <a href="/privacy-policy">Privacy Policy</a> • <a href="/cookie-policy">Cookie Policy</a>
          </div>
        </div>
        <div class="ck-settings">
          <div class="ck-settings__header">
            <h4>Cookie Preferences</h4>
            <button class="ck-back">✕</button>
          </div>
          <div class="ck-setting">
            <div class="ck-setting__info">
              <h5>Necessary</h5>
              <p>Required for the website to function</p>
            </div>
            <label class="ck-toggle">
              <input type="checkbox" checked disabled>
              <span class="ck-toggle__slider"></span>
            </label>
          </div>
          <div class="ck-setting">
            <div class="ck-setting__info">
              <h5>Analytics</h5>
              <p>Help us improve our website</p>
            </div>
            <label class="ck-toggle">
              <input type="checkbox" id="ck-analytics">
              <span class="ck-toggle__slider"></span>
            </label>
          </div>
          <div class="ck-setting">
            <div class="ck-setting__info">
              <h5>Marketing</h5>
              <p>Personalized advertisements</p>
            </div>
            <label class="ck-toggle">
              <input type="checkbox" id="ck-marketing">
              <span class="ck-toggle__slider"></span>
            </label>
          </div>
          <div class="ck-setting">
            <div class="ck-setting__info">
              <h5>Functional</h5>
              <p>Enhanced functionality and personalization</p>
            </div>
            <label class="ck-toggle">
              <input type="checkbox" id="ck-functional">
              <span class="ck-toggle__slider"></span>
            </label>
          </div>
          <button class="ck-save-prefs">Save Preferences</button>
        </div>
      </div>
    \`;
  }
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

