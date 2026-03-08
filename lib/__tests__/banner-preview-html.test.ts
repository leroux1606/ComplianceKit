// @vitest-environment node
/**
 * Tests for lib/banner-preview-html.ts — pure functions that generate the
 * srcdoc HTML for the live banner preview component (E4).
 *
 * All functions are pure TypeScript (no DOM) so they run in the node env.
 */

import { describe, it, expect } from "vitest";
import {
  generateBannerCss,
  generateBannerHtml,
  generateWithdrawalButtonHtml,
  generatePreviewDocument,
  escapeHtml,
} from "../banner-preview-html";
import type { BannerConfigInput } from "../validations";

// ---------------------------------------------------------------------------
// Test config fixtures
// ---------------------------------------------------------------------------

const BASE_CONFIG: BannerConfigInput = {
  theme: "light",
  position: "bottom",
  primaryColor: "#7c3aed",
  textColor: "#ffffff",
  buttonStyle: "rounded",
  animation: "slide",
  customCss: "",
  privacyPolicyUrl: "",
  cookiePolicyUrl: "",
  consentModeV2: false,
  withdrawalButtonPosition: "bottom-right",
};

const darkConfig: BannerConfigInput = { ...BASE_CONFIG, theme: "dark" };
const pillConfig: BannerConfigInput = { ...BASE_CONFIG, buttonStyle: "pill" };
const squareConfig: BannerConfigInput = { ...BASE_CONFIG, buttonStyle: "square" };
const topConfig: BannerConfigInput = { ...BASE_CONFIG, position: "top" };
const centerConfig: BannerConfigInput = { ...BASE_CONFIG, position: "center" };
const leftBtnConfig: BannerConfigInput = { ...BASE_CONFIG, withdrawalButtonPosition: "bottom-left" };

// ---------------------------------------------------------------------------
// 1. escapeHtml
// ---------------------------------------------------------------------------

describe("escapeHtml()", () => {
  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("/privacy-policy")).toBe("/privacy-policy");
    expect(escapeHtml("https://example.com/privacy")).toBe("https://example.com/privacy");
  });

  it("escapes < and >", () => {
    const out = escapeHtml("<script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    const out = escapeHtml('say "hello"');
    expect(out).not.toContain('"');
    expect(out).toContain("&quot;");
  });

  it("escapes ampersand", () => {
    const out = escapeHtml("foo&bar");
    expect(out).toContain("&amp;");
    expect(out).not.toContain("foo&bar");
  });

  it("escapes single quotes", () => {
    const out = escapeHtml("it's fine");
    expect(out).toContain("&#039;");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 2. generateBannerCss()
// ---------------------------------------------------------------------------

describe("generateBannerCss()", () => {
  it("includes the primary color for .ck-accept-all", () => {
    const css = generateBannerCss(BASE_CONFIG);
    expect(css).toContain("#7c3aed");
  });

  it("includes the text color for .ck-accept-all", () => {
    const css = generateBannerCss(BASE_CONFIG);
    expect(css).toContain("#ffffff");
  });

  it("uses white background for light theme", () => {
    const css = generateBannerCss(BASE_CONFIG);
    expect(css).toContain("#ffffff");
  });

  it("uses dark background (#1f2937) for dark theme", () => {
    const css = generateBannerCss(darkConfig);
    expect(css).toContain("#1f2937");
  });

  it("uses 9999px border-radius for pill button style", () => {
    const css = generateBannerCss(pillConfig);
    expect(css).toContain("9999px");
  });

  it("uses 0 border-radius for square button style", () => {
    const css = generateBannerCss(squareConfig);
    // Should contain exactly radius 0 (not 0px in all contexts, just 0 or 0px)
    expect(css).toMatch(/border-radius:\s*0[^.]/);
  });

  it("uses 6px border-radius for rounded button style (default)", () => {
    const css = generateBannerCss(BASE_CONFIG);
    expect(css).toContain("6px");
  });

  it("appends customCss at the end", () => {
    const cfg = { ...BASE_CONFIG, customCss: ".ck-banner { font-size: 16px; }" };
    const css = generateBannerCss(cfg);
    expect(css).toContain(".ck-banner { font-size: 16px; }");
  });

  it("does not error when customCss is empty", () => {
    expect(() => generateBannerCss(BASE_CONFIG)).not.toThrow();
  });

  it("includes positioning class for bottom", () => {
    const css = generateBannerCss(BASE_CONFIG);
    expect(css).toContain("ck-banner--bottom");
  });

  it("includes positioning class for top", () => {
    const css = generateBannerCss(topConfig);
    expect(css).toContain("ck-banner--top");
  });

  it("includes positioning class for center", () => {
    const css = generateBannerCss(centerConfig);
    expect(css).toContain("ck-banner--center");
  });

  it("returns a non-empty string", () => {
    const css = generateBannerCss(BASE_CONFIG);
    expect(typeof css).toBe("string");
    expect(css.length).toBeGreaterThan(100);
  });
});

// ---------------------------------------------------------------------------
// 3. generateBannerHtml()
// ---------------------------------------------------------------------------

describe("generateBannerHtml()", () => {
  it("contains Accept All button", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("Accept All");
  });

  it("contains Reject All button", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("Reject All");
  });

  it("contains Customize button", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("Customize");
  });

  it("contains all four cookie categories", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("Necessary");
    expect(html).toContain("Analytics");
    expect(html).toContain("Marketing");
    expect(html).toContain("Functional");
  });

  it("includes the provided privacy policy URL", () => {
    const html = generateBannerHtml(BASE_CONFIG, "/my-privacy", "/my-cookies");
    expect(html).toContain("/my-privacy");
  });

  it("includes the provided cookie policy URL", () => {
    const html = generateBannerHtml(BASE_CONFIG, "/my-privacy", "/my-cookies");
    expect(html).toContain("/my-cookies");
  });

  it("falls back to /privacy-policy when no privacy URL given", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("/privacy-policy");
  });

  it("falls back to /cookie-policy when no cookie URL given", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("/cookie-policy");
  });

  it("escapes XSS in privacy policy URL", () => {
    const html = generateBannerHtml(BASE_CONFIG, '"><script>alert(1)</script>', "");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("escapes XSS in cookie policy URL", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", '"><script>alert(1)</script>');
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("has a Save Preferences button inside settings panel", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("Save Preferences");
  });

  it("has the correct CSS classes for banner and buttons", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain("ck-accept-all");
    expect(html).toContain("ck-reject-all");
    expect(html).toContain("ck-customize");
    expect(html).toContain("ck-settings");
    expect(html).toContain("ck-main");
  });

  it("checkbox IDs match widget.js (ck-analytics, ck-marketing, ck-functional)", () => {
    const html = generateBannerHtml(BASE_CONFIG, "", "");
    expect(html).toContain('id="ck-analytics"');
    expect(html).toContain('id="ck-marketing"');
    expect(html).toContain('id="ck-functional"');
  });
});

