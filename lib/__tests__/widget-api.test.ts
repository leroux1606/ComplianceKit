// @vitest-environment jsdom
/**
 * Tests for window.ComplianceKit public API (D6).
 *
 * The widget is a plain-JS IIFE — it's evaluated via eval() in jsdom so we
 * can exercise the real code rather than a mock.  document.currentScript is
 * null in eval context, so the widget's fallback (search for script tags by
 * src pattern) is used instead: we add a <script> element to the document
 * before each eval.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const WIDGET_SOURCE = fs.readFileSync(
  path.resolve(__dirname, "../../public/widget.js"),
  "utf-8"
);

const EMBED_CODE    = "TESTCODE123";
const STORAGE_KEY   = `ck_consent_${EMBED_CODE}`;
const API_ORIGIN    = "https://compliancekit.com";
const API_BASE      = `${API_ORIGIN}/api/widget/${EMBED_CODE}`;

const MOCK_CONFIG = {
  primaryColor: "#7c3aed",
  textColor: "#ffffff",
  theme: "light",
  position: "bottom",
  buttonStyle: "rounded",
  animation: "slide",
  withdrawalButtonPosition: "bottom-right",
  customCss: "",
};

const MOCK_CONFIG_RESPONSE = {
  config: MOCK_CONFIG,
  consentModeV2: false,
  privacyPolicyUrl: "/privacy",
  cookiePolicyUrl: "/cookie-policy",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupMockFetch(configResponse = MOCK_CONFIG_RESPONSE) {
  vi.spyOn(globalThis, "fetch").mockImplementation((url: RequestInfo | URL) => {
    const u = url.toString();
    if (u.includes("/config")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(configResponse),
      } as Response);
    }
    if (u.includes("/consent")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    }
    return Promise.reject(new Error(`Unexpected fetch: ${u}`));
  });
}

/**
 * Inject a <script> tag into the document that the widget's fallback
 * detection will find (it looks for src containing "widget.js").
 * Returns the element so tests can modify it if needed.
 */
function injectScriptTag(embedCode = EMBED_CODE): HTMLScriptElement {
  const script = document.createElement("script");
  script.src = `${API_ORIGIN}/widget.js`;
  script.setAttribute("data-embed-code", embedCode);
  document.head.appendChild(script);
  return script;
}

/**
 * Load and evaluate the widget IIFE inside the current jsdom context.
 * Optionally seeds localStorage with an existing consent record first.
 */
function loadWidget(existingConsent?: {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
} | null) {
  if (existingConsent) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ preferences: existingConsent, timestamp: Date.now() })
    );
  }
  injectScriptTag();
  // eslint-disable-next-line no-eval
  eval(WIDGET_SOURCE);
}

/** Wait for an element matching the selector to appear in the document. */
async function waitForElement(selector: string, timeout = 2000): Promise<Element> {
  return vi.waitFor(
    () => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      return el;
    },
    { timeout }
  );
}

// ---------------------------------------------------------------------------
// Per-test cleanup
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Reset DOM
  document.head.innerHTML = "";
  document.body.innerHTML = "";

  // Reset globals
  delete (window as any).ComplianceKit;
  delete (window as any).CK_CONSENT;
  delete (window as any).dataLayer;
  delete (window as any).gtag;

  // Reset storage
  localStorage.clear();

  vi.clearAllMocks();
  setupMockFetch();
});

// ---------------------------------------------------------------------------
// 1. Initialisation
// ---------------------------------------------------------------------------

