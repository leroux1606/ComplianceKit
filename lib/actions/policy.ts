"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Policy } from "@prisma/client";

/**
 * Generate a policy for a website based on scan results
 */
export async function generatePolicy(
  websiteId: string,
  type: "privacy_policy" | "cookie_policy"
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get user's company details
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      companyName: true,
      companyAddress: true,
      companyEmail: true,
      dpoName: true,
      dpoEmail: true,
    },
  });

  // Get website with latest scan
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          cookies: true,
          scripts: true,
        },
      },
    },
  });

  if (!website) {
    throw new Error("Website not found");
  }

  const latestScan = website.scans[0];
  if (!latestScan) {
    throw new Error("No scan found. Please run a scan first.");
  }

  // Deactivate previous versions of this policy type
  await db.policy.updateMany({
    where: {
      websiteId,
      type,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Merge user company details with website details (user details take precedence)
  const mergedDetails = {
    ...website,
    companyName: user?.companyName || website.companyName || website.name,
    companyAddress: user?.companyAddress || website.companyAddress || "",
    companyEmail: user?.companyEmail || website.companyEmail || website.dpoEmail || "contact@example.com",
    dpoName: user?.dpoName || website.dpoName || "",
    dpoEmail: user?.dpoEmail || website.dpoEmail || user?.companyEmail || website.companyEmail || "",
  };

  // Generate policy content based on type
  const content = generatePolicyContent(type, mergedDetails, latestScan);
  const htmlContent = generatePolicyHTML(type, mergedDetails, latestScan);

  // Get current version number
  const previousPolicy = await db.policy.findFirst({
    where: { websiteId, type },
    orderBy: { version: "desc" },
  });

  const version = (previousPolicy?.version || 0) + 1;

  // Create new policy
  const policy = await db.policy.create({
    data: {
      websiteId,
      type,
      content,
      htmlContent,
      version,
      isActive: true,
    },
  });

  revalidatePath(`/dashboard/websites/${websiteId}`);
  return policy;
}

/**
 * Get all policies for a website
 */
export async function getPolicies(websiteId: string): Promise<Policy[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const policies = await db.policy.findMany({
    where: {
      website: {
        id: websiteId,
        userId: session.user.id,
      },
    },
    orderBy: { generatedAt: "desc" },
  });

  return policies;
}

/**
 * Get a single policy
 */
export async function getPolicy(policyId: string): Promise<Policy | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const policy = await db.policy.findFirst({
    where: {
      id: policyId,
      website: {
        userId: session.user.id,
      },
    },
  });

  return policy;
}

/**
 * Delete a policy
 */
export async function deletePolicy(policyId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const policy = await db.policy.findFirst({
    where: {
      id: policyId,
      website: {
        userId: session.user.id,
      },
    },
  });

  if (!policy) {
    throw new Error("Policy not found");
  }

  await db.policy.delete({
    where: { id: policyId },
  });

  revalidatePath(`/dashboard/websites/${policy.websiteId}`);
}

/**
 * Generate policy text content
 */
function generatePolicyContent(
  type: string,
  website: any,
  scan: any
): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (type === "privacy_policy") {
    return generatePrivacyPolicyContent(website, scan, date);
  } else {
    return generateCookiePolicyContent(website, scan, date);
  }
}

/**
 * Generate privacy policy content
 */
