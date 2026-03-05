import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Processing Agreement | ComplianceKit",
  description: "ComplianceKit Data Processing Agreement — governs the processing of personal data by ComplianceKit on behalf of customers under GDPR Article 28.",
};

export default function DpaPage() {
  const lastUpdated = "March 5, 2026";
  const effectiveDate = "March 5, 2026";

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
          <h1 className="text-4xl font-bold mb-2">Data Processing Agreement</h1>
          <p className="text-muted-foreground mb-2">Last Updated: {lastUpdated}</p>
          <p className="text-muted-foreground mb-8">Effective Date: {effectiveDate}</p>

          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              This Data Processing Agreement (&quot;DPA&quot;) forms part of the Terms of Service between you (&quot;Controller&quot;) and ComplianceKit (&quot;Processor&quot;) and is required under GDPR Article 28 for any relationship where a processor handles personal data on behalf of a controller.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
              <p>In this DPA, the following terms have the meanings given below:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>&quot;Controller&quot;</strong> means you, the ComplianceKit customer, who determines the purposes and means of processing personal data.</li>
                <li><strong>&quot;Processor&quot;</strong> means ComplianceKit, who processes personal data on behalf of the Controller.</li>
                <li><strong>&quot;Personal Data&quot;</strong> has the meaning given in Article 4(1) GDPR: any information relating to an identified or identifiable natural person.</li>
                <li><strong>&quot;Processing&quot;</strong> has the meaning given in Article 4(2) GDPR.</li>
                <li><strong>&quot;Data Subject&quot;</strong> means the natural person to whom Personal Data relates — typically visitors to your website.</li>
                <li><strong>&quot;GDPR&quot;</strong> means Regulation (EU) 2016/679 of the European Parliament and of the Council.</li>
                <li><strong>&quot;Sub-processor&quot;</strong> means any third party engaged by the Processor to process Personal Data under this DPA.</li>
                <li><strong>&quot;Services&quot;</strong> means the ComplianceKit platform as described in the Terms of Service.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Parties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">Data Controller</p>
                  <p className="text-sm text-muted-foreground">The ComplianceKit customer who has accepted these terms upon registration. Contact details are those provided in your ComplianceKit account.</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">Data Processor</p>
                  <p className="text-sm text-muted-foreground">ComplianceKit<br />Email: legal@compliancekit.com<br />Address: [Company Address]</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Subject Matter and Duration</h2>
              <p>
                This DPA governs the processing of Personal Data by ComplianceKit (Processor) on behalf of the customer (Controller) in connection with the provision of the Services.
              </p>
              <p className="mt-3">
                This DPA commences on the date the Controller accepts it (upon account registration) and continues for as long as the Processor processes Personal Data on behalf of the Controller, unless terminated earlier in accordance with the Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Nature and Purpose of Processing</h2>
              <p>ComplianceKit processes Personal Data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Recording and storing cookie consent decisions made by your website visitors</li>
                <li>Processing Data Subject Access Requests (DSARs) submitted through your website</li>
                <li>Generating compliance reports and analytics related to consent activity on your website</li>
                <li>Hosting and delivering your cookie consent banner to your website visitors</li>
                <li>Scanning your website to identify cookies and tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Types of Personal Data Processed</h2>
              <p>The following categories of Personal Data may be processed under this DPA:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Consent records:</strong> Visitor pseudonymous identifier (UUID), IP address, browser user agent, consent preferences (categories accepted/rejected), consent timestamp, consent method (accept all / reject all / custom)</li>
                <li><strong>DSAR submissions:</strong> Requester name, email address, phone number (if provided), description of the request, any additional information provided by the data subject</li>
                <li><strong>Technical data:</strong> IP addresses collected during consent recording (personal data under GDPR)</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                Note: ComplianceKit does not process any special category data (Article 9 GDPR) unless you explicitly provide such data in DSAR descriptions or notes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Categories of Data Subjects</h2>
              <p>The Personal Data processed under this DPA relates to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Visitors to the Controller&apos;s website(s) who interact with the consent banner</li>
                <li>Individuals who submit Data Subject Access Requests through the Controller&apos;s DSAR form</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Obligations of the Processor</h2>
              <p>ComplianceKit, as Processor, agrees to:</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.1 Process Only on Documented Instructions</h3>
              <p>Process Personal Data only on documented instructions from the Controller (as set out in this DPA and the Terms of Service), unless required to do so by law.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.2 Confidentiality</h3>
              <p>Ensure that personnel authorised to process Personal Data have committed themselves to confidentiality or are under appropriate statutory obligations of confidentiality.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.3 Security (Article 32 GDPR)</h3>
              <p>Implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Encryption of data in transit (TLS/HTTPS)</li>
                <li>Encryption of data at rest</li>
                <li>Access controls limiting data access to authorised personnel</li>
                <li>Regular assessment and testing of security measures</li>
                <li>Ability to restore availability and access to Personal Data in the event of a physical or technical incident</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">7.4 Sub-processors (Article 28(2) GDPR)</h3>
              <p>Not engage Sub-processors without prior specific or general written authorisation of the Controller. The Controller hereby provides general authorisation for the Sub-processors listed in Section 9 of this DPA. ComplianceKit will inform the Controller of any intended changes to Sub-processors with reasonable notice, giving the Controller the opportunity to object.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.5 Data Subject Rights</h3>
              <p>Assist the Controller (by appropriate technical and organisational measures) in fulfilling the Controller&apos;s obligation to respond to requests by Data Subjects exercising their rights under Chapter III GDPR, including rights of access, rectification, erasure, restriction, portability, and objection.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.6 Security Assistance</h3>
              <p>Assist the Controller in ensuring compliance with Articles 32 to 36 GDPR, taking into account the nature of processing and the information available to the Processor. This includes notifying the Controller without undue delay after becoming aware of a Personal Data breach.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.7 Deletion or Return of Data</h3>
              <p>At the choice of the Controller, delete or return all Personal Data to the Controller after the end of the provision of Services, and delete existing copies, unless applicable law requires storage of the Personal Data.</p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.8 Audit</h3>
              <p>Make available to the Controller all information necessary to demonstrate compliance with Article 28 GDPR and allow for and contribute to audits and inspections conducted by the Controller or another auditor mandated by the Controller, subject to reasonable notice and confidentiality obligations.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Obligations of the Controller</h2>
              <p>The Controller agrees to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Ensure that it has a lawful basis for processing Personal Data through the Services</li>
                <li>Ensure that Data Subjects have been informed about the processing of their Personal Data in accordance with Articles 13 and 14 GDPR (e.g., through your Privacy Policy)</li>
                <li>Comply with all applicable data protection laws in connection with its use of the Services</li>
                <li>Ensure that instructions given to ComplianceKit do not violate GDPR or other applicable law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Sub-processors</h2>
              <p>The Controller hereby authorises ComplianceKit to engage the following Sub-processors:</p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold">Sub-processor</th>
                      <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                      <th className="text-left py-2 font-semibold">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4">Supabase / PostgreSQL</td>
                      <td className="py-2 pr-4">Database storage of consent records and DSAR submissions</td>
                      <td className="py-2">EU / US (configurable)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Resend</td>
                      <td className="py-2 pr-4">Transactional email delivery (DSAR notifications)</td>
                      <td className="py-2">US</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Vercel</td>
                      <td className="py-2 pr-4">Application hosting and serverless compute</td>
                      <td className="py-2">US / EU (Edge Network)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                ComplianceKit will provide at least 14 days&apos; notice before adding or replacing Sub-processors. Notice will be provided by email to the address registered on your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p>
                Some Sub-processors listed above are located outside the European Economic Area (EEA). Where Personal Data is transferred to countries not providing an adequate level of data protection, ComplianceKit ensures appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Reliance on the recipient country&apos;s adequacy decision where applicable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Data Breach Notification</h2>
              <p>
                In the event of a Personal Data breach (Article 4(12) GDPR), ComplianceKit will notify the Controller without undue delay and, where feasible, not later than 72 hours after becoming aware. The notification will include, to the extent available:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>A description of the nature of the breach, including categories and approximate number of Data Subjects and records affected</li>
                <li>The name and contact details of the Data Protection contact point</li>
                <li>The likely consequences of the breach</li>
                <li>The measures taken or proposed to address the breach</li>
              </ul>
              <p className="mt-3">
                The Controller is responsible for assessing whether the breach must be notified to the relevant supervisory authority and/or to affected Data Subjects.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Data Retention and Deletion</h2>
              <p>
                ComplianceKit retains Personal Data for the duration of the active subscription. Retention periods for consent records are determined by the Controller&apos;s subscription plan:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Free:</strong> 7 days</li>
                <li><strong>Starter:</strong> 30 days</li>
                <li><strong>Professional:</strong> 1 year</li>
                <li><strong>Enterprise:</strong> 3 years</li>
              </ul>
              <p className="mt-3">
                Upon account deletion or termination of the Services, Personal Data will be deleted within 30 days, except where longer retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Liability</h2>
              <p>
                Each party shall be liable to the other for any damage caused by a breach of this DPA. ComplianceKit&apos;s total liability under this DPA is subject to the limitations set out in the Terms of Service.
              </p>
              <p className="mt-3">
                Where both parties are responsible for damage caused by a breach of this DPA, they shall be held liable and each party may seek from the other party that part of the compensation corresponding to the part of the damage for which that party is responsible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
              <p>
                This DPA shall be governed by and construed in accordance with the laws applicable to the Terms of Service between the parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Changes to This DPA</h2>
              <p>
                ComplianceKit may update this DPA from time to time to reflect changes in law, Sub-processors, or Services. We will notify Controllers of material changes at least 30 days in advance by email. Continued use of the Services after the effective date of any change constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">16. Contact</h2>
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p><strong>Data Protection contact:</strong> legal@compliancekit.com</p>
                <p><strong>Support:</strong> support@compliancekit.com</p>
                <p><strong>Address:</strong> [Company Address]</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By accepting this DPA during registration, the Controller acknowledges that they have read, understood, and agree to be bound by its terms. Acceptance is recorded with a timestamp in the Controller&apos;s account record.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/terms">View Terms of Service</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
          <Button asChild className="gradient-primary">
            <Link href="/sign-up">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
