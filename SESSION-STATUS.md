# Session Status — Pick up from here

## Test results so far

| Test | Result |
|------|--------|
| 10.1 Plugin activated | PASSED |
| 10.2 Settings page loads | PASSED |
| 10.3 Script tag in `<head>` when embed code is set | PASSED |
| 10.4 No script tag when embed code is empty | PASSED |
| 10.5 Footer link checkbox works | PASSED |
| 10.6 Admin notice hides on ComplianceKit settings page | PASSED |
| 10.7 Delete plugin cleans database | PASSED |
| 10.8 XSS protection | PASSED |
| 10.9 Works with caching plugin | PASSED |

---

## Start here tomorrow — Test 10.7

### 10.7 — Delete cleans database
1. In WordPress admin go to **Plugins**
2. Click **Deactivate** under ComplianceKit
3. Click **Delete** under ComplianceKit
4. In LocalWP click the **Database** tab → open **Adminer**
5. Browse the `wp_options` table → search for `ck_`
6. There should be **no entries** starting with `ck_`
7. Then re-install the plugin: **Plugins → Add New → Upload Plugin** → pick `C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit.zip` → Install Now → Activate

---

### 10.8 — XSS protection
1. Go to **Settings → ComplianceKit**
2. Paste this into the Embed Code field: `<script>alert(1)</script>`
3. Click **Save Changes**
4. The field should show only: `scriptalert1script` (all special characters stripped)

---

### 10.9 — Works with caching plugin
1. Go to **Plugins → Add New** → search for **WP Super Cache** → Install → Activate
2. Visit the front-end of your site twice (click **Open site** in LocalWP)
3. View Page Source → search for `widget.js` — the script tag should still be there

---

## After all 3 tests pass — final steps

1. Take 3 screenshots and save to `wordpress-plugin/compliancekit/assets/`:
   - `screenshot-1.png` — Settings → ComplianceKit page with embed code filled in
   - `screenshot-2.png` — Cookie consent banner on the front-end
   - `screenshot-3.png` — Your real ComplianceKit dashboard

2. Submit to wordpress.org:
   - Go to wordpress.org/plugins/developers/add
   - Name: `ComplianceKit — Cookie Consent`
   - Plugin URL: `https://compliancekit.com`
   - Upload `compliancekit.zip`
   - Wait 1–5 business days for review
