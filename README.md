# ComplianceKit

**Your Complete GDPR Compliance Platform**

ComplianceKit is a comprehensive SaaS platform that automates GDPR compliance for websites and businesses. Scan your website, generate legal documents, manage cookie consent, handle data subject requests, and maintain ongoing compliance - all from one dashboard.

---

## 🚀 Features

### 🔍 **Automated Website Scanning**
- Detects all cookies and tracking scripts
- Analyzes privacy policy content (12 GDPR elements)
- Checks cookie consent banner quality (6 criteria)
- Verifies user data rights implementation
- Generates comprehensive compliance score (0-100)

### 📄 **Legal Document Generation**
- Privacy Policy (GDPR Articles 13-14 compliant)
- Cookie Policy
- Terms of Service
- Data Processing Agreement (DPA)

### 🍪 **Cookie Consent Management**
- GDPR-compliant consent banner
- Granular consent by category
- No dark patterns (equal reject/accept buttons)
- Consent tracking and audit trail
- Easy embed code

### 📮 **DSAR Management System**
- Handle all data subject rights requests
- 30-day deadline tracking
- Public submission forms
- Activity audit trail
- Automated workflows

### 📊 **Analytics & Reporting**
- Compliance score trends
- Consent acceptance rates
- DSAR request tracking
- Detailed compliance reports

### 🌐 **Multi-Language Support**
- 5 languages supported (English, German, French, Spanish, Dutch)
- Localized legal documents
- Internationalization ready

---

## 🎯 GDPR Coverage

ComplianceKit covers **25+ GDPR articles** with **50+ compliance checks**:

✅ **Article 6** - Legal basis verification
✅ **Article 7** - Consent quality analysis (no dark patterns)
✅ **Article 8** - Children's data protection
✅ **Article 9** - Special category data detection
✅ **Articles 12-14** - Privacy policy content analysis
✅ **Articles 15-22** - All data subject rights
✅ **Article 22** - Automated decision-making disclosure
✅ **Article 25** - Data protection by design
✅ **Article 28** - Data Processing Agreement
✅ **Article 30** - Records of processing
✅ **Articles 33-34** - Data breach procedures
✅ **Article 35** - DPIA framework
✅ **Articles 44-50** - International transfers

---

## 🛠️ Technology Stack

**Frontend:**
- Next.js 16 (React) with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend:**
- Next.js Server Actions
- Prisma ORM
- PostgreSQL (Supabase)

**Authentication:**
- NextAuth.js 5.0
- bcrypt password hashing
- JWT sessions
- OAuth (Google)

**Scanner:**
- Puppeteer (headless Chrome)
- Real browser automation
- JavaScript execution

**Security:**
- Rate limiting
- CORS protection
- XSS/CSRF prevention
- Account lockout
- Security audit logging
- Encryption (TLS/SSL + at-rest)

**Integrations:**
- PayStack (payments)
- Resend (email)
- Vercel (hosting)

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/compliancekit.git
cd compliancekit
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (optional)
RESEND_API_KEY="..."