describe("initialisation", () => {
  it("exposes window.ComplianceKit synchronously after script evaluation", () => {
    loadWidget();
    expect((window as any).ComplianceKit).toBeDefined();
    expect(typeof (window as any).ComplianceKit).toBe("object");
  });

  it("exposes getConsent, openSettings, onConsentChange", () => {
    loadWidget();
    const CK = (window as any).ComplianceKit;
    expect(typeof CK.getConsent).toBe("function");
    expect(typeof CK.openSettings).toBe("function");
    expect(typeof CK.onConsentChange).toBe("function");
  });

  it("exposes a version string", () => {
    loadWidget();
    const { version } = (window as any).ComplianceKit;
    expect(typeof version).toBe("string");
    expect(version.length).toBeGreaterThan(0);
  });

  it("logs a warning and does not expose API when embed code is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Script tag without data-embed-code
    const script = document.createElement("script");
    script.src = `${API_ORIGIN}/widget.js`;
    document.head.appendChild(script);
    eval(WIDGET_SOURCE); // eslint-disable-line no-eval
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("No embed code"));
    // API should NOT be set when embed code is missing
    expect((window as any).ComplianceKit).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 2. getConsent()
// ---------------------------------------------------------------------------

describe("getConsent()", () => {
  it("returns null when no consent has been recorded", () => {
    loadWidget();
    expect((window as any).ComplianceKit.getConsent()).toBeNull();
  });

  it("returns existing preferences from localStorage on first call", () => {
    const prefs = { necessary: true, analytics: true, marketing: false, functional: false };
    loadWidget(prefs);
    expect((window as any).ComplianceKit.getConsent()).toEqual(prefs);
  });

  it("returns all four consent categories", () => {
    const prefs = { necessary: true, analytics: true, marketing: true, functional: true };
    loadWidget(prefs);
    const consent = (window as any).ComplianceKit.getConsent();
    expect(consent).toHaveProperty("necessary", true);
    expect(consent).toHaveProperty("analytics", true);
    expect(consent).toHaveProperty("marketing", true);
    expect(consent).toHaveProperty("functional", true);
  });

  it("returns a reject-all preference correctly", () => {
    const prefs = { necessary: true, analytics: false, marketing: false, functional: false };
    loadWidget(prefs);
    const consent = (window as any).ComplianceKit.getConsent();
    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
    expect(consent.functional).toBe(false);
    expect(consent.necessary).toBe(true); // necessary is always true
  });
});

// ---------------------------------------------------------------------------
// 3. onConsentChange(callback)
// ---------------------------------------------------------------------------

describe("onConsentChange(callback)", () => {
  it("returns an unsubscribe function", () => {
    loadWidget();
    const unsub = (window as any).ComplianceKit.onConsentChange(() => {});
    expect(typeof unsub).toBe("function");
  });

  it("does NOT call callback immediately when no prior consent exists", () => {
    loadWidget();
    const cb = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it("calls callback immediately when prior consent exists (catch-up pattern)", () => {
    const prefs = { necessary: true, analytics: true, marketing: false, functional: false };
    loadWidget(prefs);
    const cb = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb);
    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith(prefs);
  });

  it("multiple callbacks are all called immediately on catch-up", () => {
    const prefs = { necessary: true, analytics: true, marketing: false, functional: false };
    loadWidget(prefs);
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb1);
    (window as any).ComplianceKit.onConsentChange(cb2);
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it("does not throw when passed null", () => {
    loadWidget();
    expect(() => (window as any).ComplianceKit.onConsentChange(null)).not.toThrow();
  });

  it("does not throw when passed a non-function", () => {
    loadWidget();
    expect(() => (window as any).ComplianceKit.onConsentChange("not-a-fn")).not.toThrow();
    expect(() => (window as any).ComplianceKit.onConsentChange(42)).not.toThrow();
  });

  it("returns a no-op unsubscribe when passed a non-function", () => {
    loadWidget();
    const unsub = (window as any).ComplianceKit.onConsentChange(null);
    expect(() => unsub()).not.toThrow();
  });

  it("unsubscribe removes the listener — subsequent changes do not call it", async () => {
    loadWidget();
    const cb = vi.fn();
    const unsub = (window as any).ComplianceKit.onConsentChange(cb);
    unsub();

    // Wait for banner, then accept — callback should NOT fire
    await waitForElement(".ck-accept-all");
    (document.querySelector(".ck-accept-all") as HTMLButtonElement).click();
    expect(cb).not.toHaveBeenCalled();
  });

  it("callbacks fire when visitor clicks Accept All on the banner", async () => {
    loadWidget();
    const cb = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb);

    await waitForElement(".ck-accept-all");
    (document.querySelector(".ck-accept-all") as HTMLButtonElement).click();

    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  });

  it("callbacks fire when visitor clicks Reject All on the banner", async () => {
    loadWidget();
    const cb = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb);

    await waitForElement(".ck-reject-all");
    (document.querySelector(".ck-reject-all") as HTMLButtonElement).click();

    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  });

  it("callbacks fire when visitor saves custom preferences via banner", async () => {
    loadWidget();
    const cb = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb);

    // Open customize panel
    await waitForElement(".ck-customize");
    (document.querySelector(".ck-customize") as HTMLButtonElement).click();

    // Check analytics, uncheck marketing and functional
    const analyticsBox = document.getElementById("ck-analytics") as HTMLInputElement;
    analyticsBox.checked = true;

    // Save
    (document.querySelector(".ck-save-prefs") as HTMLButtonElement).click();

    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ necessary: true, analytics: true })
    );
  });

  it("getConsent() returns updated preferences after consent change", async () => {
    loadWidget();
    await waitForElement(".ck-accept-all");
    (document.querySelector(".ck-accept-all") as HTMLButtonElement).click();

    const consent = (window as any).ComplianceKit.getConsent();
    expect(consent).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  });

  it("a callback that throws does not prevent other callbacks from firing", async () => {
    loadWidget();

    const badCb  = vi.fn().mockImplementation(() => { throw new Error("oops"); });
    const goodCb = vi.fn();

    (window as any).ComplianceKit.onConsentChange(badCb);
    (window as any).ComplianceKit.onConsentChange(goodCb);

    await waitForElement(".ck-accept-all");
    (document.querySelector(".ck-accept-all") as HTMLButtonElement).click();

    expect(goodCb).toHaveBeenCalledOnce();
  });

  it("callbacks receive updated prefs when consent is changed via modal Save", async () => {
    const prefs = { necessary: true, analytics: false, marketing: false, functional: false };
    loadWidget(prefs);

    // Wait for withdrawal button (returning visitor)
    await waitForElement("#ck-manage-btn");
    (document.getElementById("ck-manage-btn") as HTMLButtonElement).click();

    // Modal should be open
    await waitForElement("#ck-modal-overlay");

    const cb = vi.fn();
    (window as any).ComplianceKit.onConsentChange(cb);
    // Clear the immediate catch-up call
    cb.mockClear();

    // Enable analytics in modal
    const analyticsToggle = document.getElementById("ck-m-analytics") as HTMLInputElement;
    analyticsToggle.checked = true;
    (document.getElementById("ck-modal-save") as HTMLButtonElement).click();

    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ analytics: true })
    );
  });
});

