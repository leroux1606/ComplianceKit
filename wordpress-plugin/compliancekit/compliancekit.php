<?php
/**
 * Plugin Name:       ComplianceKit — Cookie Consent
 * Plugin URI:        https://compliancekit.com
 * Description:       Adds the ComplianceKit cookie consent banner to your WordPress site. Configure your banner in your ComplianceKit dashboard, then paste your embed code here.
 * Version:           1.0.1
 * Requires at least: 5.9
 * Requires PHP:      7.4
 * Author:            ComplianceKit
 * Author URI:        https://compliancekit.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       compliancekit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CK_VERSION', '1.0.1' );
define( 'CK_OPTION_EMBED_CODE',  'ck_embed_code' );
define( 'CK_OPTION_APP_URL',     'ck_app_url' );
define( 'CK_OPTION_FOOTER_LINK', 'ck_footer_link' );
define( 'CK_DEFAULT_APP_URL',    'https://compliancekit.com' );

// ---------------------------------------------------------------------------
// Bug fix #4 — load translations (Text Domain header requires this call)
// ---------------------------------------------------------------------------

add_action( 'plugins_loaded', 'ck_load_textdomain' );

function ck_load_textdomain() {
	load_plugin_textdomain(
		'compliancekit',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}

// ---------------------------------------------------------------------------
// Admin menu + settings page
// ---------------------------------------------------------------------------

add_action( 'admin_menu', 'ck_add_settings_page' );

function ck_add_settings_page() {
	add_options_page(
		__( 'ComplianceKit Settings', 'compliancekit' ),
		__( 'ComplianceKit', 'compliancekit' ),
		'manage_options',
		'compliancekit',
		'ck_render_settings_page'
	);
}

add_action( 'admin_init', 'ck_register_settings' );

function ck_register_settings() {
	register_setting(
		'ck_settings_group',
		CK_OPTION_EMBED_CODE,
		array(
			'type'              => 'string',
			'sanitize_callback' => 'ck_sanitize_embed_code',
			'default'           => '',
		)
	);

	register_setting(
		'ck_settings_group',
		CK_OPTION_APP_URL,
		array(
			'type'              => 'string',
			'sanitize_callback' => 'ck_sanitize_url',
			'default'           => CK_DEFAULT_APP_URL,
		)
	);

	register_setting(
		'ck_settings_group',
		CK_OPTION_FOOTER_LINK,
		array(
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
			'default'           => 0,
		)
	);
}

/**
 * Sanitize embed code: keep only alphanumeric characters.
 * Strips everything else — prevents XSS, script injection, and path traversal.
 */
function ck_sanitize_embed_code( $value ) {
	return preg_replace( '/[^A-Za-z0-9]/', '', (string) $value );
}

/**
 * Sanitize the app URL.
 * Falls back to the default if the input is empty or has a disallowed protocol.
 */
function ck_sanitize_url( $value ) {
	$url = esc_url_raw( trim( (string) $value ), array( 'https', 'http' ) );
	return $url ?: CK_DEFAULT_APP_URL;
}

