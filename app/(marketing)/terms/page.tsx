import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | ComplianceKit",
  description: "ComplianceKit Terms of Service - Legal terms and conditions for using our GDPR compliance platform.",
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: {lastUpdated}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using ComplianceKit ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p className="mt-3">
                These Terms constitute a legally binding agreement between you (individual or entity) and ComplianceKit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                ComplianceKit provides a software-as-a-service (SaaS) platform for GDPR compliance management, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Website cookie and tracking script scanning</li>
                <li>Automated privacy policy and cookie policy generation</li>
                <li>Customizable consent banner widgets</li>
                <li>Data Subject Access Request (DSAR) management</li>
                <li>Compliance analytics and reporting</li>
                <li>Consent tracking and management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">3.1 Eligibility</h3>
              <p>You must be at least 18 years old and legally capable of entering into binding contracts to use ComplianceKit.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">3.2 Account Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized account access</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.3 Account Security</h3>
              <p>
                You agree to use a strong password and enable two-factor authentication (when available). We are not liable for losses resulting from unauthorized account access due to your failure to maintain account security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">4.1 Permitted Use</h3>
              <p>You may use ComplianceKit for lawful business purposes to achieve and maintain GDPR compliance.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">4.2 Prohibited Activities</h3>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated scripts or bots to access the Service (except our API)</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Remove, modify, or obscure any proprietary notices</li>
                <li>Resell, redistribute, or sublicense the Service without authorization</li>
                <li>Use the Service to send spam, phishing, or malicious content</li>
                <li>Overload our systems or attempt denial-of-service attacks</li>
                <li>Scrape or harvest data from the Service</li>
                <li>Upload or transmit viruses, malware, or harmful code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Subscription Plans & Billing</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">5.1 Plans</h3>
              <p>
                ComplianceKit offers multiple subscription tiers (Starter, Professional, Enterprise) with different features and usage limits. Current pricing is available on our{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  Pricing Page
                </Link>.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">5.2 Billing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscriptions are billed monthly or annually in advance via PayStack</li>
                <li>You authorize us to charge your payment method for all fees</li>
                <li>All fees are non-refundable except as required by law or stated in our refund policy</li>
                <li>Prices may change with 30 days' notice to existing subscribers</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">5.3 Free Trial</h3>
              <p>
                We may offer a free trial period. You will not be charged until the trial ends. Cancel before the trial ends to avoid charges.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">5.4 Cancellation</h3>
              <p>
                You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access until the period ends.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">5.5 Late Payment</h3>
              <p>
                If payment fails, we may suspend or terminate your account after reasonable notice. You remain liable for unpaid fees.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">6.1 Our Rights</h3>
              <p>
                ComplianceKit and all related content, features, and functionality are owned by us or our licensors. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Software, source code, and algorithms</li>
                <li>Website design, layout, and graphics</li>
                <li>Trademarks, logos, and brand elements</li>
                <li>Documentation and educational materials</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">6.2 License to You</h3>
              <p>
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes, subject to these Terms.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">6.3 Your Content</h3>
              <p>
                You retain ownership of all data, content, and materials you submit to the Service ("Your Content"). You grant us a license to use, store, and process Your Content solely to provide the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Protection & Privacy</h2>
              <p>
                We process your personal data in accordance with our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and applicable data protection laws including GDPR.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.1 Your Responsibilities</h3>
              <p>When using ComplianceKit, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Comply with all applicable data protection laws</li>
                <li>Have lawful basis for processing personal data through our Service</li>
                <li>Maintain appropriate consents from your website visitors</li>
                <li>Not process sensitive personal data without proper safeguards</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">7.2 Data Processing Agreement</h3>
              <p>
                Where we process personal data on your behalf, a Data Processing Agreement (DPA) governs that relationship. Contact us to execute a DPA.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">8.1 Uptime</h3>
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Maintenance, updates, and unforeseen issues may cause temporary downtime.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">8.2 Modifications</h3>
              <p>
                We reserve the right to modify, suspend, or discontinue any feature of the Service at any time with reasonable notice.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">8.3 Third-Party Services</h3>
              <p>
                The Service may integrate with third-party services (Google OAuth, PayStack, etc.). We are not responsible for third-party service availability or performance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
              <p className="font-medium uppercase">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
              </p>
              <p className="mt-3">
                To the maximum extent permitted by law, we disclaim all warranties, express or implied, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Warranties of merchantability, fitness for a particular purpose</li>
                <li>Warranties regarding accuracy, reliability, or completeness of content</li>
                <li>Warranties that the Service will be error-free, secure, or uninterrupted</li>
                <li>Warranties that defects will be corrected</li>
              </ul>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice:</p>
                <p className="text-sm mt-2 text-yellow-900 dark:text-yellow-100">
                  ComplianceKit is a tool to assist with GDPR compliance. It does not constitute legal advice. You are responsible for ensuring your own compliance with applicable laws. We recommend consulting with legal professionals for compliance matters.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="font-medium uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPLIANCEKIT SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Service interruptions or data loss</li>
                <li>Third-party claims or actions</li>
                <li>Any damages exceeding the fees you paid in the 12 months preceding the claim</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless ComplianceKit, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your violation of these Terms</li>
                <li>Your violation of any laws or third-party rights</li>
                <li>Your use or misuse of the Service</li>
                <li>Your Content or data you submit</li>
                <li>Disputes between you and third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">12.1 By You</h3>
              <p>You may terminate your account at any time by canceling your subscription or using the account deletion feature.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">12.2 By Us</h3>
              <p>We may suspend or terminate your account immediately if you:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Fail to pay fees</li>
                <li>Pose a security risk to the Service</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">12.3 Effect of Termination</h3>
              <p>Upon termination:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Your access to the Service will be revoked</li>
                <li>Your data will be deleted according to our data retention policy (see Privacy Policy)</li>
                <li>You remain liable for any unpaid fees</li>
                <li>Provisions that should survive (liability, indemnification) remain in effect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">13.1 Governing Law</h3>
              <p>
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law provisions.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">13.2 Arbitration</h3>
              <p>
                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Intellectual property disputes</li>
                <li>Claims for injunctive relief</li>
                <li>Small claims court matters</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">13.3 Class Action Waiver</h3>
              <p>
                You agree to resolve disputes individually and waive any right to bring or participate in class actions or class arbitrations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. Changes will be effective:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Immediately upon posting for non-material changes</li>
                <li>30 days after notice for material changes</li>
              </ul>
              <p className="mt-3">
                We will notify you of material changes via email or platform notification. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. General Provisions</h2>

              <h3 className="text-xl font-medium mb-3 mt-6">15.1 Entire Agreement</h3>
              <p>These Terms, along with our Privacy Policy, constitute the entire agreement between you and ComplianceKit.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">15.2 Severability</h3>
              <p>If any provision is found unenforceable, the remaining provisions remain in full effect.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">15.3 No Waiver</h3>
              <p>Our failure to enforce any right or provision does not constitute a waiver of that right or provision.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">15.4 Assignment</h3>
              <p>You may not assign these Terms without our written consent. We may assign these Terms to any successor entity.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">15.5 Force Majeure</h3>
              <p>We are not liable for delays or failures caused by circumstances beyond our reasonable control.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p><strong>Email:</strong> legal@compliancekit.com</p>
                <p><strong>Support:</strong> support@compliancekit.com</p>
                <p><strong>Address:</strong> [Your Company Address]</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By using ComplianceKit, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
            <Link href="/cookie-policy">View Cookie Policy</Link>
          </Button>
          <Button asChild className="gradient-primary">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
