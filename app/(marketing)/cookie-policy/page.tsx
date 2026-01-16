import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | ComplianceKit",
  description: "Learn about the cookies ComplianceKit uses and how to manage them.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "January 16, 2026";

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: {lastUpdated}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, authenticate you, and improve your experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Cookies We Use</h2>

              <div className="mt-6">
                <h3 className="text-xl font-medium mb-3">2.1 Essential Cookies (Required)</h3>
                <p className="mb-4">These cookies are necessary for the platform to function and cannot be disabled.</p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border rounded-lg">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border border-border p-3 text-left">Cookie Name</th>
                        <th className="border border-border p-3 text-left">Purpose</th>
                        <th className="border border-border p-3 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3"><code>authjs.session-token</code></td>
                        <td className="border border-border p-3">Authentication - Keeps you logged in</td>
                        <td className="border border-border p-3">30 days</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><code>authjs.csrf-token</code></td>
                        <td className="border border-border p-3">Security - Prevents CSRF attacks</td>
                        <td className="border border-border p-3">Session</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><code>authjs.callback-url</code></td>
                        <td className="border border-border p-3">Navigation - Redirects after login</td>
                        <td className="border border-border p-3">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  <strong>Legal Basis:</strong> Legitimate interest & contractual necessity (GDPR Article 6(1)(b) & (f))
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-medium mb-3">2.2 Preference Cookies (Optional)</h3>
                <p className="mb-4">These cookies remember your choices and preferences.</p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border rounded-lg">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border border-border p-3 text-left">Cookie Name</th>
                        <th className="border border-border p-3 text-left">Purpose</th>
                        <th className="border border-border p-3 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3"><code>theme</code></td>
                        <td className="border border-border p-3">Remembers dark/light mode preference</td>
                        <td className="border border-border p-3">1 year</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><code>language</code></td>
                        <td className="border border-border p-3">Remembers language preference</td>
                        <td className="border border-border p-3">1 year</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><code>cookie-consent</code></td>
                        <td className="border border-border p-3">Stores your cookie preferences</td>
                        <td className="border border-border p-3">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  <strong>Legal Basis:</strong> Consent (GDPR Article 6(1)(a))
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">3.1 Google OAuth</h3>
              <p>If you sign in with Google, Google sets cookies for authentication purposes. These are governed by Google's Privacy Policy.</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Cookies:</strong> Various Google authentication cookies</li>
                <li><strong>Purpose:</strong> Single sign-on authentication</li>
                <li><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.2 PayStack (Payment Processing)</h3>
              <p>When you make payments, PayStack may set cookies for payment processing and fraud prevention.</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Purpose:</strong> Secure payment processing</li>
                <li><strong>Privacy Policy:</strong> <a href="https://paystack.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">PayStack Privacy Policy</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Cookies We Do NOT Use</h2>
              <p>ComplianceKit does NOT use:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Analytics Cookies:</strong> We do not track your behavior with Google Analytics or similar tools</li>
                <li><strong>Advertising Cookies:</strong> We do not serve targeted ads or use advertising cookies</li>
                <li><strong>Social Media Cookies:</strong> We do not embed social media tracking pixels</li>
                <li><strong>Marketing Cookies:</strong> We do not track you across other websites</li>
              </ul>

              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="font-medium">Privacy-First Approach</p>
                <p className="text-sm mt-2">
                  As a GDPR compliance platform, we practice what we preach. We use only the minimum cookies necessary to provide our service and respect your privacy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">5.1 Cookie Consent Banner</h3>
              <p>
                When you first visit ComplianceKit, we show a cookie consent banner. You can accept or manage your cookie preferences there.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">5.2 Browser Settings</h3>
              <p>You can control cookies through your browser settings:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Important:</p>
                <p className="text-sm mt-2 text-yellow-900 dark:text-yellow-100">
                  Blocking essential cookies will prevent you from logging in and using ComplianceKit. We recommend accepting essential cookies.
                </p>
              </div>

              <h3 className="text-xl font-medium mb-3 mt-6">5.3 Clear Cookies</h3>
              <p>
                You can delete all ComplianceKit cookies by:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-3">
                <li>Opening your browser settings</li>
                <li>Going to "Cookies and site data"</li>
                <li>Searching for "compliancekit.com"</li>
                <li>Clicking "Remove" or "Clear"</li>
              </ol>
              <p className="mt-3 text-sm text-muted-foreground">
                Note: This will log you out and reset your preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookie Duration</h2>
              <p>We use two types of cookies based on duration:</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.1 Session Cookies</h3>
              <p>
                Temporary cookies deleted when you close your browser. Used for security (CSRF tokens, temporary authentication states).
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.2 Persistent Cookies</h3>
              <p>
                Cookies that remain on your device for a set period:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Authentication:</strong> 30 days (keeps you logged in)</li>
                <li><strong>Preferences:</strong> 1 year (remembers your settings)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Updates to Cookie Policy</h2>
              <p>
                We may update this Cookie Policy to reflect changes in our cookie practices. We will notify you of significant changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Updating the "Last Updated" date</li>
                <li>Showing a notice on the platform</li>
                <li>Sending an email for material changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Questions?</h2>
              <p>
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2">
                <p><strong>Email:</strong> privacy@compliancekit.com</p>
                <p><strong>Support:</strong> support@compliancekit.com</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                This Cookie Policy complies with GDPR (ePrivacy Directive) and other applicable cookie laws.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/terms">View Terms of Service</Link>
          </Button>
          <Button asChild className="gradient-primary">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
