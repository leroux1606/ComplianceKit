# WordPress Plugin Testing — What and Why

This document explains what we are testing, why each test matters, and what would happen if we skip it.

---

## Why test at all?

When you submit a plugin to wordpress.org, their team reviews it manually. They will install it, activate it, and test it themselves. If they find bugs or security problems they will reject it. Testing yourself first means fewer rejections and faster approval.

Also, once real customers install your plugin on their real websites, a bug could break their site. That would damage trust in ComplianceKit.

---

## What is LocalWP?

LocalWP is a program that runs a fake WordPress website on your own computer. It is identical to a real WordPress site but nobody on the internet can see it. It is safe to test, break things, and experiment without affecting any real website.

Your test site is called **ComplianceKitTest** and it only exists on your computer.

---

## The tests explained

### Test 10.1 — Plugin activates without errors
**What:** Install the plugin and click Activate. Does WordPress show a white screen or error?

**Why:** If the plugin has broken PHP code, WordPress shows a fatal error and the whole admin panel breaks. This would immediately fail the wordpress.org review.

**What passed:** The plugin activated cleanly with no errors.

---

### Test 10.2 — Settings page loads
**What:** Go to Settings → ComplianceKit. Does the page load?

**Why:** The plugin adds its own settings page to WordPress. If the PHP code that draws that page has an error, it crashes. The customer would see a blank white page instead of a settings form.

**What passed:** The settings page loaded correctly with all fields showing.

---

### Test 10.3 — Script tag appears when embed code is set
**What:** Type TEST123 in the Embed Code field → Save → open the front-end → View Page Source → look for widget.js.

**Why:** This is the CORE function of the plugin. The entire point is to inject the ComplianceKit script tag into the website's `<head>`. If this does not work, the cookie consent banner will never appear and the plugin is useless.

**What we are looking for in the page source:**
```html
<script src="https://compliancekit.com/widget.js" data-embed-code="TEST123" defer></script>
```

**What passed:** The script tag appeared correctly in the page source.

---

### Test 10.4 — No script tag when embed code is empty
**What:** Clear the embed code → Save → check page source → widget.js should NOT be there.

**Why:** If the plugin injects a broken script tag even when no embed code is set, it would cause JavaScript errors on every page of the customer's website. This would slow down their site and possibly break other things.

**What passed:** No script tag when embed code is empty.

---

### Test 10.5 — Footer link checkbox works
**What:** Check the Footer Link checkbox → Save → front-end should show "Manage Cookie Preferences" link at the bottom. Uncheck → Save → link disappears.

**Why:** GDPR requires that visitors can change their cookie consent at any time. The footer link is one way to let them do this. We need to verify that checking and unchecking the box actually works — both turning it ON and turning it OFF.

Turning it OFF is actually harder to get right in WordPress because HTML forms do not send unchecked checkboxes at all. The plugin has a hidden field trick to handle this. We are verifying that trick works.

**What passed:** Footer link appeared and disappeared correctly.

---

### Test 10.6 — Admin notice only shows on other pages (CURRENT PROBLEM)
**What:** When embed code is empty, a yellow warning notice should appear on every admin page EXCEPT the ComplianceKit settings page itself.

**Why:** The notice says "ComplianceKit is not configured — click here to set it up." If you are already ON the settings page, showing this notice is pointless and looks unprofessional. wordpress.org reviewers will notice this kind of thing.

**Current status:** The notice is still showing on the ComplianceKit settings page. The fix is in the code but has not reached the active plugin file in LocalWP yet. Tomorrow we will do a clean delete and re-install to fix this.

---

### Test 10.7 — Delete cleans up the database
**What:** Deactivate and delete the plugin. Then check the WordPress database — there should be no leftover ck_ entries.

**Why:** When a customer decides to stop using your plugin and deletes it, they expect it to clean up after itself. If your plugin leaves data behind in their database forever, that is:
- Bad practice
- A potential GDPR problem (storing data you no longer need)
- A reason for wordpress.org to reject the plugin

The plugin has an `uninstall.php` file that deletes all its data when the plugin is deleted. This test verifies that file works.

---

### Test 10.8 — XSS security protection
**What:** Paste `<script>alert(1)</script>` into the Embed Code field → Save → the field should save only `scriptalert1script`.

**Why:** XSS (Cross-Site Scripting) is a security attack. If a bad actor tricks an admin into pasting malicious code into the embed code field, and the plugin stores it without cleaning it, that malicious code could run on every page of the website for every visitor.

The plugin strips everything except letters and numbers from the embed code. This test verifies that protection works. wordpress.org specifically checks for XSS vulnerabilities and will reject plugins that have them.

---

### Test 10.9 — Works with caching plugins
**What:** Install WP Super Cache → activate → visit front-end twice → check the script tag is still in the page source.

**Why:** Most real WordPress sites use a caching plugin. Caching means WordPress generates the page HTML once and saves it. The next visitor gets the saved copy instead of a freshly generated page.

If the plugin only works on freshly generated pages but not cached pages, it would fail silently on most real customer websites — the banner would simply not appear. This test verifies the plugin works in a cached environment.

---

## Summary

| Test | What it proves |
|------|---------------|
| 10.1 | Plugin does not crash WordPress |
| 10.2 | Settings page works |
| 10.3 | Banner script is injected correctly |
| 10.4 | Nothing breaks when not configured |
| 10.5 | Footer link toggle works reliably |
| 10.6 | Admin notice is not shown where it is not needed |
| 10.7 | Plugin cleans up after itself |
| 10.8 | Plugin is secure against XSS attacks |
| 10.9 | Plugin works on real-world cached sites |

All 9 tests must pass before submitting to wordpress.org.
