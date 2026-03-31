# Next Steps — Pick up from here

> Last session: PHP + Composer installed, unit tests passing (17/17), LocalWP installed, plugin zip uploaded. Stopped at **"Install Now → Activate"**.

---

## 1. Open LocalWP

- Start menu → search **Local** → open it
- Your site **ComplianceKitTest** should already be listed
- If the site is stopped, click **Start site** (top right)

## 2. Activate the plugin

- In LocalWP, click **Admin** → opens WordPress admin in your browser
- Go to **Plugins** in the left sidebar
- Find **ComplianceKit — Cookie Consent** → click **Activate**
- If you don't see it, you still need to upload: **Plugins → Add New → Upload Plugin** → pick `C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit.zip`

## 3. Quick smoke test

- Go to **Settings → ComplianceKit** — the settings page should load without errors
- Type `TEST123` in the Embed Code field → **Save Changes**
- Open the front-end of your site (in LocalWP click **Open site**) → View Page Source → search for `widget.js` — you should see the script tag

## 4. Run QA Phase 10

Work through each test below. Check off as you go:

```
[ ] 10.1  Plugin activated without fatal errors (you already did this in step 2)
[ ] 10.2  Settings page loads (Settings → ComplianceKit)
[ ] 10.3  Script tag in <head> when embed code is set (check View Source)
[ ] 10.4  No script tag when embed code is empty (clear the field, save, check source)
[ ] 10.5  Footer link checkbox — check it, save, verify link appears on front-end.
          Then UNCHECK it, save, verify link disappears
[ ] 10.6  Admin notice — go to any other admin page, you should see a setup notice.
          Go back to Settings → ComplianceKit — notice should NOT appear there
[ ] 10.7  Delete plugin: Plugins → Deactivate → Delete.
          Then check wp_options table has no ck_* entries.
          (In LocalWP: click "Database" tab → open Adminer → browse wp_options → search "ck_")
[ ] 10.8  Re-install plugin. Paste XSS in embed code: <script>alert(1)</script>
          Save → the field should show only "scriptalert1script" (stripped to alphanumeric)
[ ] 10.9  Install "WP Super Cache" plugin → activate → visit front-end twice →
          check the script tag still appears in cached pages
```

## 5. Take 3 screenshots

Save these into `wordpress-plugin/compliancekit/assets/`:

| File | What to capture |
|------|----------------|
| `screenshot-1.png` | The Settings → ComplianceKit page with an embed code filled in |
| `screenshot-2.png` | The cookie consent banner on the front-end |
| `screenshot-3.png` | Your real ComplianceKit dashboard at compliancekit.com |

## 6. Submit to wordpress.org

1. Go to **wordpress.org/plugins/developers/add**
2. Name: `ComplianceKit — Cookie Consent`
3. Plugin URL: `https://compliancekit.com`
4. Upload `compliancekit.zip`
5. Wait 1–5 business days for review

---

*See WORDPRESS-SETUP.md for full details and post-approval SVN instructions.*