// ---------------------------------------------------------------------------
// 4. openSettings()
// ---------------------------------------------------------------------------

describe("openSettings()", () => {
  it("does not throw when called before config has loaded", () => {
    loadWidget();
    expect(() => (window as any).ComplianceKit.openSettings()).not.toThrow();
  });

  it("does not open a modal for first-time visitors before config loads", () => {
    loadWidget(); // no existing consent
    (window as any).ComplianceKit.openSettings();
    expect(document.getElementById("ck-modal-overlay")).toBeNull();
  });

  it("opens the modal immediately for returning visitors (config already loaded)", async () => {
    const prefs = { necessary: true, analytics: true, marketing: false, functional: false };
    loadWidget(prefs);

    // Wait for config to load and withdrawal button to appear
    await waitForElement("#ck-manage-btn");

    (window as any).ComplianceKit.openSettings();

    expect(document.getElementById("ck-modal-overlay")).not.toBeNull();
  });

  it("pre-populates modal with current preferences when opened via API", async () => {
    const prefs = { necessary: true, analytics: true, marketing: false, functional: true };
    loadWidget(prefs);

    await waitForElement("#ck-manage-btn");
    (window as any).ComplianceKit.openSettings();

    await waitForElement("#ck-m-analytics");
    expect((document.getElementById("ck-m-analytics") as HTMLInputElement).checked).toBe(true);
    expect((document.getElementById("ck-m-marketing") as HTMLInputElement).checked).toBe(false);
    expect((document.getElementById("ck-m-functional") as HTMLInputElement).checked).toBe(true);
  });

  it("is a no-op if the modal is already open — does not open a second modal", async () => {
    const prefs = { necessary: true, analytics: false, marketing: false, functional: false };
    loadWidget(prefs);

    await waitForElement("#ck-manage-btn");
    (window as any).ComplianceKit.openSettings();
    (window as any).ComplianceKit.openSettings(); // second call

    expect(document.querySelectorAll("#ck-modal-overlay").length).toBe(1);
  });

  it("queues openSettings() and executes it when config arrives (returning visitor)", async () => {
    // Let fetch be slow so we can call openSettings() before it resolves
    let resolveConfig!: (v: unknown) => void;
    vi.spyOn(globalThis, "fetch").mockImplementation((url: RequestInfo | URL) => {
      const u = url.toString();
      if (u.includes("/config")) {
        return new Promise<Response>((resolve) => {
          resolveConfig = () =>
            resolve({
              ok: true,
              json: () => Promise.resolve(MOCK_CONFIG_RESPONSE),
            } as Response);
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });

    // Existing consent so widget will show withdrawal button (not banner)
    const prefs = { necessary: true, analytics: false, marketing: false, functional: false };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ preferences: prefs, timestamp: Date.now() })
    );
    injectScriptTag();
    eval(WIDGET_SOURCE); // eslint-disable-line no-eval

    // Call openSettings() while config is still loading
    (window as any).ComplianceKit.openSettings();

    // Modal NOT open yet
    expect(document.getElementById("ck-modal-overlay")).toBeNull();

    // Resolve the config fetch
    resolveConfig();

    // Now the modal should open automatically
    await waitForElement("#ck-modal-overlay");
    expect(document.getElementById("ck-modal-overlay")).not.toBeNull();
  });
});
