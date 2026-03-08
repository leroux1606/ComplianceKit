<?php
/**
 * Uninstall hook — runs when the plugin is deleted from the WordPress admin.
 *
 * Removes all options stored by ComplianceKit so wp_options stays clean.
 * This file is required by WordPress.org plugin guidelines.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit; // Security: must be called from WordPress uninstall process only.
}

delete_option( 'ck_embed_code' );
delete_option( 'ck_app_url' );
delete_option( 'ck_footer_link' );