function ck_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$embed_code  = get_option( CK_OPTION_EMBED_CODE, '' );
	$app_url     = get_option( CK_OPTION_APP_URL, CK_DEFAULT_APP_URL );
	$footer_link = (bool) get_option( CK_OPTION_FOOTER_LINK, 0 );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'ComplianceKit — Cookie Consent', 'compliancekit' ); ?></h1>

		<?php if ( $embed_code ) : ?>
			<div class="notice notice-success inline">
				<p><?php esc_html_e( 'Banner active. Your cookie consent banner is installed on this site.', 'compliancekit' ); ?></p>
			</div>
		<?php else : ?>
			<div class="notice notice-warning inline">
				<p>
					<?php
					$dashboard_link = '<a href="' . esc_url( $app_url . '/dashboard' ) . '" target="_blank" rel="noopener noreferrer">'
						. esc_html__( 'Open your ComplianceKit dashboard', 'compliancekit' )
						. '</a>';
					echo wp_kses_post(
						sprintf(
							/* translators: %s: link to ComplianceKit dashboard */
							__( 'No embed code set. %s to get your embed code, then paste it below.', 'compliancekit' ),
							$dashboard_link
						)
					);
					?>
				</p>
			</div>
		<?php endif; ?>

		<form method="post" action="options.php">
			<?php settings_fields( 'ck_settings_group' ); ?>

			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="<?php echo esc_attr( CK_OPTION_EMBED_CODE ); ?>">
							<?php esc_html_e( 'Embed Code', 'compliancekit' ); ?>
						</label>
					</th>
					<td>
						<input
							type="text"
							id="<?php echo esc_attr( CK_OPTION_EMBED_CODE ); ?>"
							name="<?php echo esc_attr( CK_OPTION_EMBED_CODE ); ?>"
							value="<?php echo esc_attr( $embed_code ); ?>"
							class="regular-text"
							placeholder="e.g. ABC123XYZ"
							spellcheck="false"
						/>
						<p class="description">
							<?php
							$dashboard_link = '<a href="' . esc_url( $app_url . '/dashboard' ) . '" target="_blank" rel="noopener noreferrer">'
								. esc_html__( 'ComplianceKit dashboard', 'compliancekit' )
								. '</a>';
							echo wp_kses_post(
								sprintf(
									/* translators: %s: link to ComplianceKit dashboard embed page */
									__( 'Find this in your %s under Website → Embed Code. Paste the short alphanumeric code only — not the full script tag.', 'compliancekit' ),
									$dashboard_link
								)
							);
							?>
						</p>
					</td>
				</tr>

				<tr>
					<th scope="row">
						<label for="<?php echo esc_attr( CK_OPTION_APP_URL ); ?>">
							<?php esc_html_e( 'App URL', 'compliancekit' ); ?>
						</label>
					</th>
					<td>
						<input
							type="url"
							id="<?php echo esc_attr( CK_OPTION_APP_URL ); ?>"
							name="<?php echo esc_attr( CK_OPTION_APP_URL ); ?>"
							value="<?php echo esc_url( $app_url ); ?>"
							class="regular-text"
						/>
						<p class="description">
							<?php esc_html_e( 'Leave as-is unless you are on a self-hosted ComplianceKit instance.', 'compliancekit' ); ?>
						</p>
					</td>
				</tr>

				<tr>
					<th scope="row">
						<?php esc_html_e( 'Footer Link', 'compliancekit' ); ?>
					</th>
					<td>
						<?php
						/*
						 * Bug fix #1 — checkbox unchecked never saves false.
						 *
						 * HTML forms do not submit unchecked checkboxes. Without the hidden
						 * field below, un-checking the box and saving does NOT call update_option
						 * — the old value (1) persists forever.
						 *
						 * The hidden field with value="0" is submitted first. If the checkbox is
						 * checked, its value="1" is submitted second, and PHP keeps the last
						 * value for duplicate POST keys, resulting in $value=1 in the sanitize
						 * callback. If unchecked, only the hidden field is submitted → $value=0.
						 */
						?>
						<input
							type="hidden"
							name="<?php echo esc_attr( CK_OPTION_FOOTER_LINK ); ?>"
							value="0"
						/>
						<label for="<?php echo esc_attr( CK_OPTION_FOOTER_LINK ); ?>">
							<input
								type="checkbox"
								id="<?php echo esc_attr( CK_OPTION_FOOTER_LINK ); ?>"
								name="<?php echo esc_attr( CK_OPTION_FOOTER_LINK ); ?>"
								value="1"
								<?php checked( $footer_link ); ?>
							/>
							<?php esc_html_e( 'Add a "Manage Cookie Preferences" link to the site footer', 'compliancekit' ); ?>
						</label>
						<p class="description">
							<?php esc_html_e( 'The widget already renders a persistent floating button for visitors to re-open consent settings. Enable this text link only if your theme hides the floating button or you prefer a footer text link instead.', 'compliancekit' ); ?>
						</p>
					</td>
				</tr>
			</table>

			<?php if ( $embed_code ) : ?>
				<div style="margin:16px 0;padding:12px 16px;background:#f0f6fc;border-left:4px solid #2271b1;border-radius:2px;">
					<p style="margin:0 0 6px;font-weight:600;"><?php esc_html_e( 'Script tag that will be injected:', 'compliancekit' ); ?></p>
					<code style="display:block;word-break:break-all;">
						&lt;script src="<?php echo esc_url( rtrim( $app_url, '/' ) ); ?>/widget.js"
						data-embed-code="<?php echo esc_attr( $embed_code ); ?>" defer&gt;&lt;/script&gt;
					</code>
				</div>
			<?php endif; ?>

			<?php submit_button(); ?>
		</form>

		<hr />

		<h2><?php esc_html_e( 'Getting Started', 'compliancekit' ); ?></h2>
		<ol>
			<li><?php esc_html_e( 'Log in to your ComplianceKit dashboard.', 'compliancekit' ); ?></li>
			<li><?php esc_html_e( 'Add your website and run a compliance scan.', 'compliancekit' ); ?></li>
			<li><?php esc_html_e( 'Configure your cookie consent banner appearance.', 'compliancekit' ); ?></li>
			<li><?php esc_html_e( 'Go to Website → Embed Code and copy your embed code (the short alphanumeric code only — not the full script tag).', 'compliancekit' ); ?></li>
			<li><?php esc_html_e( 'Paste the embed code into the field above and save.', 'compliancekit' ); ?></li>
		</ol>
		<p>
			<a href="<?php echo esc_url( $app_url ); ?>" target="_blank" rel="noopener noreferrer" class="button">
				<?php esc_html_e( 'Open ComplianceKit →', 'compliancekit' ); ?>
			</a>
		</p>
	</div>
	<?php
}