function generatePrivacyPolicyContent(
  website: any,
  scan: any,
  date: string
): string {
  const cookieCount = scan.cookies.length;
  const trackingCookies = scan.cookies.filter(
    (c: any) => c.category === "analytics" || c.category === "marketing"
  ).length;

  const companyName = website.companyName || website.name;
  const companyEmail = website.companyEmail || website.dpoEmail || "contact@example.com";

  return `# Privacy Policy for ${website.name}

**Last Updated:** ${date}

## 1. Introduction

Welcome to ${website.name} (${website.url}). This Privacy Policy explains how ${companyName} collects, uses, and protects your personal information when you visit our website.

## 2. Information We Collect

### 2.1 Automatically Collected Information
When you visit our website, we automatically collect certain information about your device, including:
- IP address
- Browser type and version
- Operating system
- Pages visited and time spent on pages
- Referring website

### 2.2 Cookies and Tracking Technologies
We use ${cookieCount} cookies on our website${trackingCookies > 0 ? `, including ${trackingCookies} tracking cookies for analytics and marketing purposes` : ""}. For detailed information about cookies, please see our Cookie Policy.

### 2.3 Information You Provide
We may collect information you voluntarily provide, such as:
- Name and email address when you contact us
- Information submitted through forms
- Newsletter subscription information

## 3. How We Use Your Information

We use the collected information for the following purposes:
- To provide and maintain our website
- To improve user experience
- To analyze website usage and trends
- To communicate with you
${trackingCookies > 0 ? "- To deliver targeted advertising\n- To measure marketing campaign effectiveness" : ""}

## 4. Legal Basis for Processing (GDPR)

Under the General Data Protection Regulation (GDPR), we process your personal data on the following legal bases:
- **Consent:** When you accept cookies or provide information voluntarily
- **Legitimate Interests:** For website analytics and improvements
- **Legal Obligation:** When required by law

## 5. Data Sharing and Third Parties

${scan.scripts.filter((s: any) => s.category === "analytics" || s.category === "marketing").length > 0 ? `We share data with the following third-party services for analytics and marketing:
${scan.scripts
  .filter((s: any) => s.category === "analytics" || s.category === "marketing")
  .map((s: any) => `- ${s.name || "Unknown Service"}`)
  .join("\n")}

These services may collect and process data according to their own privacy policies.` : "We do not share your personal data with third parties except as required by law."}

## 6. Your Rights Under GDPR

You have the following rights regarding your personal data:
- **Right to Access:** Request a copy of your personal data
- **Right to Rectification:** Correct inaccurate or incomplete data
- **Right to Erasure:** Request deletion of your personal data
- **Right to Restrict Processing:** Limit how we use your data
- **Right to Data Portability:** Receive your data in a machine-readable format
- **Right to Object:** Object to certain types of processing
- **Right to Withdraw Consent:** Withdraw consent at any time

To exercise these rights, please contact us at ${companyEmail}.

## 7. Data Retention

We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law. Cookie data is typically retained for the duration specified in our Cookie Policy.

## 8. Data Security

We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.

## 9. International Data Transfers

Your data may be transferred to and processed in countries outside your country of residence. We ensure appropriate safeguards are in place for such transfers.

## 10. Children's Privacy

Our website is not intended for children under 16 years of age. We do not knowingly collect personal data from children.

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. The updated version will be indicated by the "Last Updated" date at the top of this policy.

## 12. Contact Information

If you have questions about this Privacy Policy or wish to exercise your rights, please contact:

${companyName}
${website.companyAddress || ""}
Email: ${companyEmail}
${website.dpoName ? `Data Protection Officer: ${website.dpoName} (${website.dpoEmail || companyEmail})` : ""}

---

*This privacy policy was generated by ComplianceKit based on your website scan results.*`;
}

/**
 * Generate cookie policy content
 */
