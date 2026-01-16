# Data Processing Agreement (DPA)

**Between ComplianceKit and Customer**

**Last Updated:** January 16, 2026

---

## 1. Introduction

This Data Processing Agreement ("DPA") forms part of the Terms of Service between ComplianceKit ("Processor", "we", "us") and you ("Controller", "Customer", "you") and governs the processing of personal data under the General Data Protection Regulation (GDPR).

### 1.1 Definitions

Terms used in this DPA have the meanings set forth in the GDPR:

- **Personal Data:** Any information relating to an identified or identifiable natural person
- **Processing:** Any operation performed on personal data (collection, storage, use, deletion, etc.)
- **Data Subject:** The individual to whom personal data relates
- **Controller:** The entity that determines the purposes and means of processing (You/Customer)
- **Processor:** The entity that processes personal data on behalf of the Controller (ComplianceKit)

---

## 2. Scope and Applicability

### 2.1 Scope

This DPA applies when ComplianceKit processes personal data on your behalf through:
- Website scanning and cookie detection
- Consent management and tracking
- DSAR (Data Subject Access Request) management
- Analytics and reporting

### 2.2 Your Role as Controller

You are the Controller for:
- Personal data collected from your website visitors (consent data, DSAR requests)
- Personal data you input into ComplianceKit (company information, website data)

### 2.3 Our Role as Processor

ComplianceKit acts as a Processor when we:
- Store and process consent records from your website visitors
- Manage DSAR requests submitted to you
- Analyze compliance data on your behalf

---

## 3. Processor Obligations

### 3.1 Processing Instructions

ComplianceKit shall process personal data only:
- On your documented instructions (through use of the Service)
- As necessary to provide the Service under our Terms
- As required by applicable law

If we believe an instruction violates GDPR or other data protection law, we will inform you immediately.

### 3.2 Confidentiality

All ComplianceKit personnel authorized to process personal data are bound by confidentiality obligations.

### 3.3 Security Measures

We implement appropriate technical and organizational security measures, including:

**Technical Measures:**
- Encryption of data in transit (TLS/SSL) and at rest
- Secure authentication (bcrypt password hashing, JWT tokens)
- Regular security updates and patches
- Access logging and monitoring
- Automated backup systems
- Rate limiting and DDoS protection

**Organizational Measures:**
- Access controls and role-based permissions
- Security incident response procedures
- Regular security assessments
- Employee security training
- Vendor security reviews

See our [Security Documentation](./SECURITY.md) for complete details.

### 3.4 Sub-Processors

We engage the following sub-processors:

| Sub-Processor | Service | Location | Safeguards |
|---------------|---------|----------|------------|
| Vercel Inc. | Hosting & Infrastructure | USA | EU-US DPF, SCCs |
| Supabase Inc. | Database Hosting | USA/EU | SCCs, Encryption |
| PayStack | Payment Processing | South Africa | PCI-DSS, SOC 2 |
| Google LLC | OAuth Authentication | USA | EU-US DPF, SCCs |
| Resend | Transactional Emails | USA | SOC 2, SCCs |

We will:
- Notify you of any intended changes to sub-processors with 30 days' notice
- Ensure all sub-processors are bound by equivalent data protection obligations
- Remain liable for sub-processors' compliance

You may object to a new sub-processor within 30 days of notification.

### 3.5 Data Subject Rights

We will assist you in responding to data subject requests, including:
- Right of access
- Right to rectification
- Right to erasure
- Right to restriction of processing
- Right to data portability
- Right to object

**Tools Provided:**
- Data export functionality (JSON format)
- DSAR management dashboard
- Consent management interface
- Self-service data deletion

### 3.6 Data Breach Notification

In the event of a personal data breach, we will:
- Notify you without undue delay (within 72 hours of becoming aware)
- Provide details of the breach, affected data, and mitigation measures
- Cooperate with you in notifying authorities and data subjects as required

**Contact:** security@compliancekit.com

### 3.7 Data Protection Impact Assessment (DPIA)

We will provide reasonable assistance with any DPIA you conduct regarding your use of ComplianceKit.

### 3.8 Audits and Inspections

Upon reasonable notice, you may:
- Audit our compliance with this DPA (at your expense)
- Request evidence of our compliance (security certifications, audit reports)