// ---------------------------------------------------------------------------
// Front-end: inject script in <head>
// ---------------------------------------------------------------------------

add_action( 'wp_head', 'ck_inject_widget_script' );

function ck_inject_widget_script() {
	$embed_code = get_option( CK_OPTION_EMBED_CODE, '' );

	if ( ! $embed_code ) {
		return;
	}

	$app_url = rtrim( get_option( CK_OPTION_APP_URL, CK_DEFAULT_APP_URL ), '/' );

	printf(
		"\n<!-- ComplianceKit Cookie Consent v%s -->\n<script src=\"%s/widget.js\" data-embed-code=\"%s\" defer></script>\n",
		esc_attr( CK_VERSION ),
		esc_url( $app_url ),
		esc_attr( $embed_code )
	);
}

// ---------------------------------------------------------------------------
// Front-end: optional "Manage Cookie Preferences" footer link
// Calls window.ComplianceKit.openSettings() from the public JS API (D6).
// ---------------------------------------------------------------------------

add_action( 'wp_footer', 'ck_inject_footer_link' );

function ck_inject_footer_link() {
	if ( ! get_option( CK_OPTION_FOOTER_LINK, 0 ) ) {
		return;
	}

	$embed_code = get_option( CK_OPTION_EMBED_CODE, '' );

	if ( ! $embed_code ) {
		return;
	}
	?>
	<div id="ck-footer-link" style="text-align:center;padding:8px;font-size:0.8em;">
		<a
			href="#"
			onclick="event.preventDefault();if(window.ComplianceKit&&window.ComplianceKit.openSettings)window.ComplianceKit.openSettings();"
			style="color:inherit;opacity:0.7;text-decoration:underline;"
		><?php esc_html_e( 'Manage Cookie Preferences', 'compliancekit' ); ?></a>
	</div>
	<?php
}

// ---------------------------------------------------------------------------
// Admin: setup notice when embed code is not configured
// ---------------------------------------------------------------------------

add_action( 'admin_notices', 'ck_setup_notice' );

function ck_setup_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$screen = get_current_screen();
	if ( $screen && 'settings_page_compliancekit' === $screen->id ) {
		return;
	}

	if ( get_option( CK_OPTION_EMBED_CODE, '' ) ) {
		return;
	}

	$settings_url = admin_url( 'options-general.php?page=compliancekit' );
	?>
	<div class="notice notice-warning is-dismissible">
		<p>
			<?php
			$link = '<a href="' . esc_url( $settings_url ) . '">'
				. esc_html__( 'Add your embed code', 'compliancekit' )
				. '</a>';
			echo wp_kses_post(
				sprintf(
					/* translators: %s: link to plugin settings page */
					__( 'ComplianceKit is installed but not configured. %s to activate your cookie consent banner.', 'compliancekit' ),
					$link
				)
			);
			?>
		</p>
	</div>
	<?php
}
