<?php
/**
 * PHPUnit bootstrap for ComplianceKit plugin tests.
 *
 * Requires Brain Monkey for WordPress function mocking:
 *   composer require --dev brain/monkey
 *
 * Run from wordpress-plugin/compliancekit/:
 *   ./vendor/bin/phpunit --bootstrap tests/bootstrap.php tests/
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Define WordPress constants the plugin guards against.
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', '/var/www/html/' );
}

// Stub wp_footer / wp_head hooks so the plugin file doesn't fatal on include.
if ( ! function_exists( 'add_action' ) ) {
    function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {}
}
