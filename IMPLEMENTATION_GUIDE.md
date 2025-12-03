# ComplianceKit Implementation Guide

A comprehensive, phase-by-phase guide for building a GDPR compliance SaaS platform.

---

# Phase 1: Project Foundation

## Overview

Phase 1 establishes the core infrastructure of ComplianceKit. We'll set up the Next.js 14 application with App Router, configure the PostgreSQL database with Prisma, implement authentication using NextAuth.js (supporting Google OAuth and email/password), and create the foundational UI components. This phase ensures we have a solid, secure foundation before building business logic.

**Why this phase matters:** Without proper authentication, database setup, and project structure, we cannot build user-specific features. This phase creates the scaffolding that all subsequent phases will build upon.

## Requirements

### Core Setup
- Next.js 14 with App Router and TypeScript
- Tailwind CSS configured with shadcn/ui components
- Environment variables management (.env.local)
- ESLint and Prettier configured
- Git repository initialized

### Database
- PostgreSQL database connection
- Prisma ORM configured
- Initial migration with User and Account models
- Database seeding script for development

### Authentication
- NextAuth.js v5 (Auth.js) configured
- Google OAuth provider integration
- Email/password authentication with credentials provider
- Magic link email authentication (optional enhancement)
- Protected route middleware
- Session management

### UI Foundation
- Root layout with navigation
- Authentication pages (sign-in, sign-up)
- Loading and error states
- Toast notifications (shadcn/ui)
- Responsive design system

### Developer Experience
- TypeScript strict mode enabled
- Path aliases configured (@/components, @/lib, etc.)
- Hot module reloading working
- Database migrations workflow documented

## Database Schema

### Prisma Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

## Files to Create

### Project Structure
```
ComplianceKit/
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example env file
├── .gitignore
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── components.json               # shadcn/ui config
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── app/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing/home page
│   ├── loading.tsx               # Global loading UI
│   ├── error.tsx                 # Global error UI
│   ├── globals.css               # Global styles
│   │
│   ├── (auth)/
│   │   ├── layout.tsx            # Auth layout
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Protected dashboard layout
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard home
│   │
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts     # NextAuth route handler
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── toast.tsx
│   │   └── ... (other shadcn components)
│   │
│   ├── auth/
│   │   ├── sign-in-form.tsx
│   │   ├── sign-up-form.tsx
│   │   └── social-auth-buttons.tsx
│   │
│   └── layout/
│       ├── navbar.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
│
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Prisma client singleton
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod schemas
│
└── middleware.ts                 # Next.js middleware for auth
```

## Implementation Steps

### Step 1: Initialize Next.js Project
1. Run `pnpm create next-app@latest .` (in current directory)
2. Select: TypeScript, App Router, Tailwind CSS, ESLint
3. Install additional dependencies: `pnpm add prisma @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs zod`
4. Install dev dependencies: `pnpm add -D @types/bcryptjs`

