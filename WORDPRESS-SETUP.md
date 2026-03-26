# WordPress Plugin — Setup, Testing & Submission Guide

> Reference document for getting the ComplianceKit WordPress plugin tested and submitted to wordpress.org.
> Plugin files are in `wordpress-plugin/compliancekit/`.

---

## Stage 1 — Install PHP + Run Unit Tests (no WordPress needed)

The unit tests use Brain Monkey which mocks all WordPress functions — no WP install required.

### Install PHP on Windows

1. Go to **windows.php.net/download** → under **PHP 8.2**, download the **VS16 x64 Non Thread Safe** ZIP (the exact date/patch version changes with each release — just grab the latest 8.2.x build)
2. Extract to `C:\php`
3. Add `C:\php` to your PATH:
   - Start → "Edit the system environment variables" → Environment Variables → System variables → Path → Edit → New → `C:\php`
4. Copy `C:\php\php.ini-development` → rename to `C:\php\php.ini`
5. Open `php.ini`, find and uncomment (remove the `;`):
   ```
   ;extension=openssl    →  extension=openssl
   ;extension=mbstring   →  extension=mbstring
   ;extension=curl       →  extension=curl
   ```
6. Open a new terminal and verify: `php --version`

### Install Composer

1. Go to **getcomposer.org/download** → download and run **Composer-Setup.exe**
2. It auto-detects PHP at `C:\php\php.exe` — accept the default
3. Verify: `composer --version`

### Run the Tests

```bash
cd C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit
composer install
composer test
```

**Expected result:** 15 tests, 0 failures

---

## Stage 2 — Local WordPress Install + Manual QA

### Install LocalWP

1. Download **LocalWP** (free) from **localwp.com**
2. Install and open it → click **+** → Create a new site
   - Site name: `ComplianceKitTest`
   - Environment: **Preferred** (PHP 8.2, MySQL 8, nginx)
   - Set an admin username + password → **Finish**
3. LocalWP starts the site at something like `http://compliancekittest.local`

### Install the Plugin

1. In LocalWP, click **Admin** (opens WordPress admin at `/wp-admin`)
2. Go to **Plugins → Add New → Upload Plugin**
3. First, zip the plugin folder:
   - In File Explorer: right-click `C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit\`
   - Send to → Compressed (zipped) folder → name it `compliancekit.zip`
4. Upload the zip → **Install Now** → **Activate**

### Run QA Phase 10

Work through **QA-MASTER.md Phase 10** (tests 10.1–10.9) against the local WP site.
All 9 tests must pass before submitting to wordpress.org.

| Test | What to check |
|------|--------------|
| 10.1 | Plugin activates without fatal errors |
| 10.2 | Settings page loads (Settings → ComplianceKit) |
| 10.3 | Script tag injected in `<head>` when embed code is set |
| 10.4 | No script tag when embed code is empty |
| 10.5 | Footer link checkbox saves correctly in both directions (check AND uncheck) |
| 10.6 | Admin notice suppressed on the settings page itself |
| 10.7 | All `ck_*` options removed from `wp_options` after plugin deletion |
| 10.8 | XSS payload in embed code field is stripped to alphanumeric only |
| 10.9 | Compatible with a caching plugin (WP Super Cache or W3 Total Cache) |

### Take the 3 Required Screenshots

While the local site is running, take screenshots for the wordpress.org listing:

| File | What to capture |
|------|----------------|
| `screenshot-1.png` | Settings page (`Settings → ComplianceKit`) with an embed code filled in — shows the script preview box |
| `screenshot-2.png` | The cookie consent banner on the front-end of the local WP site |
| `screenshot-3.png` | The ComplianceKit dashboard (your real dashboard at compliancekit.com) |

Save the files into a new folder:
```
wordpress-plugin/compliancekit/assets/
```

> wordpress.org serves screenshots from the SVN `assets/` directory (not the plugin zip itself),
> but having them locally means you are ready to upload after approval.

---

## Stage 3 — Submit to wordpress.org

### Pre-submission checklist

Your plugin already satisfies all technical requirements:

- [x] GPL-2.0-or-later license
- [x] `uninstall.php` cleans up all `ck_*` options on deletion
- [x] All output escaped (`esc_attr`, `esc_url`, `esc_html_e`, `wp_kses_post`)
- [x] Settings registered via `register_setting` with sanitize callbacks
- [x] Capability check (`manage_options`) on settings render
- [x] No direct database calls — all through WP options API
- [x] Text domain loaded on `plugins_loaded` hook
- [x] `readme.txt` in correct format — `Stable tag` matches plugin `Version` (both 1.0.1)
- [ ] Screenshots (3 PNG files in `assets/` — take these in Stage 2)

### Submit

1. Go to **wordpress.org/plugins/developers/add** (log in with a free wordpress.org account)
2. Fill in:
   - **Name:** ComplianceKit — Cookie Consent
   - **Plugin URL:** https://compliancekit.com
3. Upload `compliancekit.zip`
4. The review team responds within **1–5 business days** with approval or change requests

### After Approval

wordpress.org gives you SVN access to publish the plugin:

```bash
# Check out your plugin's SVN repo (they give you the URL after approval)
svn co https://plugins.svn.wordpress.org/compliancekit-cookie-consent/ ck-svn
cd ck-svn

# Copy plugin files into trunk/
cp -r C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit\* trunk/

# Copy screenshots into assets/ (NOT inside trunk/)
cp C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit\assets\*.png assets/

# Tag the release
svn cp trunk tags/1.0.1

# Commit everything
svn add --force trunk/ assets/
svn ci -m "Initial release 1.0.1"
```

The plugin goes live on wordpress.org within minutes of the SVN commit.

---

## Order of Work

```
[ ] Stage 1 — Install PHP → install Composer → run composer test → 15 tests pass
[ ] Stage 2 — Install LocalWP → install plugin → run QA Phase 10 → take 3 screenshots
[ ] Stage 3 — Submit zip to wordpress.org → wait for approval → SVN commit
```

---

*Created: 2026-03-09 | Cross-reference: QA-MASTER.md Phase 10, PROGRESS.md D3*
