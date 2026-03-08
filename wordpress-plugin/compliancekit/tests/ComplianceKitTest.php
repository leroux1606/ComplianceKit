<?php
/**
 * Unit tests for ComplianceKit WordPress plugin.
 *
 * Run with Brain Monkey (mocks WordPress functions without a full WP install):
 *   composer require --dev brain/monkey phpunit/phpunit
 *   ./vendor/bin/phpunit --bootstrap tests/bootstrap.php tests/ComplianceKitTest.php
 */

use PHPUnit\Framework\TestCase;
use Brain\Monkey;
use Brain\Monkey\Functions;

class ComplianceKitTest extends TestCase {

    protected function setUp(): void {
        parent::setUp();
        Monkey\setUp();

        // Load plugin after Brain Monkey is ready so WP function stubs are in place.
        require_once dirname( __DIR__ ) . '/compliancekit.php';
    }

    protected function tearDown(): void {
        Monkey\tearDown();
        parent::tearDown();
    }

    // ── ck_sanitize_embed_code ────────────────────────────────────────────────

    public function test_sanitize_embed_code_keeps_alphanumeric(): void {
        $this->assertSame( 'ABC123xyz', ck_sanitize_embed_code( 'ABC123xyz' ) );
    }

    public function test_sanitize_embed_code_strips_spaces(): void {
        $this->assertSame( 'ABC123', ck_sanitize_embed_code( ' ABC 123 ' ) );
    }

    public function test_sanitize_embed_code_strips_script_tag(): void {
        // Someone pastes the full <script> tag instead of just the code.
        $result = ck_sanitize_embed_code( '<script src="/widget.js" data-embed-code="ABC123" defer></script>' );
        // Should strip all non-alphanumeric characters — the remaining string
        // will not be a valid embed code, but it won't be injectable either.
        $this->assertStringNotContainsString( '<', $result );
        $this->assertStringNotContainsString( '>', $result );
        $this->assertStringNotContainsString( '"', $result );
    }

    public function test_sanitize_embed_code_strips_xss_attempt(): void {
        $result = ck_sanitize_embed_code( "ABC';alert(document.domain)//" );
        $this->assertStringNotContainsString( "'", $result );
        $this->assertStringNotContainsString( ';', $result );
    }

    public function test_sanitize_embed_code_returns_empty_for_empty_input(): void {
        $this->assertSame( '', ck_sanitize_embed_code( '' ) );
    }

    public function test_sanitize_embed_code_handles_non_string(): void {
        $this->assertSame( '123', ck_sanitize_embed_code( 123 ) );
    }

    // ── ck_sanitize_url ───────────────────────────────────────────────────────

    public function test_sanitize_url_accepts_valid_https(): void {
        Functions\expect( 'esc_url_raw' )
            ->once()
            ->andReturn( 'https://compliancekit.com' );

        $result = ck_sanitize_url( 'https://compliancekit.com' );
        $this->assertSame( 'https://compliancekit.com', $result );
    }

    public function test_sanitize_url_falls_back_to_default_on_empty(): void {
        Functions\expect( 'esc_url_raw' )
            ->once()
            ->andReturn( '' ); // esc_url_raw returns '' for invalid URLs

        $result = ck_sanitize_url( '' );
        $this->assertSame( CK_DEFAULT_APP_URL, $result );
    }

    public function test_sanitize_url_falls_back_to_default_on_javascript_protocol(): void {
        Functions\expect( 'esc_url_raw' )
            ->once()
            ->andReturn( '' ); // esc_url_raw strips javascript:

        $result = ck_sanitize_url( 'javascript:alert(1)' );
        $this->assertSame( CK_DEFAULT_APP_URL, $result );
    }

    // ── ck_inject_widget_script ───────────────────────────────────────────────

    public function test_inject_widget_script_outputs_nothing_when_no_embed_code(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_EMBED_CODE, '' )
            ->andReturn( '' );

        ob_start();
        ck_inject_widget_script();
        $output = ob_get_clean();