# Payments (optional)
PAYSTACK_SECRET_KEY="..."
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
compliancekit/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Dashboard routes
│   ├── (marketing)/              # Marketing pages
│   └── api/                      # API routes
├── components/                   # React components
│   ├── layout/                   # Layout components
│   ├── ui/                       # shadcn/ui components
│   └── ...
├── lib/                          # Core libraries
│   ├── actions/                  # Server actions
│   ├── scanner/                  # Website scanner
│   │   ├── index.ts              # Main scanner
│   │   ├── cookie-detector.ts    # Cookie detection
│   │   ├── privacy-policy-analyzer.ts  # Policy content analysis
│   │   ├── consent-quality-analyzer.ts # Banner quality checks
│   │   ├── user-rights-detector.ts     # User rights detection
│   │   ├── additional-compliance-detector.ts # Articles 6,8,9,22
│   │   └── compliance-score.ts   # Scoring algorithm
│   ├── generators/               # Document generators
│   ├── auth.ts                   # Authentication
│   ├── db.ts                     # Database client
│   ├── rate-limit.ts             # Rate limiting
│   ├── security-log.ts           # Security logging
│   └── ...
├── prisma/                       # Database schema
│   └── schema.prisma
├── public/                       # Static assets
├── PRODUCT-OVERVIEW.md           # Comprehensive product documentation
├── GDPR-COMPLIANCE.md            # ComplianceKit's own GDPR compliance
├── SECURITY.md                   # Security documentation
├── TESTING-CHECKLIST.md          # Testing guide
└── README.md                     # This file
```

---

## 🔐 Security

ComplianceKit is built with security-first principles:

**Authentication & Authorization:**
- Bcrypt password hashing (12 rounds)
- JWT session tokens
- Account lockout (5 attempts = 15 min)
- OAuth support (Google)

**Protection Measures:**
- Rate limiting (configurable per endpoint)
- CORS whitelisting
- XSS/CSRF protection
- SQL injection prevention
- Input sanitization
- Request size limits

**Data Security:**
- TLS/SSL encryption in transit
- Database encryption at rest
- Secure password requirements
- Security audit logging
- Regular security updates

**GDPR Compliance:**
- Data minimization
- Privacy by design
- User data export
- Account deletion
- Consent management
- Breach notification procedures

See [SECURITY.md](./SECURITY.md) for complete details.

---

## 📖 Documentation

- **[PRODUCT-OVERVIEW.md](./PRODUCT-OVERVIEW.md)** - Complete product documentation
- **[GDPR-COMPLIANCE.md](./GDPR-COMPLIANCE.md)** - Our GDPR compliance status
- **[SECURITY.md](./SECURITY.md)** - Security measures and best practices
- **[DATA-PROCESSING-AGREEMENT.md](./DATA-PROCESSING-AGREEMENT.md)** - DPA for customers
- **[TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)** - Comprehensive testing guide

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual Testing
Follow the comprehensive testing guide in [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)

**Key Test Areas:**
- Authentication & authorization
- Website scanning (50+ checks)
- Legal document generation
- Cookie consent banner
- DSAR workflow
- User data rights
- Security measures
- Multi-language support

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Vercel**
- Connect your GitHub repository
- Configure environment variables
- Deploy

3. **Set up database**
- Run Prisma migrations in production
- Configure connection pooling

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style:**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 💼 Support & Contact

**General Support:**
- Email: support@compliancekit.com
- Documentation: [PRODUCT-OVERVIEW.md](./PRODUCT-OVERVIEW.md)

**Privacy & DPO:**
- Email: privacy@compliancekit.com
- DPO: dpo@compliancekit.com

**Security Issues:**
- Email: security@compliancekit.com
- Please report vulnerabilities responsibly

**Legal & DPA:**
- Email: legal@compliancekit.com

---

## 🗺️ Roadmap

### Q1 2026
- ✅ Core GDPR scanning (25+ articles)
- ✅ Legal document generation
- ✅ Cookie consent management
- ✅ DSAR workflow
- ✅ User data rights
- ⏳ CCPA compliance (California)
- ⏳ Multi-factor authentication

### Q2 2026
- LGPD compliance (Brazil)
- PECR compliance (UK)
- AI-powered policy generation
- Chrome extension

### Q3 2026
- Mobile app (iOS/Android)
- Slack/Teams integrations
- White-label solution
- Compliance training

### Q4 2026
- HIPAA compliance scanning
- SOC 2 reporting
- API marketplace
- Partner program

---

## 📊 Stats

- **Lines of Code:** ~15,000+
- **GDPR Articles Covered:** 25+
- **Compliance Checks:** 50+
- **Languages Supported:** 5 (English, German, French, Spanish, Dutch)
- **Test Cases:** 50+
- **Dependencies:** Secure, regularly updated

---

## 🎉 Acknowledgments

**Built with:**
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Puppeteer](https://pptr.dev/) - Headless browser
- [Supabase](https://supabase.com/) - Database hosting

**Compliance Resources:**
- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO Guidelines](https://ico.org.uk/)
- [EDPB Guidelines](https://edpb.europa.eu/)

---

## ⭐ Star Us!

If ComplianceKit helps you achieve GDPR compliance, please give us a star on GitHub!

---

**Made with ❤️ for a privacy-respecting web**

---

© 2026 ComplianceKit. All rights reserved.
