import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | ComplianceKit",
  description: "ComplianceKit Privacy Policy - How we collect, use, and protect your data in compliance with GDPR.",
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: {lastUpdated}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Welcome to ComplianceKit. We are committed to protecting your personal data and respecting your privacy rights in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
              </p>
              <p>
                This Privacy Policy explains how ComplianceKit ("we", "us", or "our") collects, uses, shares, and protects your personal information when you use our GDPR compliance platform and services.
              </p>
              <p className="font-medium">
                Controller: ComplianceKit is the data controller responsible for your personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account Information:</strong> Name, email address, password (encrypted), company name
                </li>
                <li>
                  <strong>Website Information:</strong> Website URLs, company details for policy generation (company address, DPO contact information)
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing details processed through PayStack (we do not store credit card numbers)
                </li>
                <li>
                  <strong>Communication:</strong> Messages you send us through support or contact forms
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.2 Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used, time spent, interaction data
                </li>
                <li>
                  <strong>Device Information:</strong> IP address, browser type, device type, operating system
                </li>
                <li>
                  <strong>Cookies:</strong> Authentication cookies, preference cookies (see Cookie Policy)
                </li>
                <li>
                  <strong>Log Data:</strong> Access times, error logs, security events
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>OAuth Providers:</strong> If you sign in with Google, we receive your name, email, and profile picture
                </li>
                <li>
                  <strong>Payment Processor:</strong> PayStack provides transaction confirmation and payment status
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
              <p>We process your personal data for the following purposes:</p>

              <h3 className="text-xl font-medium mb-3 mt-6">3.1 Service Provision (Legal Basis: Contract)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and manage your account</li>
                <li>Provide access to our GDPR compliance tools</li>
                <li>Scan websites for cookies and tracking scripts</li>
                <li>Generate privacy policies and cookie policies</li>
                <li>Process and manage DSAR (Data Subject Access Requests)</li>
                <li>Display compliance analytics and reports</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.2 Billing & Payments (Legal Basis: Contract)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process subscription payments</li>
                <li>Generate invoices</li>
                <li>Manage billing inquiries and refunds</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.3 Communication (Legal Basis: Contract & Legitimate Interest)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send service-related notifications (downtime, updates, security alerts)</li>
                <li>Respond to support requests</li>
                <li>Send important account information</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.4 Improvement & Analytics (Legal Basis: Legitimate Interest)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyze platform usage to improve features</li>
                <li>Monitor system performance and errors</li>
                <li>Conduct internal research and development</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.5 Security (Legal Basis: Legitimate Interest & Legal Obligation)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prevent fraud and unauthorized access</li>
                <li>Detect and respond to security incidents</li>
                <li>Enforce our Terms of Service</li>
                <li>Comply with legal requirements</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.6 Marketing (Legal Basis: Consent)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send promotional emails about new features (only with your consent)</li>
                <li>You can opt-out at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing & Disclosure</h2>
              <p>We do not sell your personal data. We only share your data in these circumstances:</p>

              <h3 className="text-xl font-medium mb-3 mt-6">4.1 Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Hosting:</strong> Vercel (USA) - Application hosting</li>
                <li><strong>Database:</strong> Supabase/PostgreSQL - Data storage</li>
                <li><strong>Payment Processing:</strong> PayStack (South Africa) - Payment transactions</li>
                <li><strong>Authentication:</strong> Google OAuth (if you use Google sign-in)</li>
                <li><strong>Email:</strong> Resend - Transactional emails</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                All service providers are contractually required to protect your data and only use it for specified purposes.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">4.2 Legal Requirements</h3>
              <p>We may disclose your data if required by law, court order, or government request.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">4.3 Business Transfers</h3>
              <p>If ComplianceKit is involved in a merger, acquisition, or sale, your data may be transferred. You will be notified of any such change.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Account Data:</strong> Retained while your account is active, plus 30 days after deletion</li>
                <li><strong>Website Scan Data:</strong> Retained for 12 months or until you delete it</li>
                <li><strong>DSAR Records:</strong> Retained for 3 years (legal requirement)</li>
                <li><strong>Billing Records:</strong> Retained for 7 years (tax/legal requirement)</li>
                <li><strong>Security Logs:</strong> Retained for 90 days</li>
                <li><strong>Backup Data:</strong> Permanently deleted within 90 days after account deletion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights Under GDPR</h2>
              <p>You have the following rights regarding your personal data:</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.1 Right of Access</h3>
              <p>You can request a copy of all personal data we hold about you.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.2 Right to Rectification</h3>
              <p>You can update or correct your personal data at any time through your account settings.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.3 Right to Erasure ("Right to be Forgotten")</h3>
              <p>You can request deletion of your account and all associated data. Use the account deletion feature in your settings.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.4 Right to Data Portability</h3>
              <p>You can export all your data in a machine-readable format (JSON) at any time.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.5 Right to Restriction of Processing</h3>
              <p>You can request that we stop processing your data in certain circumstances.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.6 Right to Object</h3>
              <p>You can object to processing based on legitimate interests or direct marketing.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.7 Right to Withdraw Consent</h3>
              <p>Where processing is based on consent, you can withdraw consent at any time.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.8 Right to Lodge a Complaint</h3>
              <p>You have the right to lodge a complaint with your local data protection authority.</p>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="font-medium mb-2">How to Exercise Your Rights:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Data Export: Dashboard → Settings → Export My Data</li>
                  <li>Account Deletion: Dashboard → Settings → Delete Account</li>
                  <li>Other Requests: Contact us at privacy@compliancekit.com</li>
                </ul>
                <p className="text-sm mt-3 text-muted-foreground">
                  We will respond to all requests within 30 days as required by GDPR.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Password Security:</strong> Passwords are hashed using bcrypt with salt</li>
                <li><strong>Access Control:</strong> Strict authentication and authorization mechanisms</li>
                <li><strong>Security Monitoring:</strong> Continuous monitoring for suspicious activity</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
                <li><strong>Account Lockout:</strong> Protection against brute force attacks</li>
                <li><strong>Rate Limiting:</strong> Protection against DDoS and abuse</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                See our <Link href="/security" className="text-primary hover:underline">Security Documentation</Link> for more details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA), including the United States (Vercel hosting).
              </p>
              <p className="mt-3">
                We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Service providers certified under the EU-US Data Privacy Framework (where applicable)</li>
                <li>Additional security measures beyond legal requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Cookies</h2>
              <p>
                We use cookies to provide and improve our services. For detailed information about the cookies we use, please see our{" "}
                <Link href="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </Link>.
              </p>
              <p className="mt-3">
                <strong>Essential Cookies:</strong> Required for authentication and security (cannot be disabled)
              </p>
              <p className="mt-2">
                <strong>Optional Cookies:</strong> Analytics and preferences (you can manage these in cookie settings)
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p>
                ComplianceKit is not intended for children under 16 years of age. We do not knowingly collect personal data from children. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Updating the "Last Updated" date at the top of this policy</li>
                <li>Sending an email notification for material changes</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p className="mt-3">
                Your continued use of ComplianceKit after changes become effective constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2">
                <p><strong>Email:</strong> privacy@compliancekit.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@compliancekit.com</p>
                <p><strong>Address:</strong> [Your Company Address]</p>
                <p className="text-sm text-muted-foreground mt-3">
                  We will respond to all inquiries within 30 days.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Data Processing Agreement</h2>
              <p>
                If you are a ComplianceKit customer and we process personal data on your behalf (as a data processor), a Data Processing Agreement (DPA) is available. Please contact us to execute a DPA.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                This Privacy Policy is compliant with GDPR (Regulation (EU) 2016/679) and other applicable data protection laws.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/cookie-policy">View Cookie Policy</Link>
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
