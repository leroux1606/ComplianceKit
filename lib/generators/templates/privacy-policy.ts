export const PRIVACY_POLICY_TEMPLATE = `
<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> {{lastUpdated}}</p>

<h2>1. Introduction</h2>
<p>Welcome to {{companyName}} ("Company", "we", "us", or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website {{websiteUrl}} (the "Website").</p>

<p>Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Website.</p>

<h2>2. Data Controller</h2>
<p>The data controller responsible for your personal data is:</p>
<p>
{{companyName}}<br>
{{companyAddress}}<br>
Email: {{companyEmail}}
{{#if dpoEmail}}
<br><br>
<strong>Data Protection Officer:</strong><br>
{{dpoName}}<br>
Email: {{dpoEmail}}
{{/if}}
</p>

<h2>3. Information We Collect</h2>

<h3>3.1 Personal Data</h3>
<p>We may collect personal information that you voluntarily provide to us when you:</p>
<ul>
<li>Register on the Website</li>
<li>Express an interest in obtaining information about us or our products and services</li>
<li>Participate in activities on the Website</li>
<li>Contact us</li>
</ul>

<p>The personal information we collect may include:</p>
<ul>
<li>Name and contact data (email address, phone number)</li>
<li>Credentials (passwords, security questions)</li>
<li>Payment data (if applicable)</li>
<li>Any other information you choose to provide</li>
</ul>

<h3>3.2 Automatically Collected Information</h3>
<p>When you visit our Website, we automatically collect certain information about your device, including:</p>
<ul>
<li>IP address</li>
<li>Browser type and version</li>
<li>Operating system</li>
<li>Referring URLs</li>
<li>Pages viewed and time spent on pages</li>
<li>Date and time of visits</li>
</ul>

{{#if hasCookies}}
<h3>3.3 Cookies and Tracking Technologies</h3>
<p>We use cookies and similar tracking technologies to collect and track information about your activity on our Website. For detailed information about the cookies we use, please see our Cookie Policy.</p>

{{#if hasAnalyticsCookies}}
<p><strong>Analytics Cookies:</strong> We use analytics services to understand how visitors interact with our Website. These services may collect information about your use of the Website.</p>
{{/if}}

{{#if hasMarketingCookies}}
<p><strong>Marketing Cookies:</strong> We may use marketing cookies to deliver relevant advertisements and track the effectiveness of our marketing campaigns.</p>
{{/if}}
{{/if}}

{{#if hasTrackingScripts}}
<h3>3.4 Third-Party Services</h3>
<p>Our Website uses the following third-party services that may collect information:</p>
<ul>
{{#each trackingScripts}}
<li><strong>{{name}}</strong> - {{category}}</li>
{{/each}}
</ul>
{{/if}}

<h2>4. How We Use Your Information</h2>
<p>We use the information we collect for various purposes, including:</p>
<ul>
<li>To provide and maintain our Website</li>
<li>To notify you about changes to our Website</li>
<li>To allow you to participate in interactive features</li>
<li>To provide customer support</li>
<li>To gather analysis or valuable information to improve our Website</li>
<li>To monitor the usage of our Website</li>
<li>To detect, prevent, and address technical issues</li>
{{#if hasMarketingCookies}}
<li>To provide you with news, special offers, and general information about other goods, services, and events</li>
{{/if}}
</ul>

<h2>5. Legal Basis for Processing (GDPR)</h2>
<p>Under the General Data Protection Regulation (GDPR), we process your personal data based on the following legal grounds:</p>
<ul>
<li><strong>Consent:</strong> You have given clear consent for us to process your personal data for a specific purpose</li>
<li><strong>Contract:</strong> Processing is necessary for the performance of a contract with you</li>
<li><strong>Legal obligation:</strong> Processing is necessary for compliance with a legal obligation</li>
<li><strong>Legitimate interests:</strong> Processing is necessary for our legitimate interests or those of a third party</li>
</ul>

<h2>6. Data Retention</h2>
<p>We will retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, accounting, or reporting requirements.</p>

<p>To determine the appropriate retention period, we consider:</p>
<ul>
<li>The amount, nature, and sensitivity of the personal data</li>
<li>The potential risk of harm from unauthorized use or disclosure</li>
<li>The purposes for which we process your personal data</li>
<li>Whether we can achieve those purposes through other means</li>
<li>Applicable legal requirements</li>
</ul>

<h2>7. Your Rights Under GDPR</h2>
<p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights:</p>
<ul>
<li><strong>Right to access:</strong> You can request copies of your personal data</li>
<li><strong>Right to rectification:</strong> You can request that we correct inaccurate or complete incomplete data</li>
<li><strong>Right to erasure:</strong> You can request that we delete your personal data in certain circumstances</li>
<li><strong>Right to restrict processing:</strong> You can request that we restrict the processing of your data</li>
<li><strong>Right to data portability:</strong> You can request that we transfer your data to another organization</li>
<li><strong>Right to object:</strong> You can object to processing of your personal data</li>
<li><strong>Right to withdraw consent:</strong> You can withdraw your consent at any time</li>
</ul>

<p>To exercise any of these rights, please contact us at {{companyEmail}}.</p>

<h2>8. Data Security</h2>
<p>We have implemented appropriate technical and organizational security measures designed to protect your personal data. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.</p>

<h2>9. International Data Transfers</h2>
<p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.</p>

<p>When we transfer your personal data to other countries, we will protect that data as described in this Privacy Policy and in accordance with applicable law.</p>

<h2>10. Children's Privacy</h2>
<p>Our Website is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.</p>

<h2>11. Changes to This Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

<p>We encourage you to review this Privacy Policy periodically for any changes.</p>

<h2>12. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us:</p>
<p>
{{companyName}}<br>
Email: {{companyEmail}}<br>
{{companyAddress}}
</p>

{{#if dpoEmail}}
<p>Or contact our Data Protection Officer at: {{dpoEmail}}</p>
{{/if}}
`;



