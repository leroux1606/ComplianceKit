import Anthropic from "@anthropic-ai/sdk";

/**
 * Input data for AI policy generation.
 * All fields are optional so callers can pass whatever they have.
 */
export interface AiPolicyInput {
  // Website info
  websiteName: string;
  websiteUrl: string;
  websiteDescription?: string;

  // Company info
  companyName: string;
  companyAddress?: string;
  companyEmail: string;
  companyWebsite?: string;
  dpoName?: string;
  dpoEmail?: string;

  // Scan data
  cookies: Array<{
    name: string;
    domain: string;
    category?: string;
    description?: string;
    expires?: Date | null;
  }>;
  scripts: Array<{
    name?: string | null;
    url?: string | null;
    category?: string | null;
  }>;
  findings: Array<{
    type: string;
    severity: string;
    title: string;
  }>;
  hasPrivacyPolicy: boolean;
  hasCookieBanner: boolean;
  complianceScore: number;
  ccpaScore?: number | null;
}

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildPrivacyPolicyPrompt(input: AiPolicyInput): string {
  const date = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const trackingScripts = input.scripts.filter(
    (s) => s.category === "analytics" || s.category === "marketing"
  );
  const marketingCookies = input.cookies.filter((c) => c.category === "marketing");
  const analyticsCookies = input.cookies.filter((c) => c.category === "analytics");

  const thirdPartyServices = [
    ...new Set(
      trackingScripts
        .map((s) => s.name)
        .filter(Boolean) as string[]
    ),
  ];

  return `You are a privacy law expert specializing in GDPR (EU) compliance. Write a complete, production-ready Privacy Policy for the following website. The policy must be comprehensive, specific to this website's actual data practices (derived from the scan data below), written in clear plain English, and structured correctly.

IMPORTANT RULES:
- Output ONLY the policy in Markdown format. No preamble, no "Here is your policy:", no explanation.
- Use ## for section headings (H2), ### for subsections (H3).
- Start directly with: # Privacy Policy — [Company Name]
- Be specific: reference actual cookie names, script providers, and data practices where relevant.
- Do NOT use placeholder text like "[INSERT HERE]" — use the data provided or omit the section.
- The policy must fully satisfy GDPR Articles 13–14 (transparency requirements).
- Where the company email or DPO details are provided, use them. Where missing, omit rather than invent.
- Include a California section (CCPA/CPRA) if there are tracking/marketing scripts or cookies.
- Tone: professional, clear, written for ordinary website visitors — not legalese.

WEBSITE INFORMATION:
- Website name: ${input.websiteName}
- Website URL: ${input.websiteUrl}
${input.websiteDescription ? `- Description: ${input.websiteDescription}` : ""}
- Date: ${date}

COMPANY INFORMATION:
- Company name: ${input.companyName}
- Company email: ${input.companyEmail}
${input.companyAddress ? `- Company address: ${input.companyAddress}` : ""}
${input.dpoName ? `- Data Protection Officer: ${input.dpoName}` : ""}
${input.dpoEmail ? `- DPO email: ${input.dpoEmail}` : ""}

SCAN DATA:
- Total cookies detected: ${input.cookies.length}
- Analytics cookies: ${analyticsCookies.length}${analyticsCookies.length > 0 ? ` (${analyticsCookies.slice(0, 5).map((c) => c.name).join(", ")})` : ""}
- Marketing cookies: ${marketingCookies.length}${marketingCookies.length > 0 ? ` (${marketingCookies.slice(0, 5).map((c) => c.name).join(", ")})` : ""}
- Third-party services detected: ${thirdPartyServices.length > 0 ? thirdPartyServices.join(", ") : "None"}
- Cookie banner present: ${input.hasCookieBanner ? "Yes" : "No"}
- Compliance score: ${input.complianceScore}/100
${input.ccpaScore !== null && input.ccpaScore !== undefined ? `- CCPA score: ${input.ccpaScore}/100` : ""}

REQUIRED POLICY SECTIONS (in order):
1. Introduction — who operates the site, purpose of the policy, effective date
2. What Personal Data We Collect — list specific categories (browser data, IP, cookies, form inputs etc.)
3. How We Collect Data — automatic collection, forms, third-party sources
4. How We Use Your Data — specific purposes, legal basis for each under GDPR Art. 6
5. Cookies and Tracking Technologies — reference the actual cookies/services found above
6. Sharing Your Data — which third parties receive data and why
7. International Data Transfers — GDPR adequacy decisions or SCCs if US services detected
8. Data Retention — how long each category is kept
9. Your Rights (GDPR Articles 15–22) — enumerate all eight rights with brief explanation
10. How to Exercise Your Rights — contact details and 30-day response commitment
${(input.ccpaScore !== null && input.ccpaScore !== undefined) || marketingCookies.length > 0 || thirdPartyServices.length > 0 ? "11. California Privacy Rights (CCPA/CPRA) — rights for California residents, Do Not Sell/Share\n12. Children's Privacy\n13. Changes to This Policy\n14. Contact Us" : "11. Children's Privacy\n12. Changes to This Policy\n13. Contact Us"}

Generate the complete Privacy Policy now:`;
}