// ---------------------------------------------------------------------------
// 4. generateWithdrawalButtonHtml()
// ---------------------------------------------------------------------------

describe("generateWithdrawalButtonHtml()", () => {
  it("contains Cookie Preferences text", () => {
    const html = generateWithdrawalButtonHtml(BASE_CONFIG);
    expect(html).toContain("Cookie Preferences");
  });

  it("includes the primary color", () => {
    const html = generateWithdrawalButtonHtml(BASE_CONFIG);
    expect(html).toContain("#7c3aed");
  });

  it("includes the text color", () => {
    const html = generateWithdrawalButtonHtml(BASE_CONFIG);
    expect(html).toContain("#ffffff");
  });

  it("positions to the right when withdrawalButtonPosition is bottom-right", () => {
    const html = generateWithdrawalButtonHtml(BASE_CONFIG);
    expect(html).toContain("right:");
    expect(html).not.toContain("left:16px");
  });

  it("positions to the left when withdrawalButtonPosition is bottom-left", () => {
    const html = generateWithdrawalButtonHtml(leftBtnConfig);
    expect(html).toContain("left:16px");
  });

  it("has id=ck-manage-btn matching the widget", () => {
    const html = generateWithdrawalButtonHtml(BASE_CONFIG);
    expect(html).toContain('id="ck-manage-btn"');
  });

  it("returns a non-empty string", () => {
    expect(generateWithdrawalButtonHtml(BASE_CONFIG).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 5. generatePreviewDocument()
// ---------------------------------------------------------------------------

describe("generatePreviewDocument()", () => {
  it("returns a string starting with <!DOCTYPE html>", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    expect(doc.trim().startsWith("<!DOCTYPE html>")).toBe(true);
  });

  it("contains <html>, <head>, and <body> tags", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    expect(doc).toContain("<html");
    expect(doc).toContain("<head>");
    expect(doc).toContain("<body");
  });

  it("includes generated CSS inside a <style> tag", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    expect(doc).toContain("<style");
    expect(doc).toContain("ck-banner");
  });

  it("banner panel: main panel visible, settings panel hidden", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    // The banner is present and main content is shown
    expect(doc).toContain("Accept All");
    expect(doc).toContain("ck-cookie-banner");
    // Settings panel must exist but be hidden (display:none in CSS or inline)
    expect(doc).toContain("ck-settings");
  });

  it("settings panel: settings content is visible (display:block override)", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "settings");
    // Settings content must be shown
    expect(doc).toContain("Necessary");
    expect(doc).toContain("Analytics");
    expect(doc).toContain("Marketing");
    expect(doc).toContain("Functional");
    // The settings panel must have the visible class applied
    expect(doc).toContain("ck-settings--visible");
  });

  it("withdrawal panel: shows the withdrawal button, no main banner", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "withdrawal");
    expect(doc).toContain("Cookie Preferences");
    expect(doc).toContain("ck-manage-btn");
    // Main banner should not be present for this panel
    expect(doc).not.toContain("Accept All");
  });

  it("includes primary color from config in generated CSS", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    expect(doc).toContain("#7c3aed");
  });

  it("includes customCss when provided", () => {
    const cfg = { ...BASE_CONFIG, customCss: "body { background: red; }" };
    const doc = generatePreviewDocument(cfg, "banner");
    expect(doc).toContain("body { background: red; }");
  });

  it("includes fake-website placeholder content in the document", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    // Should have some simulated page content behind the banner
    expect(doc).toContain("ck-preview-bg");
  });

  it("banner has the correct position class for bottom", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    expect(doc).toContain("ck-banner--bottom");
  });

  it("banner has the correct position class for top", () => {
    const doc = generatePreviewDocument(topConfig, "banner");
    expect(doc).toContain("ck-banner--top");
  });

  it("banner has the correct position class for center", () => {
    const doc = generatePreviewDocument(centerConfig, "banner");
    expect(doc).toContain("ck-banner--center");
  });

  it("visible class is added so banner appears without animation delay", () => {
    const doc = generatePreviewDocument(BASE_CONFIG, "banner");
    expect(doc).toContain("ck-banner--visible");
  });
});