### Step 2: Configure Environment Variables
1. Create `.env.local` with:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (http://localhost:3000 for dev)
   - `GOOGLE_CLIENT_ID` (from Google Cloud Console)
   - `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
2. Create `.env.example` with placeholder values (no secrets)

### Step 3: Set Up Prisma
1. Initialize Prisma: `pnpm prisma init`
2. Update `prisma/schema.prisma` with the schema above
3. Create migration: `pnpm prisma migrate dev --name init`
4. Generate Prisma Client: `pnpm prisma generate`
5. Create `lib/db.ts` to export a singleton Prisma client instance

### Step 4: Configure NextAuth.js
1. Create `lib/auth.ts` with NextAuth configuration:
   - Configure Prisma adapter
   - Add Google provider
   - Add Credentials provider for email/password
   - Set up callbacks for session and JWT
   - Configure pages (sign-in, sign-up)
2. Create `app/api/auth/[...nextauth]/route.ts` as the auth API route
3. Create `middleware.ts` to protect dashboard routes

### Step 5: Set Up shadcn/ui
1. Initialize shadcn/ui: `pnpm dlx shadcn-ui@latest init`
2. Install base components: `pnpm dlx shadcn-ui@latest add button input card toast form label`
3. Configure `components.json` with proper paths

### Step 6: Create Authentication Pages
1. Create `app/(auth)/layout.tsx` - simple layout for auth pages
2. Create `app/(auth)/sign-in/page.tsx` with sign-in form
3. Create `app/(auth)/sign-up/page.tsx` with sign-up form
4. Create `components/auth/sign-in-form.tsx` - form with email/password and Google OAuth
5. Create `components/auth/sign-up-form.tsx` - registration form
6. Create `components/auth/social-auth-buttons.tsx` - Google OAuth button

### Step 7: Create Dashboard Layout
1. Create `app/(dashboard)/layout.tsx` - protected layout with sidebar/navbar
2. Create `app/(dashboard)/dashboard/page.tsx` - placeholder dashboard
3. Create `components/layout/navbar.tsx` - navigation with user menu
4. Create `components/layout/sidebar.tsx` - sidebar navigation (if needed)
5. Implement logout functionality

### Step 8: Create Root Layout and Pages
1. Update `app/layout.tsx` with providers (SessionProvider, Toaster)
2. Create `app/page.tsx` - landing page with hero section
3. Create `app/loading.tsx` - global loading UI
4. Create `app/error.tsx` - global error boundary

### Step 9: Add Form Validation
1. Create `lib/validations.ts` with Zod schemas:
   - `signInSchema` - email and password validation
   - `signUpSchema` - name, email, password validation
2. Integrate validation into auth forms using react-hook-form

### Step 10: Database Seeding (Optional)
1. Create `prisma/seed.ts` with test user data
2. Add seed script to `package.json`: `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }`
3. Run seed: `pnpm prisma db seed`

## Code Specifications

### lib/db.ts
- Export a singleton PrismaClient instance
- Handle Prisma Client in development (prevent multiple instances)
- Use `globalThis` for development hot-reload safety

### lib/auth.ts
- Export NextAuth configuration object
- Configure providers array with Google and Credentials
- Set up PrismaAdapter
- Configure session strategy (JWT recommended)
- Set up callbacks:
  - `signIn`: Validate credentials, hash passwords
  - `jwt`: Add user ID to token
  - `session`: Add user data to session
- Configure pages object for custom auth pages

### middleware.ts
- Export default function with `withAuth` from NextAuth
- Protect routes matching `/dashboard/**`
- Redirect unauthenticated users to `/sign-in`
- Allow public routes: `/`, `/sign-in`, `/sign-up`, `/api/auth/**`

### components/auth/sign-in-form.tsx
- Use react-hook-form with Zod validation
- Email and password input fields
- Submit button with loading state
- Error message display
- Link to sign-up page
- Google OAuth button integration
- Handle form submission with NextAuth signIn

### components/auth/sign-up-form.tsx
- Similar to sign-in form
- Additional name field
- Password confirmation field
- Terms of service checkbox
- Handle registration, create user, then sign in

### app/(dashboard)/layout.tsx
- Use `getServerSession` to check authentication
- Redirect to sign-in if not authenticated
- Render sidebar/navbar components
- Include user menu with logout option

### app/api/auth/[...nextauth]/route.ts
- Export GET and POST handlers
- Pass to NextAuth handler with configuration from `lib/auth.ts`

## Testing Checklist

### Authentication Flow
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google OAuth
- [ ] Invalid credentials show error message
- [ ] Password validation works (min length, etc.)
- [ ] Email validation works (proper format)

### Protected Routes
- [ ] Unauthenticated users redirected from `/dashboard` to `/sign-in`
- [ ] Authenticated users can access `/dashboard`
- [ ] Sign-in redirects to dashboard after successful auth
- [ ] Sign-up redirects to dashboard after registration

### Database
- [ ] User records created in database on sign-up
- [ ] Account records created for OAuth providers
- [ ] Sessions created on sign-in
- [ ] Prisma Client queries work correctly

### UI/UX
- [ ] Forms show validation errors
- [ ] Loading states display during auth
- [ ] Toast notifications work
- [ ] Responsive design works on mobile
- [ ] Navigation links work correctly
- [ ] Logout button works

### Developer Experience
- [ ] Hot reload works
- [ ] TypeScript errors resolved
- [ ] ESLint passes
- [ ] Environment variables loaded correctly
- [ ] Database migrations run successfully

## Ready for Next Phase?

Before proceeding to Phase 2, ensure:

1. ✅ **Authentication is fully functional**
   - Users can sign up and sign in
   - Google OAuth works
   - Protected routes are enforced
   - Sessions persist across page reloads

2. ✅ **Database is properly configured**
   - Prisma migrations run successfully
   - Database connection is stable
   - User records persist correctly

3. ✅ **Project structure is clean**
   - All files are in correct locations
   - TypeScript compiles without errors
   - No console errors in browser

4. ✅ **UI foundation is solid**
   - shadcn/ui components render correctly
   - Forms are styled and functional
   - Navigation works smoothly

5. ✅ **Environment is documented**
   - `.env.example` is up to date
   - README.md includes setup instructions
   - Dependencies are documented

---

# Phase 2: User Dashboard & Website Management

## Overview

Phase 2 builds the core user interface for managing websites. Users will be able to add websites to their account, view a list of their websites, and access basic website details. This phase establishes the data model for websites and creates the primary dashboard interface that users will interact with daily.

**Why this phase matters:** Before we can scan websites or generate compliance documents, users need a way to manage their websites. This phase creates the foundation for all website-related features in subsequent phases.

## Requirements

### Website Management
- Add new website (URL, name, description)
- List all websites for authenticated user
- View website details page
- Edit website information
- Delete website (with confirmation)
- Website validation (valid URL format, accessible)

### Dashboard UI
- Overview dashboard with key metrics
- Website cards/list view
- Quick actions (scan, view reports)
- Empty state when no websites added
- Loading states for async operations
- Error handling for failed operations

### Data Model
- Website model with user relationship
- Timestamps for created/updated
- Status tracking (active, scanning, error)
- URL normalization and validation

## Database Schema

### Additional Prisma Models

```prisma
model Website {
  id          String   @id @default(cuid())
  userId      String
  name        String
  url         String
  description String?
  status      String   @default("active") // active, scanning, error
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  scans       Scan[]
  policies    Policy[]
  
  @@index([userId])
  @@map("websites")
}

// Update User model to include:
model User {
  // ... existing fields ...
  websites    Website[]
}
```

## Files to Create

```
app/
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx                    # Dashboard overview
│   │   └── websites/
│   │       ├── page.tsx                # Websites list
│   │       ├── new/
│   │       │   └── page.tsx            # Add website form
│   │       └── [id]/
│   │           ├── page.tsx            # Website details
│   │           └── edit/
│   │               └── page.tsx        # Edit website
│   │
│   └── api/
│       └── websites/
│           ├── route.ts                # GET (list), POST (create)
│           └── [id]/
│               ├── route.ts            # GET, PATCH, DELETE
│               └── scan/
│                   └── route.ts        # POST (trigger scan - placeholder)

components/
├── dashboard/
│   ├── website-card.tsx                # Website card component
│   ├── website-list.tsx                # List of websites
│   ├── add-website-form.tsx            # Add website form
│   ├── edit-website-form.tsx           # Edit website form
│   ├── website-stats.tsx               # Stats cards
│   └── empty-state.tsx                 # Empty state component
│
└── ui/
    ├── dialog.tsx                      # shadcn dialog
    ├── alert-dialog.tsx                # shadcn alert dialog
    └── badge.tsx                       # shadcn badge

lib/
├── actions/
│   └── website.ts                      # Server actions for websites
└── validations.ts                      # Add website validation schemas
```

## Implementation Steps

### Step 1: Update Database Schema
1. Add Website model to `prisma/schema.prisma`
2. Add websites relation to User model
3. Create migration: `pnpm prisma migrate dev --name add_websites`
4. Generate Prisma Client: `pnpm prisma generate`

### Step 2: Create Website Validation Schemas
1. Add to `lib/validations.ts`:
   - `websiteSchema` - name, url, description validation
   - URL format validation with Zod
   - URL normalization helper function

### Step 3: Create Server Actions
1. Create `lib/actions/website.ts`:
   - `createWebsite` - validate input, create website, return result
   - `getWebsites` - fetch user's websites
   - `getWebsite` - fetch single website by ID
   - `updateWebsite` - update website details
   - `deleteWebsite` - delete website with validation

### Step 4: Create API Routes (Optional - can use Server Actions)
1. Create `app/(dashboard)/api/websites/route.ts`:
   - GET: List user's websites
   - POST: Create new website
2. Create `app/(dashboard)/api/websites/[id]/route.ts`:
   - GET: Get website by ID
   - PATCH: Update website
   - DELETE: Delete website

### Step 5: Create Website Components
1. Create `components/dashboard/website-card.tsx`:
   - Display website name, URL, status
   - Quick actions (view, edit, delete)
   - Status badge
   - Last scan date (placeholder)
2. Create `components/dashboard/website-list.tsx`:
   - Grid/list view of website cards
   - Empty state when no websites
   - Loading skeleton
3. Create `components/dashboard/add-website-form.tsx`:
   - Form with name, URL, description fields
   - URL validation and normalization
   - Submit handler using server action
   - Error handling
4. Create `components/dashboard/edit-website-form.tsx`:
   - Pre-filled form with existing data
   - Similar to add form but for updates
5. Create `components/dashboard/empty-state.tsx`:
   - Illustration/icon
   - "No websites yet" message
   - Call-to-action button

### Step 6: Create Dashboard Pages
1. Update `app/(dashboard)/dashboard/page.tsx`:
   - Fetch user's websites
   - Display stats cards (total websites, etc.)
   - Show recent websites
   - Quick action buttons
2. Create `app/(dashboard)/dashboard/websites/page.tsx`:
   - List all websites
   - Add website button
   - Filter/search (optional)
3. Create `app/(dashboard)/dashboard/websites/new/page.tsx`:
   - Render add website form
   - Handle form submission
   - Redirect on success
4. Create `app/(dashboard)/dashboard/websites/[id]/page.tsx`:
   - Fetch website by ID
   - Display website details
   - Show status, URL, description
   - Action buttons (edit, scan, delete)
5. Create `app/(dashboard)/dashboard/websites/[id]/edit/page.tsx`:
   - Render edit form with existing data
   - Handle update submission

### Step 7: Add UI Components
1. Install shadcn components: `pnpm dlx shadcn-ui@latest add dialog alert-dialog badge skeleton`
2. Create loading skeletons for website cards
3. Add confirmation dialogs for delete actions

### Step 8: Implement URL Validation
1. Create URL normalization function:
   - Add protocol if missing (https://)
   - Remove trailing slashes
   - Validate URL format
   - Check if URL is accessible (optional, can be async)

### Step 9: Add Error Handling
1. Create error boundaries for website pages
2. Handle API errors gracefully
3. Show user-friendly error messages
4. Log errors for debugging

### Step 10: Add Loading States
1. Implement Suspense boundaries
2. Create loading.tsx files for routes
3. Add skeleton loaders
4. Show loading indicators during mutations

## Code Specifications

### lib/actions/website.ts
- All functions should be async server actions
- Use `getServerSession` to get current user
- Validate user ownership before operations
- Use Prisma transactions for complex operations
- Return typed results with error handling
- Normalize URLs before saving

### components/dashboard/add-website-form.tsx
- Use react-hook-form with Zod validation
- Client-side URL validation
- Show loading state during submission
- Display validation errors
- Success toast on completion
- Redirect to website details page

### components/dashboard/website-card.tsx
- Display website name (truncated if long)
- Show normalized URL
- Status badge (active, scanning, error)
- Hover effects
- Click to navigate to details
- Dropdown menu for actions

### app/(dashboard)/dashboard/websites/[id]/page.tsx
- Fetch website server-side
- Verify user owns the website
- Show 404 if not found or unauthorized
- Display all website information
- Action buttons for edit, scan, delete
- Breadcrumb navigation

### URL Normalization Function
- Check if URL starts with http:// or https://
- Add https:// if no protocol
- Remove trailing slash
- Convert to lowercase
- Validate final URL format
- Return normalized URL or throw error

## Testing Checklist

### Website Creation
- [ ] Can add website with valid URL
- [ ] URL normalization works (adds https://, removes trailing slash)
- [ ] Invalid URLs show validation error
- [ ] Duplicate URLs prevented (or allowed with warning)
- [ ] Form validation works (required fields)
- [ ] Success message displays
- [ ] Redirects to website details after creation

### Website Listing
- [ ] Dashboard shows user's websites
- [ ] Websites page lists all websites
- [ ] Empty state displays when no websites
- [ ] Website cards render correctly
- [ ] Status badges show correct status
- [ ] Loading skeletons display during fetch

### Website Details
- [ ] Can view website details page
- [ ] Shows all website information
- [ ] 404 error for non-existent websites
- [ ] Cannot access other users' websites
- [ ] Action buttons are functional

### Website Updates
- [ ] Can edit website information
- [ ] Form pre-fills with existing data
- [ ] Validation works on edit form
- [ ] Success message displays
- [ ] Changes persist in database

### Website Deletion
- [ ] Delete button shows confirmation dialog
- [ ] Website deleted from database
- [ ] Redirects to websites list after deletion
- [ ] Cannot delete other users' websites
- [ ] Success message displays

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid data shows appropriate errors
- [ ] Unauthorized access prevented
- [ ] Error messages are user-friendly

## Ready for Next Phase?

Before proceeding to Phase 3, ensure:

1. ✅ **Website CRUD operations work**
   - Users can add, view, edit, and delete websites
   - Data persists correctly in database
   - User ownership is enforced

2. ✅ **UI is polished**
   - Forms are intuitive and validated
   - Loading states work correctly
   - Error messages are clear
   - Empty states are helpful

3. ✅ **URL handling is robust**
   - URLs are normalized consistently
   - Invalid URLs are caught and handled
   - URL validation works client and server-side

4. ✅ **Performance is acceptable**
   - Pages load quickly
   - No unnecessary re-renders
   - Database queries are optimized

---

# Phase 3: Website Scanner Engine

## Overview

Phase 3 implements the core scanning functionality using Puppeteer. The scanner will visit websites, detect cookies, identify tracking scripts, analyze privacy-related elements, and generate compliance reports. This is the most technically complex phase as it involves web scraping, cookie detection, and script analysis.

**Why this phase matters:** The scanner is ComplianceKit's primary value proposition. It enables automated compliance checking and provides the data needed for generating privacy policies and cookie consent banners.

## Requirements

### Scanning Engine
- Puppeteer-based web crawler
- Cookie detection (first-party and third-party)
- Tracking script identification (Google Analytics, Facebook Pixel, etc.)
- Privacy policy link detection
- Cookie banner detection
- Screenshot capture
- Scan result storage

### Scan Management
- Trigger manual scans from dashboard
- View scan history per website
- View detailed scan results
- Scan status tracking (pending, running, completed, failed)
- Background job processing (optional: use queue system)

### Scan Results
- List of detected cookies with details
- List of tracking scripts
- Privacy policy status
- Cookie banner status
- Compliance score calculation
- Recommendations for improvement

### Performance & Reliability
- Timeout handling (30-60 seconds max)
- Error handling for inaccessible sites
- Retry logic for failed scans
- Rate limiting to prevent abuse

## Database Schema

### Additional Prisma Models

```prisma
model Scan {
  id          String   @id @default(cuid())
  websiteId   String
  status      String   @default("pending") // pending, running, completed, failed
  startedAt   DateTime?
  completedAt DateTime?
  error       String?
  createdAt   DateTime @default(now())
  
  website     Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  cookies     Cookie[]
  scripts     Script[]
  findings    Finding[]
  
  @@index([websiteId])
  @@index([status])
  @@map("scans")
}

model Cookie {
  id          String   @id @default(cuid())
  scanId      String
  name        String
  domain      String
  path        String   @default("/")
  secure      Boolean  @default(false)
  httpOnly    Boolean  @default(false)
  sameSite    String?  // Strict, Lax, None
  expires     DateTime?
  category    String?  // necessary, analytics, marketing, functional
  description String?
  createdAt   DateTime @default(now())
  
  scan        Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  
  @@index([scanId])
  @@map("cookies")
}

model Script {
  id          String   @id @default(cuid())
  scanId      String
  url         String?
  content     String?  @db.Text
  type        String   // inline, external
  category    String?  // analytics, marketing, functional, unknown
  name        String?  // Google Analytics, Facebook Pixel, etc.
  detectedAt  DateTime @default(now())
  
  scan        Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  
  @@index([scanId])
  @@map("scripts")
}

model Finding {
  id          String   @id @default(cuid())
  scanId      String
  type        String   // cookie_banner, privacy_policy, tracking_script, etc.
  severity    String   // info, warning, error
  title       String
  description String   @db.Text
  recommendation String? @db.Text
  createdAt   DateTime @default(now())
  
  scan        Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  
  @@index([scanId])
  @@map("findings")
}

// Update Website model:
model Website {
  // ... existing fields ...
  lastScanAt  DateTime?
  lastScanStatus String?
  scans       Scan[]
}
```

## Files to Create

```
lib/
├── scanner/
│   ├── index.ts                   # Main scanner class
│   ├── cookie-detector.ts         # Cookie detection logic
│   ├── script-detector.ts         # Script detection logic
│   ├── policy-detector.ts         # Privacy policy detection
│   ├── banner-detector.ts         # Cookie banner detection
│   └── types.ts                   # TypeScript types for scanner
│
└── utils/
    └── compliance-score.ts        # Score calculation

app/
└── (dashboard)/
    └── api/
        └── websites/
            └── [id]/
                └── scan/
                    └── route.ts   # POST endpoint to trigger scan

components/
└── dashboard/
    ├── scan-results.tsx           # Display scan results
    ├── scan-history.tsx           # List of past scans
    ├── cookie-list.tsx            # List of detected cookies
    ├── script-list.tsx            # List of detected scripts
    ├── findings-list.tsx          # List of findings
    └── scan-button.tsx            # Trigger scan button

app/
└── (dashboard)/
    └── dashboard/
        └── websites/
            └── [id]/
                └── scan/
                    └── [scanId]/
                        └── page.tsx # Detailed scan results page
```

## Implementation Steps

### Step 1: Install Dependencies
1. Install Puppeteer: `pnpm add puppeteer`
2. Install cookie parser: `pnpm add cookie`
3. Install user-agent library: `pnpm add user-agents` (optional)

### Step 2: Update Database Schema
1. Add Scan, Cookie, Script, Finding models
2. Update Website model with scan-related fields
3. Create migration: `pnpm prisma migrate dev --name add_scans`
4. Generate Prisma Client

### Step 3: Create Scanner Types
1. Create `lib/scanner/types.ts`:
   - `ScanOptions` interface
   - `ScanResult` interface
   - `DetectedCookie` interface
   - `DetectedScript` interface
   - `Finding` interface

### Step 4: Create Cookie Detector
1. Create `lib/scanner/cookie-detector.ts`:
   - Function to extract cookies from browser
   - Parse cookie attributes (domain, path, secure, etc.)
   - Categorize cookies (necessary, analytics, marketing)
   - Detect third-party cookies
   - Return array of detected cookies

### Step 5: Create Script Detector
1. Create `lib/scanner/script-detector.ts`:
   - Function to detect inline scripts
   - Function to detect external scripts
   - Pattern matching for known trackers:
     - Google Analytics (gtag.js, analytics.js, ga.js)
     - Facebook Pixel
     - Google Tag Manager
     - Hotjar
     - Intercom
     - etc.
   - Categorize scripts by type
   - Return array of detected scripts

### Step 6: Create Policy Detector
1. Create `lib/scanner/policy-detector.ts`:
   - Search for privacy policy links
   - Check footer, header, navigation
   - Validate policy URLs
   - Return finding if missing

### Step 7: Create Banner Detector
1. Create `lib/scanner/banner-detector.ts`:
   - Detect cookie consent banners
   - Check for common banner selectors
   - Check for common banner text patterns
   - Return finding if missing or non-compliant

### Step 8: Create Main Scanner Class
1. Create `lib/scanner/index.ts`:
   - `Scanner` class with `scan()` method
   - Initialize Puppeteer browser
   - Navigate to website URL
   - Wait for page load
   - Execute detection functions
   - Capture screenshot (optional)
   - Handle errors and timeouts
   - Clean up browser resources
   - Return comprehensive scan result

### Step 9: Create Compliance Score Calculator
1. Create `lib/utils/compliance-score.ts`:
   - Calculate score based on:
     - Presence of privacy policy
     - Presence of cookie banner
     - Cookie categorization
     - Tracking script disclosure
   - Return score (0-100)

### Step 10: Create Scan API Route
1. Create `app/(dashboard)/api/websites/[id]/scan/route.ts`:
   - POST handler
   - Verify user owns website
   - Create Scan record with "pending" status
   - Trigger scan asynchronously (or sync for MVP)
   - Update scan status
   - Save results to database
   - Return scan ID

### Step 11: Create Scan Results Components
1. Create `components/dashboard/scan-results.tsx`:
   - Display scan status
   - Show compliance score
   - List cookies, scripts, findings
   - Show scan metadata (date, duration)
2. Create `components/dashboard/cookie-list.tsx`:
   - Table/list of cookies
   - Filter by category
   - Show cookie details
3. Create `components/dashboard/script-list.tsx`:
   - List of detected scripts
   - Group by category
   - Show script details
4. Create `components/dashboard/findings-list.tsx`:
   - List of findings with severity
   - Recommendations
   - Actionable items

### Step 12: Create Scan History Component
1. Create `components/dashboard/scan-history.tsx`:
   - List of past scans
   - Status indicators
   - Link to detailed results
   - Trigger new scan button

### Step 13: Create Scan Results Page
1. Create `app/(dashboard)/dashboard/websites/[id]/scan/[scanId]/page.tsx`:
   - Fetch scan by ID
   - Verify ownership
   - Display comprehensive results
   - Show all detected items
   - Display compliance score

### Step 14: Add Scan Button to Website Details
1. Update website details page:
   - Add "Scan Website" button
   - Show last scan date
   - Link to scan history
   - Show scan status if in progress

### Step 15: Implement Error Handling
1. Handle Puppeteer errors:
   - Timeout errors
   - Navigation errors
   - Network errors
   - Invalid URLs
2. Update scan status to "failed"
3. Store error message
4. Show user-friendly error messages

### Step 16: Add Background Processing (Optional Enhancement)
1. Consider using a job queue (BullMQ, Bull, or simple queue)
2. Process scans asynchronously
3. Update scan status in real-time (WebSocket or polling)
4. Handle concurrent scan limits

## Code Specifications

### lib/scanner/index.ts
- `Scanner` class with constructor accepting website URL
- `scan()` async method that:
  - Launches Puppeteer browser
  - Sets viewport and user agent
  - Navigates to URL with timeout
  - Waits for network idle
  - Executes all detectors
  - Captures cookies from browser
  - Closes browser
  - Returns ScanResult object
- Error handling with try/catch
- Timeout configuration (60 seconds)
- Resource cleanup in finally block

### lib/scanner/cookie-detector.ts
- `detectCookies(page: Page)` function
- Use `page.cookies()` to get all cookies
- Parse cookie attributes
- Categorize using rules:
  - Necessary: session, authentication cookies
  - Analytics: _ga, _gid, etc.
  - Marketing: _fbp, ads tracking
  - Functional: preferences, settings
- Detect third-party cookies by domain comparison
- Return array of DetectedCookie objects

### lib/scanner/script-detector.ts
- `detectScripts(page: Page)` function
- Query all script tags: `page.$$eval('script', ...)`
- Extract src URLs and inline content
- Match against known patterns:
  - Google Analytics: `/gtag|analytics|ga\.js/`
  - Facebook: `/facebook\.net|fb\.com/`
  - etc.
- Categorize scripts
- Return array of DetectedScript objects

### lib/scanner/policy-detector.ts
- `detectPrivacyPolicy(page: Page)` function
- Search for links containing: "privacy", "privacy policy", "datenschutz"
- Check common locations: footer, header, navigation
- Validate URLs are accessible
- Return Finding if not found

### lib/scanner/banner-detector.ts
- `detectCookieBanner(page: Page)` function
- Search for common selectors: `[id*="cookie"], [class*="cookie"], [id*="consent"]`
- Search for common text: "cookie", "consent", "accept", "gdpr"
- Check if banner is visible
- Return Finding if not found or non-compliant

### app/(dashboard)/api/websites/[id]/scan/route.ts
- POST handler
- Get website ID from params
- Verify user authentication and ownership
- Create Scan record
- Call Scanner.scan() method
- Save results to database:
  - Create Cookie records
  - Create Script records
  - Create Finding records
- Update Scan status and timestamps
- Return JSON response with scan ID

### lib/utils/compliance-score.ts
- `calculateComplianceScore(scan: Scan)` function
- Scoring criteria:
  - Privacy policy present: +25 points
  - Cookie banner present: +25 points
  - All cookies categorized: +25 points
  - Tracking scripts disclosed: +25 points
- Return number 0-100

## Testing Checklist

### Scanner Functionality
- [ ] Scanner successfully navigates to valid URLs
- [ ] Cookies are detected correctly
- [ ] Cookie attributes are parsed correctly
- [ ] Cookies are categorized correctly
- [ ] Tracking scripts are detected
- [ ] Script patterns match correctly
- [ ] Privacy policy links are found
- [ ] Cookie banners are detected

### Error Handling
- [ ] Invalid URLs handled gracefully
- [ ] Timeout errors caught and handled
- [ ] Network errors don't crash scanner
- [ ] Unreachable websites show appropriate error
- [ ] Error messages stored in database

### Database Operations
- [ ] Scan records created correctly
- [ ] Cookies saved to database
- [ ] Scripts saved to database
- [ ] Findings saved to database
- [ ] Scan status updates correctly
- [ ] Timestamps are accurate

### API Endpoints
- [ ] POST /api/websites/[id]/scan creates scan
- [ ] Unauthorized users cannot trigger scans
- [ ] Cannot scan other users' websites
- [ ] Response includes scan ID
- [ ] Errors return appropriate status codes

### UI Components
- [ ] Scan button triggers scan
- [ ] Loading state shows during scan
- [ ] Scan results display correctly
- [ ] Cookie list renders properly
- [ ] Script list renders properly
- [ ] Findings list shows recommendations
- [ ] Compliance score displays correctly

### Performance
- [ ] Scans complete within timeout (60s)
- [ ] Browser resources cleaned up
- [ ] No memory leaks
- [ ] Multiple scans can run (with limits)

## Ready for Next Phase?

Before proceeding to Phase 4, ensure:

1. ✅ **Scanner works reliably**
   - Successfully scans various websites
   - Detects cookies and scripts accurately
   - Handles errors gracefully
   - Results are stored correctly

2. ✅ **Performance is acceptable**
   - Scans complete in reasonable time
   - No memory leaks
   - Browser cleanup works

3. ✅ **Data is accurate**
   - Cookie detection is reliable
   - Script detection catches common trackers
   - Findings are actionable

4. ✅ **User experience is smooth**
   - Scan triggers easily
   - Results display clearly
   - Loading states work
   - Error messages are helpful

---

# Phase 4: Cookie Consent Banner

## Overview

Phase 4 creates an embeddable cookie consent banner widget that users can integrate into their websites. The banner will be GDPR-compliant, customizable, and generated based on the cookies detected during scanning. This widget will be the primary deliverable that ComplianceKit customers provide to their website visitors.

**Why this phase matters:** The cookie consent banner is a core compliance requirement. It's also a visible product that customers will embed on their sites, making it a key differentiator and marketing tool.

## Requirements

### Banner Widget
- GDPR-compliant cookie consent banner
- Customizable design (colors, position, text)
- Multiple consent options (Accept All, Reject All, Customize)
- Cookie category management (Necessary, Analytics, Marketing, Functional)
- Consent preference storage
- Banner dismissal and re-display logic
- Mobile-responsive design

### Embedding System
- Generate unique embed code per website
- JavaScript snippet for easy integration
- Self-hosted widget (no external dependencies)
- Works across different website frameworks
- CORS handling for API calls

### Consent Management
- Store consent preferences
- API endpoints for consent recording
- Consent withdrawal functionality
- Consent log/audit trail
- Export consent data for compliance

### Customization
- Theme customization (light/dark mode)
- Position options (bottom, top, center)
- Animation options
- Custom CSS support
- Preview functionality

## Database Schema

### Additional Prisma Models

```prisma
model Consent {
  id          String   @id @default(cuid())
  websiteId   String
  visitorId   String   // Anonymous or identified visitor
  preferences Json     // { necessary: true, analytics: false, marketing: false, functional: true }
  ipAddress   String?
  userAgent   String?
  consentedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  website     Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  
  @@index([websiteId])
  @@index([visitorId])
  @@map("consents")
}

model BannerConfig {
  id          String   @id @default(cuid())
  websiteId   String   @unique
  theme       String   @default("light") // light, dark, custom
  position    String   @default("bottom") // bottom, top, center
  primaryColor String  @default("#000000")
  textColor   String   @default("#ffffff")
  buttonStyle String   @default("rounded") // rounded, square, pill
  animation   String   @default("slide") // slide, fade, none
  customCss   String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  website     Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  
  @@map("banner_configs")
}

// Update Website model:
model Website {
  // ... existing fields ...
  bannerConfig BannerConfig?
  consents     Consent[]
  embedCode    String?   // Unique identifier for embed
}
```

## Files to Create

```
app/
├── (dashboard)/
│   └── dashboard/
│       └── websites/
│           └── [id]/
│               ├── banner/
│               │   ├── page.tsx          # Banner configuration page
│               │   └── preview/
│               │       └── page.tsx      # Preview banner
│               │
│               └── embed/
│                   └── page.tsx          # Embed code page
│
│   └── api/
│       ├── consent/
│       │   └── route.ts                 # POST consent preferences
│       │
│       └── widget/
│           └── [embedCode]/
│               ├── script.js             # Widget loader script
│               └── config.json           # Banner configuration API
│
public/
└── widget/
    └── banner.js                        # Compiled widget script

components/
├── dashboard/
│   ├── banner-config-form.tsx           # Banner customization form
│   ├── banner-preview.tsx               # Live preview component
│   ├── embed-code-display.tsx           # Show embed code
│   └── consent-log.tsx                 # View consent history
│
└── widget/
    ├── banner.tsx                       # Banner component (for preview)
    └── cookie-settings-modal.tsx        # Cookie settings modal

lib/
├── widget/
│   ├── banner.ts                        # Banner widget logic
│   ├── consent-manager.ts              # Consent storage/retrieval
│   └── embed-generator.ts              # Generate embed codes
│
└── actions/
    └── banner.ts                        # Server actions for banner config
```

## Implementation Steps

### Step 1: Update Database Schema
1. Add Consent, BannerConfig models
2. Update Website model with embedCode field
3. Create migration: `pnpm prisma migrate dev --name add_banner_consent`
4. Generate Prisma Client

### Step 2: Create Banner Configuration Form
1. Create `components/dashboard/banner-config-form.tsx`:
   - Theme selector (light/dark/custom)
   - Position selector
   - Color pickers for primary and text colors
   - Button style selector
   - Animation selector
   - Custom CSS textarea
   - Save button with server action

### Step 3: Create Banner Preview Component
1. Create `components/widget/banner.tsx`:
   - Reusable banner component
   - Accepts configuration props
   - Shows consent options
   - Handles accept/reject/customize actions
   - Responsive design
   - Accessible (ARIA labels, keyboard navigation)

### Step 4: Create Cookie Settings Modal
1. Create `components/widget/cookie-settings-modal.tsx`:
   - Toggle switches for each cookie category
   - Category descriptions
   - Save preferences button
   - Required cookies cannot be disabled

### Step 5: Create Consent Manager
1. Create `lib/widget/consent-manager.ts`:
   - `saveConsent()` - Store consent preferences
   - `getConsent()` - Retrieve stored consent
   - `hasConsented()` - Check if user has consented
   - Uses localStorage for client-side storage
   - Generates visitor ID (UUID)

### Step 6: Create Banner Widget Logic
1. Create `lib/widget/banner.ts`:
   - `initBanner()` function
   - Loads configuration from API
   - Checks if consent already given
   - Shows/hides banner based on consent status
   - Handles banner dismissal
   - Manages cookie settings modal

### Step 7: Create Widget API Endpoints
1. Create `app/api/widget/[embedCode]/config.json/route.ts`:
   - GET handler
   - Fetch website by embedCode
   - Return banner configuration as JSON
   - CORS headers for cross-origin requests
2. Create `app/api/consent/route.ts`:
   - POST handler
   - Accept consent preferences
   - Store Consent record
   - Return success response
   - CORS enabled

### Step 8: Create Widget Loader Script
1. Create `app/api/widget/[embedCode]/script.js/route.ts`:
   - Returns JavaScript file
   - Sets up widget initialization
   - Loads banner script dynamically
   - Handles CORS
   - Content-Type: application/javascript

### Step 9: Create Compiled Widget Script
1. Create `public/widget/banner.js`:
   - Self-contained banner widget
   - No external dependencies
   - Works in any website context
   - Includes consent manager
   - Includes banner UI
   - Includes cookie settings modal
   - Minified for production

### Step 10: Create Embed Code Generator
1. Create `lib/widget/embed-generator.ts`:
   - `generateEmbedCode()` - Creates unique embed code
   - `getEmbedScript()` - Returns embed script HTML
   - Updates website embedCode field

### Step 11: Create Banner Configuration Page
1. Create `app/(dashboard)/dashboard/websites/[id]/banner/page.tsx`:
   - Load existing banner config
   - Display configuration form
   - Show preview
   - Save configuration
   - Link to embed code page

### Step 12: Create Banner Preview Page
1. Create `app/(dashboard)/dashboard/websites/[id]/banner/preview/page.tsx`:
   - Full-page preview
   - Simulates website context
   - Shows banner in action
   - Test all interactions

### Step 13: Create Embed Code Page
1. Create `app/(dashboard)/dashboard/websites/[id]/embed/page.tsx`:
   - Display embed script
   - Copy-to-clipboard functionality
   - Instructions for integration
   - Test link to verify widget works

### Step 14: Create Consent Log Component
1. Create `components/dashboard/consent-log.tsx`:
   - List of consent records
   - Filter by date range
   - Show consent preferences
   - Export functionality (CSV)

### Step 15: Implement Server Actions
1. Create `lib/actions/banner.ts`:
   - `saveBannerConfig()` - Save configuration
   - `getBannerConfig()` - Fetch configuration
   - `generateEmbedCode()` - Create embed code
   - `getConsents()` - Fetch consent records

### Step 16: Add Widget Styling
1. Create widget CSS:
   - Base styles
   - Theme variants
   - Position variants
   - Animation variants
   - Responsive styles
   - Ensure no conflicts with host site

### Step 17: Test Cross-Origin Functionality
1. Test widget on different domains
2. Verify CORS headers work
3. Test localStorage in different contexts
4. Ensure widget works in iframe (if needed)

### Step 18: Add Analytics (Optional)
1. Track banner impressions
2. Track consent rates
3. Track category preferences
4. Store analytics in database

## Code Specifications

### components/widget/banner.tsx
- React component (can be used in preview)
- Props: config (BannerConfig), onAccept, onReject, onCustomize
- Renders banner UI based on position
- Shows appropriate buttons based on config
- Handles animations
- Accessible markup

### lib/widget/banner.ts
- `initBanner(embedCode: string)` function
- Fetches config from API
- Checks localStorage for existing consent
- Creates banner DOM element
- Injects banner into page
- Sets up event listeners
- Manages banner visibility

### lib/widget/consent-manager.ts
- `saveConsent(preferences: ConsentPreferences)` - Store in localStorage and send to API
- `getConsent()` - Retrieve from localStorage
- `hasConsented()` - Boolean check
- `clearConsent()` - Remove consent (for testing)
- `getVisitorId()` - Generate or retrieve visitor ID

### app/api/widget/[embedCode]/config.json/route.ts
- GET handler
- Extract embedCode from params
- Find website by embedCode
- Load BannerConfig
- Return JSON with CORS headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET`
  - `Content-Type: application/json`

### app/api/consent/route.ts
- POST handler
- Accept JSON body: { websiteId, preferences, visitorId, ipAddress?, userAgent? }
- Validate input
- Create Consent record
- Return success response
- CORS enabled

### public/widget/banner.js
- IIFE (Immediately Invoked Function Expression)
- Self-contained widget code
- No external dependencies
- Includes:
  - Consent manager
  - Banner renderer
  - Cookie settings modal
  - API communication
- Minified for production

### Embed Script Format
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://yourdomain.com/api/widget/[EMBED_CODE]/script.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

## Testing Checklist

### Banner Configuration
- [ ] Can save banner configuration
- [ ] Configuration persists correctly
- [ ] Preview updates in real-time
- [ ] All customization options work
- [ ] Custom CSS applies correctly

### Banner Widget
- [ ] Banner displays on page load (if no consent)
- [ ] Banner doesn't show if consent already given
- [ ] Accept All button works
- [ ] Reject All button works
- [ ] Customize button opens modal
- [ ] Cookie settings modal works
- [ ] Preferences save correctly
- [ ] Banner dismisses after consent

### Embedding
- [ ] Embed code generates correctly
- [ ] Embed script loads widget
- [ ] Widget works on different domains
- [ ] CORS headers are correct
- [ ] Widget doesn't conflict with host site styles
- [ ] Widget is mobile-responsive

### Consent Management
- [ ] Consent preferences stored in database
- [ ] Consent retrieved correctly
- [ ] Visitor ID generated correctly
- [ ] Consent log displays correctly
- [ ] Can export consent data

### Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile browsers

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Focus management correct
- [ ] Color contrast meets WCAG standards

## Ready for Next Phase?

Before proceeding to Phase 5, ensure:

1. ✅ **Banner works reliably**
   - Displays correctly on various sites
   - Consent preferences save correctly
   - No conflicts with host site

2. ✅ **Configuration is flexible**
   - All customization options work
   - Preview is accurate
   - Changes persist correctly

3. ✅ **Embedding is simple**
   - Copy-paste embed code works
   - Instructions are clear
   - Widget loads quickly

4. ✅ **Compliance is met**
   - GDPR requirements satisfied
   - Consent is properly recorded
   - Audit trail exists

---

# Phase 5: Legal Document Generator

## Overview

Phase 5 implements an AI-powered legal document generator that creates GDPR-compliant privacy policies and cookie policies based on website scan data. The generator will use the detected cookies, scripts, and website information to create personalized legal documents that users can download and host on their websites.

**Why this phase matters:** Privacy policies are legally required for GDPR compliance. Automating their generation saves users time and ensures they include all necessary information based on their actual website practices.

## Requirements

### Document Generation
- Generate privacy policy based on:
  - Website information
  - Detected cookies
  - Detected tracking scripts
  - Data collection practices
  - Contact information
- Generate cookie policy
- Support multiple languages (English, German, French, etc.)
- Template-based generation with AI enhancement
- PDF export functionality
- HTML export for easy integration

### Document Management
- Store generated documents
- Version history
- Update documents when website changes
- Download documents
- Preview before generation

### Legal Compliance
- GDPR Article 13/14 requirements
- CCPA requirements (optional)
- Include all required sections:
  - Data controller information
  - Data processing purposes
  - Legal basis for processing
  - Data retention periods
  - User rights (access, deletion, etc.)
  - Contact information for DPO/Data Controller
  - Cookie details
  - Third-party services disclosure

### Customization
- Company information input
- DPO contact details
- Custom sections
- Branding options
- Language selection

## Database Schema

### Additional Prisma Models

```prisma
model Policy {
  id          String   @id @default(cuid())
  websiteId   String
  type        String   // privacy_policy, cookie_policy
  language    String   @default("en")
  content     String   @db.Text
  htmlContent String?  @db.Text
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  generatedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  website     Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  
  @@index([websiteId])
  @@index([websiteId, type, isActive])
  @@map("policies")
}

model PolicyTemplate {
  id          String   @id @default(cuid())
  type        String   // privacy_policy, cookie_policy
  language    String
  content     String   @db.Text
  variables   Json     // Template variables
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([type, language, isDefault])
  @@map("policy_templates")
}

// Update Website model:
model Website {
  // ... existing fields ...
  companyName     String?
  companyAddress  String?
  companyEmail    String?
  dpoEmail        String?
  dpoName         String?
  policies        Policy[]
}
```

## Files to Create

```
app/
├── (dashboard)/
│   └── dashboard/
│       └── websites/
│           └── [id]/
│               ├── policies/
│               │   ├── page.tsx         # Policies list
│               │   ├── generate/
│               │   │   └── page.tsx     # Generate policy form
│               │   └── [policyId]/
│               │       ├── page.tsx     # View policy
│               │       └── download/
│               │           └── route.ts  # Download PDF
│               │
│               └── settings/
│                   └── page.tsx         # Company info settings

components/
├── dashboard/
│   ├── policy-generator-form.tsx        # Generation form
│   ├── policy-preview.tsx              # Preview generated policy
│   ├── policy-list.tsx                 # List of policies
│   ├── company-info-form.tsx           # Company information form
│   └── policy-download-button.tsx      # Download buttons
│
└── legal/
    └── policy-template.tsx             # Policy template component

lib/
├── generators/
│   ├── privacy-policy.ts               # Privacy policy generator
│   ├── cookie-policy.ts                # Cookie policy generator
│   └── template-engine.ts              # Template processing
│
├── utils/
│   └── pdf-generator.ts                # PDF generation utility
│
└── actions/
    └── policy.ts                        # Server actions for policies
```

## Implementation Steps

### Step 1: Update Database Schema
1. Add Policy, PolicyTemplate models
2. Update Website model with company information fields
3. Create migration: `pnpm prisma migrate dev --name add_policies`
4. Seed default policy templates

### Step 2: Create Policy Templates
1. Create default templates in database:
   - Privacy Policy (English)
   - Cookie Policy (English)
   - Privacy Policy (German)
   - Cookie Policy (German)
   - (Add more languages as needed)
2. Templates should include placeholders for:
   - Company name, address, email
   - Website URL
   - Cookie details
   - Tracking scripts
   - Data processing purposes
   - Contact information

### Step 3: Create Template Engine
1. Create `lib/generators/template-engine.ts`:
   - `processTemplate()` function
   - Replace placeholders with actual data
   - Handle conditional sections
   - Support nested variables
   - Escape HTML where needed

### Step 4: Create Privacy Policy Generator
1. Create `lib/generators/privacy-policy.ts`:
   - `generatePrivacyPolicy()` function
   - Accepts website data, scan results, company info
   - Fetches appropriate template
   - Processes template with data:
     - Company information
     - Website URL
     - Cookie categories and details
     - Tracking scripts and purposes
     - Data retention information
     - User rights
     - Contact information
   - Returns generated content

### Step 5: Create Cookie Policy Generator
1. Create `lib/generators/cookie-policy.ts`:
   - `generateCookiePolicy()` function
   - Accepts website data, cookies, company info
   - Generates detailed cookie table:
     - Cookie name
     - Purpose
     - Category
     - Duration
     - Third-party information
   - Includes cookie management instructions
   - Returns generated content

### Step 6: Create Company Info Form
1. Create `components/dashboard/company-info-form.tsx`:
   - Company name input
   - Company address textarea
   - Company email input
   - DPO name input
   - DPO email input
   - Save button with server action
   - Validation

### Step 7: Create Policy Generator Form
1. Create `components/dashboard/policy-generator-form.tsx`:
   - Policy type selector (Privacy/Cookie)
   - Language selector
   - Preview checkbox
   - Generate button
   - Shows required company info warning
   - Links to settings if info missing

### Step 8: Create Policy Preview Component
1. Create `components/legal/policy-template.tsx`:
   - Renders policy content as HTML
   - Styled for readability
   - Print-friendly styles
   - Responsive design
2. Create `components/dashboard/policy-preview.tsx`:
   - Wrapper for policy template
   - Shows generated content
   - Edit/regenerate options

### Step 9: Create PDF Generator
1. Install PDF library: `pnpm add puppeteer` (already installed) or `@react-pdf/renderer`
2. Create `lib/utils/pdf-generator.ts`:
   - `generatePDF()` function
   - Converts HTML to PDF
   - Uses Puppeteer to render HTML
   - Returns PDF buffer
   - Handles page breaks
   - Includes headers/footers

### Step 10: Create Policy Pages
1. Create `app/(dashboard)/dashboard/websites/[id]/policies/page.tsx`:
   - List all policies for website
   - Show policy type, language, version
   - Active/inactive status
   - Generate new policy button
   - Link to view/download

2. Create `app/(dashboard)/dashboard/websites/[id]/policies/generate/page.tsx`:
   - Policy generator form
   - Preview section
   - Generate button
   - Shows progress during generation

3. Create `app/(dashboard)/dashboard/websites/[id]/policies/[policyId]/page.tsx`:
   - View full policy
   - Download buttons (PDF, HTML)
   - Version history
   - Regenerate option

### Step 11: Create Download Route
1. Create `app/(dashboard)/dashboard/websites/[id]/policies/[policyId]/download/route.ts`:
   - GET handler
   - Verify ownership
   - Generate PDF
   - Return PDF file
   - Set appropriate headers:
     - `Content-Type: application/pdf`
     - `Content-Disposition: attachment`

### Step 12: Create Server Actions
1. Create `lib/actions/policy.ts`:
   - `generatePolicy()` - Generate new policy
   - `getPolicies()` - Fetch website policies
   - `getPolicy()` - Fetch single policy
   - `updateCompanyInfo()` - Save company information
   - `downloadPolicyPDF()` - Generate and return PDF

### Step 13: Create Settings Page
1. Create `app/(dashboard)/dashboard/websites/[id]/settings/page.tsx`:
   - Company information form
   - Website settings
   - Save functionality
   - Validation

### Step 14: Add Policy Sections
1. Ensure templates include all GDPR-required sections:
   - Introduction
   - Data Controller
   - Data Collection
   - Legal Basis
   - Data Processing Purposes
   - Data Retention
   - User Rights
   - Cookies and Tracking
   - Third-Party Services
   - International Transfers
   - Security Measures
   - Contact Information
   - Updates to Policy

### Step 15: Implement Versioning
1. When regenerating policy:
   - Mark old version as inactive
   - Create new version
   - Increment version number
   - Store generation timestamp

### Step 16: Add HTML Export
1. Create HTML export functionality:
   - Clean HTML output
   - Embedded styles
   - Ready to copy-paste
   - Download as .html file

### Step 17: Enhance with AI (Optional)
1. Consider integrating AI for:
   - Natural language generation
   - Custom section writing
   - Language translation
   - Content suggestions
2. Use OpenAI API or similar service
3. Add AI enhancement toggle in generator form

## Code Specifications

### lib/generators/privacy-policy.ts
- `generatePrivacyPolicy(data: PolicyData)` function
- PolicyData interface includes:
  - Website info
  - Company info
  - Cookies (categorized)
  - Scripts (with purposes)
  - Language
- Fetches template from database
- Processes template with data
- Returns HTML content string

### lib/generators/cookie-policy.ts
- `generateCookiePolicy(data: CookiePolicyData)` function
- CookiePolicyData includes:
  - Website info
  - Company info
  - List of cookies with details
  - Language
- Generates cookie table
- Includes management instructions
- Returns HTML content

### lib/generators/template-engine.ts
- `processTemplate(template: string, data: object)` function
- Supports placeholders: `{{variableName}}`
- Supports conditionals: `{{#if condition}}...{{/if}}`
- Supports loops: `{{#each items}}...{{/each}}`
- Escapes HTML in variables
- Returns processed string

### lib/utils/pdf-generator.ts
- `generatePDF(html: string, options?: PDFOptions)` function
- Uses Puppeteer to render HTML
- Converts to PDF
- Handles page breaks
- Returns Buffer
- Options: format, margins, header/footer

### components/dashboard/policy-generator-form.tsx
- Form with policy type selector
- Language dropdown
- Preview toggle
- Generate button
- Shows validation errors
- Displays preview if enabled
- Loading state during generation

### app/(dashboard)/dashboard/websites/[id]/policies/generate/page.tsx
- Server component
- Fetches website data and latest scan
- Checks if company info is complete
- Shows warning if info missing
- Renders generator form
- Handles form submission
- Redirects to policy view on success

### Policy Template Format
```html
<h1>Privacy Policy</h1>
<p>Last updated: {{lastUpdated}}</p>

<h2>1. Data Controller</h2>
<p>{{companyName}}<br>
{{companyAddress}}<br>
Email: {{companyEmail}}</p>

<h2>2. Cookies We Use</h2>
{{#each cookies}}
  <h3>{{name}}</h3>
  <p>Purpose: {{purpose}}</p>
  <p>Category: {{category}}</p>
{{/each}}

<!-- More sections... -->
```

## Testing Checklist

### Policy Generation
- [ ] Privacy policy generates correctly
- [ ] Cookie policy generates correctly
- [ ] All placeholders are replaced
- [ ] Company information included
- [ ] Cookie details included
- [ ] Tracking scripts included
- [ ] All GDPR sections present

### Template Processing
- [ ] Variables replaced correctly
- [ ] Conditionals work
- [ ] Loops render correctly
- [ ] HTML escaped properly
- [ ] Special characters handled

### Company Information
- [ ] Can save company info
- [ ] Info persists correctly
- [ ] Validation works
- [ ] Required fields enforced
- [ ] Info used in policy generation

### Document Management
- [ ] Policies saved to database
- [ ] Versioning works correctly
- [ ] Can view policy history
- [ ] Active/inactive status works
- [ ] Multiple languages supported

### PDF Generation
- [ ] PDF generates correctly
- [ ] Formatting is correct
- [ ] All content included
- [ ] Download works
- [ ] File size is reasonable

### HTML Export
- [ ] HTML exports correctly
- [ ] Styles included
- [ ] Ready to use
- [ ] Download works

### User Experience
- [ ] Generator form is intuitive
- [ ] Preview works correctly
- [ ] Loading states show
- [ ] Error messages are clear
- [ ] Success feedback provided

## Ready for Next Phase?

Before proceeding to Phase 6, ensure:

1. ✅ **Policies generate correctly**
   - All required information included
   - Templates process correctly
   - Content is GDPR-compliant

2. ✅ **Export functionality works**
   - PDF generation reliable
   - HTML export functional
   - Downloads work correctly

3. ✅ **Data is accurate**
   - Company info used correctly
   - Cookie data accurate
   - Script information correct

4. ✅ **User experience is smooth**
   - Generation is fast
   - Preview is helpful
   - Downloads are easy

---

# Phase 6: PayStack Subscriptions & Billing

## Overview

Phase 6 implements the subscription and billing system using PayStack, enabling ComplianceKit to operate as a SaaS platform. Users will be able to subscribe to different plans, manage their subscriptions, update payment methods, and view billing history. This phase also includes plan-based feature restrictions.

**Why this phase matters:** Without a working subscription system, ComplianceKit cannot generate revenue. This phase enables the business model and ensures users are properly billed for the service.

## Requirements

### Subscription Plans
- Three tiers:
  - Starter: $29/month - 1 website, basic scanning
  - Professional: $99/month - 5 websites, advanced features
  - Enterprise: $299/month - Unlimited websites, all features
- Plan features clearly defined
- Plan comparison page
- Upgrade/downgrade functionality

### PayStack Integration
- PayStack API integration
- Create subscription plans in PayStack dashboard
- Handle subscription creation
- Handle webhook events:
  - Subscription created
  - Subscription updated
  - Payment successful
  - Payment failed
  - Subscription cancelled
- Secure webhook verification

### Subscription Management
- View current plan
- Upgrade plan
- Downgrade plan (at end of billing period)
- Cancel subscription
- Reactivate subscription
- Update payment method
- View billing history

### Feature Restrictions
- Enforce plan limits:
  - Website count limits
  - Scan frequency limits
  - Feature access (e.g., advanced reports)
- Show upgrade prompts when limits reached
- Grace period for expired subscriptions

### Billing
- Invoice generation
- Email invoices to users
- Billing history page
- Download invoices (PDF)
- Payment method management

## Database Schema

### Additional Prisma Models

```prisma
model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  planId            String
  paystackPlanCode  String   // PayStack plan code
  paystackSubCode   String?  // PayStack subscription code
  status            String   // active, cancelled, expired, past_due
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean  @default(false)
  cancelledAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices           Invoice[]
  
  @@index([userId])
  @@index([status])
  @@map("subscriptions")
}

model Invoice {
  id              String   @id @default(cuid())
  subscriptionId  String
  paystackRef     String?  // PayStack reference
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("ZAR") // South African Rand
  status          String   // paid, pending, failed
  paidAt          DateTime?
  dueDate         DateTime
  pdfUrl          String?
  createdAt       DateTime @default(now())
  
  subscription    Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  @@index([subscriptionId])
  @@index([status])
  @@map("invoices")
}

model Plan {
  id                String   @id @default(cuid())
  name              String   // Starter, Professional, Enterprise
  paystackPlanCode  String   @unique
  price             Decimal  @db.Decimal(10, 2)
  currency          String   @default("ZAR")
  interval          String   @default("monthly") // monthly, yearly
  maxWebsites       Int?
  features          Json     // Feature flags
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("plans")
}

// Update User model:
model User {
  // ... existing fields ...
  subscription      Subscription?
}
```

## Files to Create

```
app/
├── (dashboard)/
│   └── dashboard/
│       ├── billing/
│       │   ├── page.tsx                # Billing overview
│       │   ├── plans/
│       │   │   └── page.tsx            # Plans comparison
│       │   ├── history/
│       │   │   └── page.tsx            # Invoice history
│       │   └── payment/
│       │       └── page.tsx            # Payment method
│       │
│       └── api/
│           └── webhooks/
│               └── paystack/
│                   └── route.ts        # PayStack webhook handler
│
└── api/
    └── subscriptions/
        ├── create/
        │   └── route.ts                # Create subscription
        └── [id]/
            ├── cancel/
            │   └── route.ts            # Cancel subscription
            └── update/
                └── route.ts            # Update subscription

components/
├── billing/
│   ├── plan-card.tsx                   # Plan display card
│   ├── plans-comparison.tsx            # Plans comparison table
│   ├── subscription-status.tsx         # Current subscription display
│   ├── upgrade-prompt.tsx              # Upgrade CTA
│   ├── invoice-list.tsx                # List of invoices
│   └── payment-method-form.tsx         # Payment method update
│
└── dashboard/
    └── usage-limits.tsx                # Show usage vs limits

lib/
├── paystack/
│   ├── client.ts                       # PayStack API client
│   ├── webhooks.ts                     # Webhook verification
│   └── subscriptions.ts                # Subscription helpers
│
├── plans/
│   └── features.ts                     # Plan feature definitions
│
└── actions/
    └── billing.ts                      # Server actions for billing
```

## Implementation Steps

### Step 1: Set Up PayStack Account
1. Create PayStack account
2. Get API keys (test and live)
3. Create subscription plans in PayStack dashboard:
   - Starter: ₦29,000/month (or equivalent in ZAR)
   - Professional: ₦99,000/month
   - Enterprise: ₦299,000/month
4. Note plan codes for database

### Step 2: Update Database Schema
1. Add Subscription, Invoice, Plan models
2. Update User model with subscription relation
3. Seed Plans table with plan data
4. Create migration: `pnpm prisma migrate dev --name add_subscriptions`
5. Generate Prisma Client

### Step 3: Install PayStack SDK
1. Install PayStack SDK: `pnpm add paystack` or use fetch API
2. Create PayStack client wrapper

### Step 4: Create PayStack Client
1. Create `lib/paystack/client.ts`:
   - Initialize PayStack client with secret key
   - Functions for:
     - Create subscription
     - Get subscription
     - Update subscription
     - Cancel subscription
     - Create payment link
     - Verify transaction
   - Error handling
   - Type definitions

### Step 5: Create Plan Features Definition
1. Create `lib/plans/features.ts`:
   - Define feature flags for each plan
   - Max websites per plan
   - Feature access matrix
   - Helper functions to check feature access

### Step 6: Seed Plans Data
1. Create seed script or migration to insert plans:
   - Starter plan
   - Professional plan
   - Enterprise plan
   - Include PayStack plan codes
   - Set feature flags

### Step 7: Create Subscription Creation Flow
1. Create `app/api/subscriptions/create/route.ts`:
   - POST handler
   - Verify user authentication
   - Get plan from database
   - Create subscription in PayStack
   - Create Subscription record in database
   - Return payment authorization URL
   - Handle errors

### Step 8: Create PayStack Webhook Handler
1. Create `app/api/webhooks/paystack/route.ts`:
   - POST handler (no authentication, uses webhook secret)
   - Verify webhook signature
   - Handle event types:
     - `subscription.create`
     - `subscription.update`
     - `subscription.disable`
     - `charge.success`
     - `invoice.payment_failed`
   - Update database accordingly
   - Return 200 status

### Step 9: Create Billing Overview Page
1. Create `app/(dashboard)/dashboard/billing/page.tsx`:
   - Show current subscription status
   - Display current plan
   - Show next billing date
   - Usage statistics
   - Quick actions (upgrade, manage)

### Step 10: Create Plans Comparison Page
1. Create `app/(dashboard)/dashboard/billing/plans/page.tsx`:
   - Display all plans
   - Feature comparison table
   - Highlight current plan
   - Upgrade/downgrade buttons
   - Link to subscribe

### Step 11: Create Plan Components
1. Create `components/billing/plan-card.tsx`:
   - Display plan name, price, features
   - Subscribe/Upgrade button
   - Current plan badge
   - Popular plan badge
2. Create `components/billing/plans-comparison.tsx`:
   - Comparison table
   - Feature checkmarks
   - Price comparison
   - CTA buttons

### Step 12: Create Subscription Management Components
1. Create `components/billing/subscription-status.tsx`:
   - Current plan display
   - Status badge
   - Next billing date
   - Cancel subscription button
2. Create `components/billing/upgrade-prompt.tsx`:
   - Show when limit reached
   - Explain benefits of upgrade
   - Link to plans page

### Step 13: Create Invoice History Page
1. Create `app/(dashboard)/dashboard/billing/history/page.tsx`:
   - List all invoices
   - Filter by status
   - Download PDF links
   - Payment status indicators
2. Create `components/billing/invoice-list.tsx`:
   - Table of invoices
   - Status badges
   - Download buttons
   - Date formatting

### Step 14: Create Payment Method Page
1. Create `app/(dashboard)/dashboard/billing/payment/page.tsx`:
   - Display current payment method
   - Update payment method form
   - Link to PayStack payment page
2. Create `components/billing/payment-method-form.tsx`:
   - Payment method display
   - Update button
   - Security messaging

### Step 15: Implement Feature Restrictions
1. Create `lib/plans/check-access.ts`:
   - `canAddWebsite()` - Check website limit
   - `canAccessFeature()` - Check feature access
   - `getUsageStats()` - Get current usage
2. Add middleware/checks in:
   - Website creation
   - Scan triggering
   - Feature access points

### Step 16: Create Subscription Actions
1. Create `app/api/subscriptions/[id]/cancel/route.ts`:
   - POST handler
   - Cancel subscription in PayStack
   - Update database
   - Set cancelAtPeriodEnd flag
2. Create `app/api/subscriptions/[id]/update/route.ts`:
   - POST handler
   - Update subscription plan
   - Handle proration
   - Update database

### Step 17: Create Server Actions
1. Create `lib/actions/billing.ts`:
   - `getSubscription()` - Get user subscription
   - `getPlans()` - Get all plans
   - `createSubscription()` - Initiate subscription
   - `cancelSubscription()` - Cancel subscription
   - `getInvoices()` - Get invoice history

### Step 18: Add Usage Limits Component
1. Create `components/dashboard/usage-limits.tsx`:
   - Show websites used vs limit
   - Show scans used vs limit
   - Progress bars
   - Upgrade prompts

### Step 19: Implement Invoice Generation
1. Create invoice generation utility:
   - Generate PDF invoices
   - Store in database
   - Email to user
   - Download functionality

### Step 20: Add Subscription Status Checks
1. Add middleware to check subscription status
2. Redirect to billing page if subscription expired
3. Show grace period warnings
4. Block features if subscription inactive

### Step 21: Test PayStack Integration
1. Test subscription creation with test cards
2. Test webhook events
3. Test payment success flow
4. Test payment failure handling
5. Test subscription cancellation

### Step 22: Add Email Notifications
1. Send emails for:
   - Subscription created
   - Payment successful
   - Payment failed
   - Subscription cancelled
   - Invoice generated
2. Use Resend for transactional emails

## Code Specifications

### lib/paystack/client.ts
- PayStack API client class
- Methods:
  - `createSubscription(planCode, email, authorizationCode)`
  - `getSubscription(subscriptionCode)`
  - `updateSubscription(subscriptionCode, planCode)`
  - `cancelSubscription(subscriptionCode)`
  - `verifyWebhook(payload, signature)`
- Uses PayStack secret key from env
- Error handling and retries

### lib/paystack/webhooks.ts
- `verifyWebhookSignature()` function
- Verifies PayStack webhook signature
- Returns boolean
- Uses webhook secret from env

### app/api/webhooks/paystack/route.ts
- POST handler
- Verify webhook signature
- Parse event type
- Handle each event:
  - `subscription.create`: Create Subscription record
  - `charge.success`: Create Invoice, update Subscription
  - `invoice.payment_failed`: Update Subscription status
  - `subscription.disable`: Mark subscription as cancelled
- Return 200 status
- Log events for debugging

### lib/plans/features.ts
- Feature definitions:
  ```typescript
  const PLAN_FEATURES = {
    starter: {
      maxWebsites: 1,
      advancedReports: false,
      apiAccess: false,
      // ...
    },
    professional: {
      maxWebsites: 5,
      advancedReports: true,
      apiAccess: false,
      // ...
    },
    enterprise: {
      maxWebsites: null, // unlimited
      advancedReports: true,
      apiAccess: true,
      // ...
    }
  }
  ```
- Helper functions to check access

### components/billing/plan-card.tsx
- Display plan name
- Display price
- List key features
- Subscribe/Upgrade button
- Current plan indicator
- Popular badge (if applicable)

### app/api/subscriptions/create/route.ts
- POST handler
- Get planId from body
- Verify user authentication
- Get plan from database
- Create subscription in PayStack
- Create Subscription record
- Return authorization URL
- Handle errors

### Feature Restriction Example
```typescript
// In website creation action
const subscription = await getSubscription(userId);
const plan = await getPlan(subscription.planId);
const websites = await getWebsites(userId);

if (plan.maxWebsites && websites.length >= plan.maxWebsites) {
  throw new Error('Website limit reached. Please upgrade your plan.');
}
```

## Testing Checklist

### Subscription Creation
- [ ] Can select a plan
- [ ] Redirects to PayStack payment page
- [ ] Payment successful creates subscription
- [ ] Subscription record created in database
- [ ] User can access features

### Webhook Handling
- [ ] Webhook signature verification works
- [ ] Subscription create event handled
- [ ] Payment success event handled
- [ ] Payment failure event handled
- [ ] Subscription cancellation event handled
- [ ] Database updates correctly

### Plan Management
- [ ] Can view all plans
- [ ] Current plan highlighted
- [ ] Can upgrade plan
- [ ] Can downgrade plan
- [ ] Plan changes reflect immediately (or at period end)

### Feature Restrictions
- [ ] Website limits enforced
- [ ] Feature access restricted by plan
- [ ] Upgrade prompts show when limit reached
- [ ] Usage statistics accurate

### Billing
- [ ] Invoices generated correctly
- [ ] Invoice history displays
- [ ] Can download invoices
- [ ] Payment method can be updated
- [ ] Billing dates accurate

### Subscription Cancellation
- [ ] Can cancel subscription
- [ ] Cancellation scheduled for period end
- [ ] Can reactivate before period end
- [ ] Features remain active until period end
- [ ] Access revoked after period end

### Error Handling
- [ ] Payment failures handled gracefully
- [ ] Webhook errors logged
- [ ] User-friendly error messages
- [ ] Retry logic for API calls

## Ready for Production?

Before launching, ensure:

1. ✅ **PayStack integration is complete**
   - Live API keys configured
   - Webhooks configured in PayStack dashboard
   - All events handled correctly

2. ✅ **Subscription flow works end-to-end**
   - Users can subscribe
   - Payments process correctly
   - Subscriptions activate
   - Features unlock

3. ✅ **Billing is accurate**
   - Invoices generate correctly
   - Prices are correct
   - Billing dates accurate
   - Currency handling correct

4. ✅ **Feature restrictions work**
   - Limits enforced correctly
   - Upgrade prompts functional
   - Grace periods handled

5. ✅ **Security is implemented**
   - Webhook signatures verified
   - API keys secured
   - User data protected
   - Payment data never stored

6. ✅ **User experience is smooth**
   - Billing pages are clear
   - Error messages helpful
   - Upgrade flow intuitive
   - Support documentation available

---

# Additional Considerations

## Security
- Implement rate limiting on API routes
- Use HTTPS everywhere
- Sanitize user inputs
- Validate webhook signatures
- Use environment variables for secrets
- Implement CSRF protection
- Regular security audits

## Performance
- Optimize database queries
- Implement caching where appropriate
- Use CDN for static assets
- Optimize images
- Monitor API response times
- Set up error tracking (Sentry)

## Monitoring & Analytics
- Set up error tracking
- Monitor API usage
- Track subscription metrics
- Monitor scan performance
- Set up uptime monitoring
- Log important events

## Documentation
- API documentation
- User guides
- Integration guides
- FAQ page
- Support documentation

## Legal
- Terms of Service
- Privacy Policy (for ComplianceKit itself)
- GDPR compliance for ComplianceKit
- Data processing agreements
- Cookie policy for ComplianceKit website

## Deployment
- Set up production environment
- Configure CI/CD pipeline
- Set up staging environment
- Database backups
- Environment variable management
- SSL certificates

---

# Conclusion

This implementation guide provides a comprehensive roadmap for building ComplianceKit from scratch. Each phase builds upon the previous one, creating a complete GDPR compliance SaaS platform.

Follow the phases sequentially, ensuring each phase is complete and tested before moving to the next. The guide is detailed enough to hand to an AI coding assistant or development team for implementation.

Good luck with your build! 🚀