function buildCookiePolicyPrompt(input: AiPolicyInput): string {
  const date = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const necessaryCookies = input.cookies.filter((c) => c.category === "necessary");
  const analyticsCookies = input.cookies.filter((c) => c.category === "analytics");
  const marketingCookies = input.cookies.filter((c) => c.category === "marketing");
  const functionalCookies = input.cookies.filter((c) => c.category === "functional");
  const unknownCookies = input.cookies.filter(
    (c) => !c.category || c.category === "unknown"
  );

  const trackingScripts = input.scripts.filter(
    (s) => s.category === "analytics" || s.category === "marketing"
  );
  const thirdPartyServices = [
    ...new Set(
      trackingScripts
        .map((s) => s.name)
        .filter(Boolean) as string[]
    ),
  ];

  const cookieTable = (
    cookies: typeof input.cookies,
    label: string
  ): string => {
    if (cookies.length === 0) return "";
    const rows = cookies
      .slice(0, 15)
      .map((c) => {
        const expiry = c.expires
          ? new Date(c.expires).toLocaleDateString("en-GB")
          : "Session";
        return `| ${c.name} | ${c.domain} | ${c.description || label} | ${expiry} |`;
      })
      .join("\n");
    return `| Cookie Name | Domain | Purpose | Expiry |\n|-------------|--------|---------|--------|\n${rows}`;
  };

  return `You are a privacy law expert. Write a complete, production-ready Cookie Policy for the following website. Use the actual cookie scan data provided below to create a specific, accurate policy.

IMPORTANT RULES:
- Output ONLY the policy in Markdown format. No preamble. No explanation.
- Start directly with: # Cookie Policy — [Website Name]
- Use actual cookie names and domains from the data below.
- Include a cookie table for each category (use Markdown tables).
- Be specific about third-party services that set cookies.
- Tone: professional and clear. Avoid legal jargon where possible.
- The policy must satisfy GDPR ePrivacy Directive and Art. 6/7 requirements.

WEBSITE INFORMATION:
- Website name: ${input.websiteName}
- Website URL: ${input.websiteUrl}
- Date: ${date}

COMPANY:
- ${input.companyName} — ${input.companyEmail}

DETECTED COOKIES (${input.cookies.length} total):
${necessaryCookies.length > 0 ? `NECESSARY (${necessaryCookies.length}):\n${cookieTable(necessaryCookies, "Essential website functionality")}\n` : ""}
${analyticsCookies.length > 0 ? `ANALYTICS (${analyticsCookies.length}):\n${cookieTable(analyticsCookies, "Website analytics")}\n` : ""}
${marketingCookies.length > 0 ? `MARKETING (${marketingCookies.length}):\n${cookieTable(marketingCookies, "Targeted advertising")}\n` : ""}
${functionalCookies.length > 0 ? `FUNCTIONAL (${functionalCookies.length}):\n${cookieTable(functionalCookies, "Enhanced functionality")}\n` : ""}
${unknownCookies.length > 0 ? `UNCLASSIFIED (${unknownCookies.length}): ${unknownCookies.map((c) => c.name).join(", ")}\n` : ""}

THIRD-PARTY SERVICES DETECTED:
${thirdPartyServices.length > 0 ? thirdPartyServices.join(", ") : "None detected"}

REQUIRED SECTIONS:
1. What Are Cookies? — brief explanation
2. How We Use Cookies — purposes overview
3. Cookies We Use — one subsection per category with the actual cookie tables
4. Third-Party Services — explain each detected service and link to their privacy policy
5. How to Manage Cookies — browser settings, our cookie banner, opt-out links
6. Updates to This Policy
7. Contact Us

Generate the complete Cookie Policy now:`;
}

// ─── Main generation function ─────────────────────────────────────────────────

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 4096;

/**
 * Generate an AI-powered policy using Claude.
 * Returns the markdown content string.
 * Throws if ANTHROPIC_API_KEY is not set or the API call fails.
 */
export async function generateAiPolicyContent(
  type: "privacy_policy" | "cookie_policy",
  input: AiPolicyInput
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Add it to your environment variables to use AI policy generation."
    );
  }

  const client = new Anthropic({ apiKey });

  const prompt =
    type === "privacy_policy"
      ? buildPrivacyPolicyPrompt(input)
      : buildCookiePolicyPrompt(input);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Unexpected response format from Claude API");
  }

  return textBlock.text.trim();
}
