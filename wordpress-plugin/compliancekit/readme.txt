=== ComplianceKit — Cookie Consent ===
Contributors:      compliancekit
Tags:              cookie consent, GDPR, cookie banner, privacy, compliance
Requires at least: 5.9
Tested up to:      6.7
Requires PHP:      7.4
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

GDPR-compliant cookie consent banner for WordPress. Powered by ComplianceKit.

== Description ==

**ComplianceKit** is a GDPR compliance platform for websites. This plugin connects your WordPress site to your ComplianceKit dashboard, automatically injecting a fully-compliant cookie consent banner — no theme editing required.

**Features:**

* One-field setup — paste your embed code and save
* Automatic script injection into `<head>` via WordPress hooks (no theme editing)
* Google Consent Mode v2 support (ad_storage, analytics_storage, ad_user_data, ad_personalization)
* Persistent "Manage Cookie Preferences" floating button built into the widget
* Optional footer link for visitors to re-open consent settings (GDPR Article 7(3))
* Granular consent categories: Necessary, Analytics, Marketing, Functional
* Consent records stored and exportable for DPA audits
* DSAR (Data Subject Access Request) management in your dashboard
* Static widget JS served via CDN — zero serverless cost per page load

**What you need:**

A free ComplianceKit account at [compliancekit.com](https://compliancekit.com). The free plan covers one website with basic consent collection.

== Installation ==

**From the WordPress Plugin Directory (recommended):**

1. Go to **Plugins → Add New** in your WordPress admin
2. Search for "ComplianceKit"
3. Click **Install Now**, then **Activate**
4. Go to **Settings → ComplianceKit** and paste your embed code

**Manual installation:**

1. Download the plugin zip from the WordPress Plugin Directory
2. Go to **Plugins → Add New → Upload Plugin**
3. Upload the zip and click **Install Now**, then **Activate**
4. Go to **Settings → ComplianceKit** and paste your embed code

**Getting your embed code:**

1. Sign up at [compliancekit.com](https://compliancekit.com)
2. Add your website and run a compliance scan
3. Configure your consent banner appearance
4. Go to **Website → Embed Code** in your dashboard
5. Copy the embed code (the short alphanumeric code, not the full `<script>` tag)
6. Paste it into **Settings → ComplianceKit** in your WordPress admin

== Frequently Asked Questions ==

= Is ComplianceKit free? =

Yes — the Free plan covers one website with basic consent collection. Paid plans unlock multiple websites, longer consent record retention, advanced analytics, and priority support.

= Does this plugin work without a ComplianceKit account? =

No. This plugin is a connector for the ComplianceKit service. You need a free account to get your embed code.

= Does this slow down my site? =

No. The widget script is a static JavaScript file served from a CDN. It loads with the `defer` attribute, so it never blocks page rendering.

= Will this break my existing Google Analytics or Google Ads? =

The widget implements Google Consent Mode v2. Before consent is given, all Google signals are set to `denied` by default. After the user consents, the appropriate signals are updated. This is the correct, compliant way to run Google Analytics and Google Ads with a consent banner.

= What data does ComplianceKit store? =

ComplianceKit stores: a randomly generated visitor ID (not tied to any personal identifier), the visitor's consent preferences, the timestamp, and which version of the banner was shown. IP addresses are stored temporarily for security purposes. Full details are in the [ComplianceKit Data Processing Agreement](https://compliancekit.com/dpa).

= Is this GDPR compliant? =

ComplianceKit is designed to help you comply with GDPR, ePrivacy Directive, and similar regulations. It implements consent recording, consent withdrawal, and Google Consent Mode v2. However, compliance ultimately depends on how you configure your banner and which cookies/scripts your site uses. The platform does not provide legal advice.

= My theme has its own cookie notice — will there be a conflict? =

Yes, potentially. Disable or remove your theme's built-in cookie notice before activating ComplianceKit to avoid showing two banners.

= How do I re-open the cookie settings for a visitor? =

The widget automatically renders a persistent "Manage Cookie Preferences" button (floating pill in the corner of the screen). Visitors can click it at any time to change their preferences. You can also enable an additional text link in the site footer via **Settings → ComplianceKit → Footer Link**.

== Screenshots ==

1. Settings page — paste your embed code and save
2. The cookie consent banner on the front-end (appearance is configured in your dashboard)
3. ComplianceKit dashboard — consent records and compliance scan results

== Changelog ==

= 1.0.0 =
* Initial release
* Script injection via `wp_head`
* Settings page with embed code, app URL, and footer link options
* Admin notice when embed code is not configured
* Optional "Manage Cookie Preferences" footer link

== Upgrade Notice ==

= 1.0.0 =
Initial release.