function generateCookiePolicyContent(
  website: any,
  scan: any,
  date: string
): string {
  const cookies = scan.cookies;
  const necessaryCookies = cookies.filter((c: any) => c.category === "necessary");
  const analyticsCookies = cookies.filter((c: any) => c.category === "analytics");
  const marketingCookies = cookies.filter((c: any) => c.category === "marketing");
  const functionalCookies = cookies.filter((c: any) => c.category === "functional");

  const companyName = website.companyName || website.name;

  return `# Cookie Policy for ${website.name}

**Last Updated:** ${date}

## What Are Cookies?

Cookies are small text files that are placed on your device when you visit a website. They help websites remember your preferences and provide a better user experience.

## How We Use Cookies

${website.name} uses ${cookies.length} cookies to:
- Remember your preferences and settings
- Understand how you use our website
- Improve your experience
${analyticsCookies.length > 0 ? "- Analyze website traffic and performance" : ""}
${marketingCookies.length > 0 ? "- Deliver relevant advertisements" : ""}

## Types of Cookies We Use

${necessaryCookies.length > 0 ? `### 1. Necessary Cookies (${necessaryCookies.length})
These cookies are essential for the website to function properly and cannot be disabled.

${necessaryCookies.slice(0, 10).map((c: any) => `- **${c.name}** (${c.domain})
  - Purpose: Essential website functionality
  - Expires: ${c.expires ? new Date(c.expires).toLocaleDateString() : "Session"}
  - Secure: ${c.secure ? "Yes" : "No"}`).join("\n\n")}
` : ""}

${analyticsCookies.length > 0 ? `### 2. Analytics Cookies (${analyticsCookies.length})
These cookies help us understand how visitors interact with our website.

${analyticsCookies.slice(0, 10).map((c: any) => `- **${c.name}** (${c.domain})
  - Purpose: Website analytics and performance monitoring
  - Expires: ${c.expires ? new Date(c.expires).toLocaleDateString() : "Session"}
  - Secure: ${c.secure ? "Yes" : "No"}`).join("\n\n")}
` : ""}

${marketingCookies.length > 0 ? `### 3. Marketing Cookies (${marketingCookies.length})
These cookies are used to deliver advertisements relevant to you.

${marketingCookies.slice(0, 10).map((c: any) => `- **${c.name}** (${c.domain})
  - Purpose: Targeted advertising and marketing
  - Expires: ${c.expires ? new Date(c.expires).toLocaleDateString() : "Session"}
  - Secure: ${c.secure ? "Yes" : "No"}`).join("\n\n")}
` : ""}

${functionalCookies.length > 0 ? `### 4. Functional Cookies (${functionalCookies.length})
These cookies enable enhanced functionality and personalization.

${functionalCookies.slice(0, 10).map((c: any) => `- **${c.name}** (${c.domain})
  - Purpose: Enhanced functionality and user preferences
  - Expires: ${c.expires ? new Date(c.expires).toLocaleDateString() : "Session"}
  - Secure: ${c.secure ? "Yes" : "No"}`).join("\n\n")}
` : ""}

## Managing Cookies

You can control and manage cookies in several ways:

### Browser Settings
Most browsers allow you to:
- View and delete cookies
- Block cookies from specific websites
- Block all cookies
- Delete all cookies when you close the browser

Please note that blocking or deleting cookies may impact your experience on our website.

### Our Cookie Banner
When you first visit our website, we display a cookie consent banner that allows you to:
- Accept all cookies
- Reject non-essential cookies
- Customize your cookie preferences

You can change your cookie preferences at any time by clicking the "Cookie Settings" link in the footer.

## Third-Party Cookies

Some cookies on our website are set by third-party services:

${scan.scripts
  .filter((s: any) => s.category === "analytics" || s.category === "marketing")
  .map((s: any) => `- **${s.name || "Unknown Service"}**: ${s.category}`)
  .join("\n")}

These third parties may use cookies according to their own privacy policies. We recommend reviewing their policies for more information.

## Updates to This Policy

We may update this Cookie Policy to reflect changes to our use of cookies or for other operational, legal, or regulatory reasons. Please check this page periodically for updates.

## Contact Us

If you have questions about our use of cookies, please contact us at:

${companyName}
Email: ${website.companyEmail || website.dpoEmail || "contact@example.com"}

---

*This cookie policy was generated by ComplianceKit based on your website scan results.*`;
}

/**
 * Generate HTML version of policy
 */
function generatePolicyHTML(type: string, website: any, scan: any): string {
  const content = generatePolicyContent(type, website, scan);
  
  // Convert markdown to basic HTML
  let html = content
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) {
        return `<h1>${line.substring(2)}</h1>`;
      } else if (line.startsWith("## ")) {
        return `<h2>${line.substring(3)}</h2>`;
      } else if (line.startsWith("### ")) {
        return `<h3>${line.substring(4)}</h3>`;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`;
      } else if (line.startsWith("- ")) {
        return `<li>${line.substring(2)}</li>`;
      } else if (line.trim() === "") {
        return "<br>";
      } else if (line.startsWith("*") && line.endsWith("*")) {
        return `<p class="text-muted"><em>${line.substring(1, line.length - 1)}</em></p>`;
      } else {
        return `<p>${line}</p>`;
      }
    })
    .join("\n");

  // Wrap lists
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${type === "privacy_policy" ? "Privacy Policy" : "Cookie Policy"} - ${website.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { font-size: 2em; margin-bottom: 0.5em; border-bottom: 2px solid #0f172a; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; color: #0f172a; }
    h3 { font-size: 1.2em; margin-top: 1em; color: #475569; }
    ul { padding-left: 20px; }
    li { margin-bottom: 0.5em; }
    strong { color: #0f172a; }
    .text-muted { color: #64748b; font-size: 0.9em; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}