Alternatively, you may accept our existing certifications and documentation.

---

## 4. Data Transfers

### 4.1 International Transfers

Personal data may be transferred to and processed in countries outside the European Economic Area (EEA), including the United States.

### 4.2 Transfer Mechanisms

We ensure adequate protection for international transfers through:

**Standard Contractual Clauses (SCCs):**
- We have executed EU Standard Contractual Clauses with our sub-processors
- Available upon request at legal@compliancekit.com

**Additional Safeguards:**
- Encryption of data in transit and at rest
- Access controls and authentication
- Regular security assessments
- Minimization of data transfers

**EU-US Data Privacy Framework:**
- Where applicable, we rely on sub-processors certified under the EU-US DPF

### 4.3 Your Instructions

By using ComplianceKit, you instruct us to transfer personal data as necessary to provide the Service, subject to the safeguards above.

---

## 5. Data Retention and Deletion

### 5.1 Retention Periods

| Data Type | Retention Period |
|-----------|------------------|
| Account Data | Active account + 30 days after deletion |
| Website Scan Data | 12 months or until deleted |
| Consent Records | 2 years or until consent withdrawn |
| DSAR Records | 3 years (legal requirement) |
| Billing Records | 7 years (tax/legal requirement) |
| Security Logs | 90 days |

### 5.2 Data Return and Deletion

Upon termination of service or your request, we will:
- Provide you with a copy of all your personal data (JSON format)
- Delete all personal data within 30 days
- Provide written confirmation of deletion upon request

**Exception:** We may retain data as required by law (billing records, DSAR records).

---

## 6. Your Obligations as Controller

As the Controller, you agree to:

### 6.1 Lawful Basis

- Have a lawful basis for processing personal data (consent, contract, legal obligation, etc.)
- Maintain appropriate records of processing activities
- Comply with all applicable data protection laws

### 6.2 Transparency

- Provide clear privacy notices to your website visitors
- Inform data subjects about your use of ComplianceKit as a processor
- Include ComplianceKit in your privacy policy (if required)

### 6.3 Data Subject Consent

- Obtain valid consent from website visitors (where required)
- Implement our consent banner properly
- Honor consent withdrawals promptly

### 6.4 Accurate Instructions

- Provide only lawful and accurate processing instructions
- Not require us to process special categories of personal data without prior agreement
- Ensure data you input into Compliance Kit is accurate and lawful

---

## 7. Liability and Indemnification

### 7.1 Allocation of Liability

Under GDPR Article 82:
- Each party is liable for damages caused by processing that violates its respective obligations
- You (Controller) are liable for violations of Controller obligations
- We (Processor) are liable for violations of Processor obligations
- We are not liable if we prove we are not responsible for the event giving rise to damage

### 7.2 Limitation

Our liability is limited as set forth in the Terms of Service, except as prohibited by law.

---

## 8. Term and Termination

### 8.1 Term

This DPA remains in effect for the duration of the Terms of Service.

### 8.2 Effect of Termination

Upon termination:
- We will cease processing personal data
- We will return or delete data as per Section 5.2
- Provisions that should survive (liability, confidentiality) remain in effect

---

## 9. Governing Law and Jurisdiction

This DPA is governed by the same law and jurisdiction as the Terms of Service.

---

## 10. Contact Information

**Data Protection Officer:**
Email: dpo@compliancekit.com

**Security Issues:**
Email: security@compliancekit.com

**General Contact:**
Email: legal@compliancekit.com

---

## 11. Amendments

We may update this DPA to reflect changes in law or our practices. Material changes will be notified with 30 days' notice.

---

## 12. Execution

**To execute this DPA:**

1. **Option A - Automatic:**
   - This DPA is automatically incorporated into your Terms of Service when you create an account
   - No separate signature required

2. **Option B - Formal Execution:**
   - If you require a signed DPA for your records, contact legal@compliancekit.com
   - We will provide a copy for signature within 10 business days

---

**This DPA complies with:**
- GDPR (Regulation (EU) 2016/679)
- GDPR Article 28 (Processor obligations)
- EU Standard Contractual Clauses (SCCs)

---

**ComplianceKit**
Data Processing Agreement
Version 1.0
Effective: January 16, 2026
