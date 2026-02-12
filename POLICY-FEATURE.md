# Policy Generation Feature

## Overview

The Policy Generation feature automatically creates GDPR-compliant Privacy Policies and Cookie Policies based on your website scan results.

## Features

### 1. **Automated Policy Generation**
- **Privacy Policy**: Covers data collection, user rights, GDPR compliance, third-party services
- **Cookie Policy**: Lists all detected cookies with purposes, categories, and expiration dates
- Policies are generated from the latest scan results
- Each generation creates a new version

### 2. **Policy Management**
- View all generated policies by type
- Track policy versions
- Mark active policies
- Download in multiple formats (Markdown, HTML, Plain Text)
- Delete old policy versions

### 3. **GDPR Compliance**
Privacy policies include:
- User rights under GDPR (access, rectification, erasure, etc.)
- Data collection methods
- Legal basis for processing
- Data retention policies
- Contact information for data protection officer
- International data transfer information

Cookie policies include:
- Complete list of detected cookies
- Cookie categories (Necessary, Analytics, Marketing, Functional)
- Cookie purposes and data collected
- Cookie expiration dates
- Security flags (Secure, HttpOnly)
- Third-party cookie providers

## How to Use

### 1. Run a Website Scan
Before generating policies, ensure you have scan results:
1. Navigate to your website in the dashboard
2. Click "Run Scan"
3. Wait for the scan to complete

### 2. Generate a Policy
1. Go to your website's **Policies** tab or **Quick Actions** → "Manage Policies"
2. Click "Generate Privacy Policy" or "Generate Cookie Policy"
3. The system will analyze your latest scan and create a comprehensive policy
4. The new policy is automatically marked as "Active"

### 3. Review and Customize
1. Click "View" on any generated policy
2. Review the content in three formats:
   - **Preview**: Formatted HTML view
   - **Markdown**: Source markdown format
   - **HTML**: Full HTML code with styling
3. Download the policy in your preferred format
4. Customize the downloaded policy as needed for your specific use case

### 4. Publish on Your Website
1. Have the policy reviewed by legal counsel (recommended)
2. Add your company-specific details
3. Upload the policy to your website
4. Link to the policy from your footer and cookie banner

## Policy Content

### Privacy Policy Sections
1. **Introduction** - Welcome and overview
2. **Information We Collect** - Types of data collected automatically and voluntarily
3. **How We Use Your Information** - Purposes of data processing
4. **Legal Basis for Processing** - GDPR compliance explanation
5. **Data Sharing and Third Parties** - List of third-party services
6. **Your Rights Under GDPR** - Complete list of user rights
7. **Data Retention** - How long data is kept
8. **Data Security** - Security measures in place
9. **International Data Transfers** - Cross-border data processing
10. **Children's Privacy** - Age restrictions
11. **Changes to This Policy** - Update notifications
12. **Contact Information** - How to reach you and your DPO

### Cookie Policy Sections
1. **What Are Cookies** - Cookie explanation
2. **How We Use Cookies** - Cookie purposes
3. **Types of Cookies** - Breakdown by category:
   - Necessary Cookies
   - Analytics Cookies
   - Marketing Cookies
   - Functional Cookies
4. **Managing Cookies** - Browser settings and consent banner
5. **Third-Party Cookies** - External services
6. **Updates to This Policy** - Change notification
7. **Contact Us** - Contact information

## Best Practices

1. **Regular Updates**: Generate new policies after significant changes to your website or tracking setup
2. **Legal Review**: Always have policies reviewed by qualified legal professionals
3. **Keep Versions**: Keep old versions for compliance records
4. **User Accessibility**: Make policies easily accessible from every page of your website
5. **Clear Language**: While comprehensive, the generated policies use clear, understandable language

## Technical Details

### Database Schema
Policies are stored in the `policies` table with:
- `type`: "privacy_policy" or "cookie_policy"
- `version`: Auto-incrementing version number
- `isActive`: Boolean flag for current policy
- `content`: Markdown formatted content
- `htmlContent`: Pre-rendered HTML version

### Policy Generation Logic
Located in `lib/actions/policy.ts`:
- `generatePolicy()`: Main function to create policies
- `generatePrivacyPolicyContent()`: Privacy policy template logic
- `generateCookiePolicyContent()`: Cookie policy template logic
- `generatePolicyHTML()`: Converts markdown to styled HTML

### UI Components
- `app/(dashboard)/dashboard/websites/[id]/policies/page.tsx`: Policy list page
- `app/(dashboard)/dashboard/websites/[id]/policies/[policyId]/page.tsx`: Individual policy view
- `components/dashboard/generate-policy-button.tsx`: Generation button
- `components/dashboard/download-policy-button.tsx`: Download dropdown
- `components/dashboard/delete-policy-button.tsx`: Delete functionality

## Important Notes

⚠️ **Legal Disclaimer**: Generated policies are templates based on automated website scans. They should be reviewed and approved by qualified legal professionals before publication. ComplianceKit does not provide legal advice.

⚠️ **Accuracy**: Policy content is only as accurate as the scan results. Ensure scans are up-to-date and complete before generating policies.

⚠️ **Customization Required**: Generated policies contain placeholders and generic language that should be customized to your specific:
- Business model
- Data processing activities
- Legal jurisdictions
- Industry regulations

## Future Enhancements

Potential improvements for future releases:
- Multi-language policy generation
- Custom policy templates
- Policy comparison tool (diff between versions)
- Automatic policy updates when scans change
- Terms of Service generator
- GDPR consent record integration
- Policy change notifications to users
