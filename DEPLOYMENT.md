# ComplianceKit - Testing & Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Required

Create a `.env.local` file (for local) or set these in your hosting platform:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/compliancekit?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend (Email service - get from resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# PayStack (Payment - get from paystack.com)
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxx"
PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxx"
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"

# App URL (for widgets & embeds)
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

---

## 🧪 Testing Locally

### Step 1: Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database
createdb compliancekit

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/compliancekit"
```

**Option B: Use Supabase (Recommended for quick setup)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database > Connection string
4. Copy the connection string and add to `.env.local`

### Step 2: Apply Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 3: Configure OAuth (Google)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### Step 4: Run the App
```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

### Step 5: Testing Checklist

- [ ] **Authentication**
  - [ ] Sign up with email/password
  - [ ] Sign in with email/password
  - [ ] Sign in with Google
  - [ ] Sign out

- [ ] **Websites**
  - [ ] Add a new website
  - [ ] Edit website details
  - [ ] Delete a website

- [ ] **Scanner**
  - [ ] Run a scan on a website
  - [ ] View scan results
  - [ ] View compliance score

- [ ] **Cookie Banner**
  - [ ] Configure banner appearance
  - [ ] Preview banner
  - [ ] Copy embed code

- [ ] **Policies**
  - [ ] Generate privacy policy
  - [ ] Generate cookie policy
  - [ ] View generated policies

- [ ] **DSAR**
  - [ ] Submit a DSAR request (public form)
  - [ ] View DSAR requests in dashboard
  - [ ] Update DSAR status

- [ ] **Analytics**
  - [ ] View compliance trends
  - [ ] View consent metrics
  - [ ] Export reports

- [ ] **Billing**
  - [ ] View pricing page
  - [ ] Initiate checkout (test mode)

- [ ] **i18n**
  - [ ] Switch language to German
  - [ ] Verify translations display correctly
  - [ ] Switch back to English

---

## 🚀 Production Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub** (already done)

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Make sure `NEXTAUTH_URL` = your Vercel domain

4. **Deploy**
   - Vercel builds and deploys automatically
   - Get your production URL (e.g., `compliancekit.vercel.app`)

5. **Custom Domain** (optional)
   - Go to Project Settings > Domains
   - Add your custom domain

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

### Option 3: Docker (Self-hosted)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t compliancekit .
docker run -p 3000:3000 --env-file .env.production compliancekit
```

---

## 🔒 Security Checklist for Production

- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure cookie settings
- [ ] Configure CORS properly
- [ ] Use rate limiting on API routes
- [ ] Enable database connection pooling
- [ ] Set up proper backup for database
- [ ] Configure PayStack webhook verification
- [ ] Review and restrict OAuth redirect URIs

---

## 📊 Monitoring & Maintenance

### Recommended Services
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics, Plausible, or PostHog
- **Uptime Monitoring**: Better Uptime, Pingdom
- **Log Management**: Vercel Logs, Logtail

### Regular Tasks
- Monitor compliance score trends
- Review DSAR requests weekly
- Update cookie database definitions
- Check for dependency updates monthly
- Review security advisories

---

## 🔧 Troubleshooting

### Common Issues

**Database connection error**
```
Error: Can't reach database server
```
→ Check DATABASE_URL format and database is running

**OAuth redirect error**
```
Error: redirect_uri_mismatch
```
→ Add correct redirect URI in Google Cloud Console

**Build fails**
```
Error: Cannot find module...
```
→ Run `pnpm install` and `npx prisma generate`

**Puppeteer fails on serverless**
→ Use `@sparticuz/chromium` for serverless environments

---

## 📞 Support

For issues:
1. Check [GitHub Issues](https://github.com/leroux1606/ComplianceKit/issues)
2. Review Next.js docs: https://nextjs.org/docs
3. Review Prisma docs: https://prisma.io/docs

