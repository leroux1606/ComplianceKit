export const COOKIE_POLICY_TEMPLATE = `
<h1>Cookie Policy</h1>
<p><strong>Last updated:</strong> {{lastUpdated}}</p>

<h2>1. Introduction</h2>
<p>This Cookie Policy explains how {{companyName}} ("Company", "we", "us", or "our") uses cookies and similar technologies when you visit our website {{websiteUrl}} (the "Website").</p>

<p>By using our Website, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree to our use of cookies, you should set your browser settings accordingly or not use our Website.</p>

<h2>2. What Are Cookies?</h2>
<p>Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>

<p>Cookies can be "persistent" or "session" cookies:</p>
<ul>
<li><strong>Persistent cookies</strong> remain on your device for a set period or until you delete them</li>
<li><strong>Session cookies</strong> are deleted when you close your browser</li>
</ul>

<h2>3. How We Use Cookies</h2>
<p>We use cookies for the following purposes:</p>
<ul>
<li><strong>Essential cookies:</strong> Required for the Website to function properly</li>
<li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
<li><strong>Analytics cookies:</strong> Help us understand how visitors use our Website</li>
<li><strong>Marketing cookies:</strong> Track your activity to deliver relevant advertising</li>
</ul>

<h2>4. Types of Cookies We Use</h2>

<h3>4.1 Necessary Cookies</h3>
<p>These cookies are essential for the Website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.</p>

{{#if hasNecessaryCookies}}
<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
{{#each necessaryCookies}}
<tr>
<td>{{name}}</td>
<td>{{description}}</td>
<td>{{#if expires}}{{expires}}{{else}}Session{{/if}}</td>
</tr>
{{/each}}
</tbody>
</table>
{{/if}}

{{#if hasAnalyticsCookies}}
<h3>4.2 Analytics Cookies</h3>
<p>These cookies help us understand how visitors interact with our Website by collecting and reporting information anonymously.</p>

<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
{{#each analyticsCookies}}
<tr>
<td>{{name}}</td>
<td>{{description}}</td>
<td>{{#if expires}}{{expires}}{{else}}Session{{/if}}</td>
</tr>
{{/each}}
</tbody>
</table>
{{/if}}

{{#if hasMarketingCookies}}
<h3>4.3 Marketing Cookies</h3>
<p>These cookies are used to track visitors across websites to display ads that are relevant and engaging for the individual user.</p>

<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
{{#each marketingCookies}}
<tr>
<td>{{name}}</td>
<td>{{description}}</td>
<td>{{#if expires}}{{expires}}{{else}}Session{{/if}}</td>
</tr>
{{/each}}
</tbody>
</table>
{{/if}}

{{#if hasFunctionalCookies}}
<h3>4.4 Functional Cookies</h3>
<p>These cookies enable enhanced functionality and personalization, such as remembering your preferences.</p>

<table>
<thead>
<tr><th>Cookie Name</th><th>Purpose</th><th>Duration</th></tr>
</thead>
<tbody>
{{#each functionalCookies}}
<tr>
<td>{{name}}</td>
<td>{{description}}</td>
<td>{{#if expires}}{{expires}}{{else}}Session{{/if}}</td>
</tr>
{{/each}}
</tbody>
</table>
{{/if}}

{{#if hasTrackingScripts}}
<h2>5. Third-Party Services</h2>
<p>We use the following third-party services that may set cookies:</p>

<table>
<thead>
<tr><th>Service</th><th>Purpose</th><th>Privacy Policy</th></tr>
</thead>
<tbody>
{{#each trackingScripts}}
<tr>
<td>{{name}}</td>
<td>{{category}}</td>
<td><a href="#">View Policy</a></td>
</tr>
{{/each}}
</tbody>
</table>
{{/if}}

<h2>6. Managing Cookies</h2>
<p>You can control and manage cookies in several ways:</p>

<h3>6.1 Browser Settings</h3>
<p>Most browsers allow you to refuse or accept cookies through their settings. The following links provide information on how to manage cookies in popular browsers:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac">Safari</a></li>
<li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Microsoft Edge</a></li>
</ul>

<h3>6.2 Our Cookie Consent Tool</h3>
<p>When you first visit our Website, you will see a cookie banner that allows you to accept or reject different categories of cookies. You can change your preferences at any time by clicking on the cookie settings link in our footer.</p>

<h3>6.3 Opt-Out Links</h3>
<p>You can opt out of certain third-party cookies directly:</p>
<ul>
<li><a href="https://tools.google.com/dlpage/gaoptout">Google Analytics Opt-out</a></li>
<li><a href="https://www.facebook.com/policies/cookies/">Facebook Cookie Settings</a></li>
<li><a href="https://optout.aboutads.info/">Digital Advertising Alliance Opt-out</a></li>
</ul>

<h2>7. Impact of Disabling Cookies</h2>
<p>If you choose to disable cookies, some features of our Website may not function properly. Essential cookies cannot be disabled as they are necessary for the Website to work.</p>

<h2>8. Updates to This Policy</h2>
<p>We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. Any changes will be posted on this page with an updated "Last updated" date.</p>

<h2>9. Contact Us</h2>
<p>If you have any questions about our use of cookies, please contact us:</p>
<p>
{{companyName}}<br>
Email: {{companyEmail}}<br>
{{companyAddress}}
</p>
`;