        $this->assertSame( '', $output );
    }

    public function test_inject_widget_script_outputs_script_tag(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_EMBED_CODE, '' )
            ->andReturn( 'ABC123' );

        Functions\expect( 'get_option' )
            ->with( CK_OPTION_APP_URL, CK_DEFAULT_APP_URL )
            ->andReturn( 'https://compliancekit.com' );

        Functions\expect( 'esc_attr' )->andReturnFirstArg();
        Functions\expect( 'esc_url' )->andReturnFirstArg();

        ob_start();
        ck_inject_widget_script();
        $output = ob_get_clean();

        $this->assertStringContainsString( '<script', $output );
        $this->assertStringContainsString( 'widget.js', $output );
        $this->assertStringContainsString( 'data-embed-code="ABC123"', $output );
        $this->assertStringContainsString( 'defer', $output );
        $this->assertStringContainsString( 'https://compliancekit.com', $output );
    }

    public function test_inject_widget_script_strips_trailing_slash_from_app_url(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_EMBED_CODE, '' )
            ->andReturn( 'XYZ789' );

        Functions\expect( 'get_option' )
            ->with( CK_OPTION_APP_URL, CK_DEFAULT_APP_URL )
            ->andReturn( 'https://compliancekit.com/' ); // trailing slash

        Functions\expect( 'esc_attr' )->andReturnFirstArg();
        Functions\expect( 'esc_url' )->andReturnFirstArg();

        ob_start();
        ck_inject_widget_script();
        $output = ob_get_clean();

        // URL in the script tag should not have double slash before widget.js
        $this->assertStringNotContainsString( '//widget.js', $output );
        $this->assertStringContainsString( 'compliancekit.com/widget.js', $output );
    }

    // ── ck_inject_footer_link ─────────────────────────────────────────────────

    public function test_footer_link_not_shown_when_option_disabled(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_FOOTER_LINK, false )
            ->andReturn( false );

        ob_start();
        ck_inject_footer_link();
        $output = ob_get_clean();

        $this->assertSame( '', $output );
    }

    public function test_footer_link_not_shown_when_no_embed_code(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_FOOTER_LINK, false )
            ->andReturn( true );

        Functions\expect( 'get_option' )
            ->with( CK_OPTION_EMBED_CODE, '' )
            ->andReturn( '' );

        ob_start();
        ck_inject_footer_link();
        $output = ob_get_clean();

        $this->assertSame( '', $output );
    }

    public function test_footer_link_shown_when_enabled_and_embed_code_set(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_FOOTER_LINK, false )
            ->andReturn( true );

        Functions\expect( 'get_option' )
            ->with( CK_OPTION_EMBED_CODE, '' )
            ->andReturn( 'ABC123' );

        Functions\expect( 'esc_html_e' )->andReturnNull();

        ob_start();
        ck_inject_footer_link();
        $output = ob_get_clean();

        $this->assertStringContainsString( 'ck-footer-link', $output );
        $this->assertStringContainsString( 'ComplianceKit.openSettings', $output );
        $this->assertStringContainsString( 'event.preventDefault()', $output );
    }

    public function test_footer_link_has_graceful_degradation(): void {
        Functions\expect( 'get_option' )
            ->with( CK_OPTION_FOOTER_LINK, false )
            ->andReturn( true );

        Functions\expect( 'get_option' )
            ->with( CK_OPTION_EMBED_CODE, '' )
            ->andReturn( 'ABC123' );

        Functions\expect( 'esc_html_e' )->andReturnNull();

        ob_start();
        ck_inject_footer_link();
        $output = ob_get_clean();

        // Must check for existence of the API before calling it (graceful degradation)
        $this->assertStringContainsString( 'window.ComplianceKit&&window.ComplianceKit.openSettings', $output );
    }

    // ── Checkbox unchecked regression test ───────────────────────────────────

    /**
     * Verify the footer link form field always submits a value.
     *
     * The settings form MUST include a hidden field with value="0" before the
     * checkbox so that unchecking saves false rather than leaving the old value.
     *
     * This test renders the settings page and checks for the hidden field.
     * It is the regression test for the bug where ck_footer_link could never
     * be unchecked once enabled.
     */
    public function test_settings_form_has_hidden_field_before_checkbox(): void {
        Functions\expect( 'current_user_can' )->andReturn( true );
        Functions\expect( 'get_option' )->andReturn( '' ); // all options empty/false
        Functions\expect( 'settings_fields' )->andReturnNull();
        Functions\expect( 'esc_attr' )->andReturnFirstArg();
        Functions\expect( 'esc_url' )->andReturnFirstArg();
        Functions\expect( 'esc_html_e' )->andReturnNull();
        Functions\expect( 'esc_html__' )->andReturnFirstArg();
        Functions\expect( '__' )->andReturnFirstArg();
        Functions\expect( 'checked' )->andReturnNull();
        Functions\expect( 'submit_button' )->andReturnNull();
        Functions\expect( 'admin_url' )->andReturn( 'http://example.com/wp-admin/options-general.php' );

        ob_start();
        ck_render_settings_page();
        $output = ob_get_clean();

        // The hidden field must appear BEFORE the checkbox to ensure the
        // browser submits value="0" when the checkbox is unchecked.
        $hidden_pos   = strpos( $output, 'type="hidden"' );
        $checkbox_pos = strpos( $output, 'type="checkbox"' );

        $this->assertNotFalse( $hidden_pos,   'Hidden field for ck_footer_link not found in settings form' );
        $this->assertNotFalse( $checkbox_pos, 'Checkbox for ck_footer_link not found in settings form' );
        $this->assertLessThan( $checkbox_pos, $hidden_pos, 'Hidden field must appear before checkbox in the form' );

        // Confirm it's the correct hidden field (name + value="0")
        $this->assertMatchesRegularExpression(
            '/type="hidden"[^>]*name="ck_footer_link"[^>]*value="0"/',
            $output,
            'Hidden field must have name="ck_footer_link" and value="0"'
        );
    }
}
