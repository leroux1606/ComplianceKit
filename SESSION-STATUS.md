# Session Status — Pick up from here tomorrow

## What we completed today

| Test | Result |
|------|--------|
| 10.1 Plugin activated | PASSED |
| 10.2 Settings page loads | PASSED |
| 10.3 Script tag in `<head>` when embed code is set | PASSED |
| 10.4 No script tag when embed code is empty | PASSED |
| 10.5 Footer link checkbox works | PASSED |
| 10.6 Admin notice hides on ComplianceKit settings page | STUCK |
| 10.7 Delete plugin cleans database | NOT DONE |
| 10.8 XSS protection | NOT DONE |
| 10.9 Works with caching plugin | NOT DONE |

---

## The current problem (10.6)

**What should happen:**
When the embed code is empty, WordPress shows a yellow warning notice on every admin page EXCEPT the ComplianceKit settings page itself (because you are already there, so showing it would be redundant).

**What is happening:**
The warning still shows on the ComplianceKit settings page.

**What we fixed in the code:**
In `C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit\compliancekit.php` we changed the check to:
```php
if ( isset( $_GET['page'] ) && 'compliancekit' === $_GET['page'] ) {
    return;
}
```
This fix IS in the source file. The problem is getting it into LocalWP.

**The LocalWP plugin folder mess:**
WordPress created TWO plugin folders because the plugin was uploaded multiple times:
- `C:\Users\j.leroux\Local Sites\compliancekittest\app\public\wp-content\plugins\compliancekit` — empty folder
- `C:\Users\j.leroux\Local Sites\compliancekittest\app\public\wp-content\plugins\compliancekit-1` — has the updated code but WordPress may not be running this one

---

## How to fix it tomorrow — clean start

The cleanest fix is to delete both plugin folders and do one fresh install.

### Step 1 — Delete both plugin folders in Windows Explorer
- Go to `C:\Users\j.leroux\Local Sites\compliancekittest\app\public\wp-content\plugins\`
- Delete the folder `compliancekit`
- Delete the folder `compliancekit-1`

### Step 2 — Rebuild the zip (without vendor folder)
Open PowerShell and run these one at a time:

```
cd "C:\Private\AI\ComplianceKit\wordpress-plugin"
```
```
$files = "compliancekit\compliancekit.php","compliancekit\readme.txt","compliancekit\uninstall.php"
```
```
Compress-Archive -Path $files -DestinationPath "compliancekit.zip" -Force
```

### Step 3 — Upload fresh in WordPress
- WP Admin → Plugins → Add New → Upload Plugin
- Pick `C:\Private\AI\ComplianceKit\wordpress-plugin\compliancekit.zip`
- Install Now → Activate

### Step 4 — Re-test 10.6
- Go to Settings → ComplianceKit → make sure Embed Code is empty → Save Changes
- Click Posts → you should see the yellow warning
- Click Settings → ComplianceKit → warning should disappear

---

## After 10.6 is fixed — remaining tests

**10.7 — Delete cleans database:**
- Plugins → Deactivate → Delete the plugin
- In LocalWP click Database tab → open Adminer → browse wp_options → search "ck_"
- There should be NO entries starting with ck_
- Then re-install the plugin

**10.8 — XSS protection:**
- Settings → ComplianceKit → paste this in the Embed Code field: `<script>alert(1)</script>`
- Save Changes
- The field should show only: `scriptalert1script` (all special characters stripped)

**10.9 — Works with caching:**
- Install "WP Super Cache" plugin → Activate
- Visit the front-end twice
- View Page Source → the script tag should still be there even in cached pages

---

## After all tests pass — final steps

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
