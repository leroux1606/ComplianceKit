# ComplianceKit - Complete Testing Checklist

**Purpose:** Systematically test every feature to identify what works and what needs fixing.

**How to Use This Document:**
- Follow each test in order
- Mark ✅ PASS or ❌ FAIL for each test
- If FAIL: Screenshot the error and note the test number
- Don't skip tests - they build on each other

---

## 📋 Pre-Testing Setup

### Setup 1: Verify Environment Variables

**Steps:**
1. Open your project folder in VS Code (or any editor)
2. Check if `.env.local` file exists in the root folder
3. Verify it contains these variables (with actual values):
   ```
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

**Expected:** All variables have values (not empty)

**Status:** ☐ PASS / ☐ FAIL

**Notes:** _______________________________________________

---

### Setup 2: Database Setup

**Steps:**
1. Open terminal in project folder (VS Code: Terminal > New Terminal)
2. Run: `npx prisma generate`
3. Wait for it to complete
4. Run: `npx prisma db push`
5. Wait for it to complete

**Expected:** Both commands complete without errors

**Status:** ☐ PASS / ☐ FAIL

**Error (if any):** _______________________________________________

---

### Setup 3: Start the Application

**Steps:**
1. In terminal, run: `npm run dev` (or `pnpm dev` or `yarn dev`)
2. Wait for message: "Ready started on http://localhost:3000"
3. Open browser (Chrome recommended)
4. Go to: `http://localhost:3000`

**Expected:** You see the ComplianceKit homepage with purple theme

**Status:** ☐ PASS / ☐ FAIL

**Screenshot if FAIL**

---

## 🔐 PHASE 1: Authentication Tests

### Test 1.1: View Sign Up Page

**Steps:**
1. On homepage, click "Get Started" button (top right)
2. Or click "Sign Up" button
3. Or manually go to: `http://localhost:3000/sign-up`

**Expected:** You see sign-up form with:
- Name field
- Email field
- Password field
- "Create Account" button
- "Sign in with Google" button

**Status:** ☐ PASS / ☐ FAIL

---

### Test 1.2: Sign Up with Email/Password

**Steps:**
1. On sign-up page, enter:
   - **Name:** Test User
   - **Email:** testuser@example.com
   - **Password:** TestPass123!
2. Click "Create Account" button
3. Wait for response

**Expected:**
- Success message appears OR
- You're redirected to `/dashboard`

**Status:** ☐ PASS / ☐ FAIL

**Error message (if any):** _______________________________________________

**Screenshot if FAIL**

---

### Test 1.3: Sign Out

**Steps:**
1. If you're on the dashboard, look for your user avatar (top right)
2. Click on the avatar/profile menu
3. Click "Sign Out" or "Logout"

**Expected:**
- You're redirected to sign-in page or homepage
- You're no longer logged in

**Status:** ☐ PASS / ☐ FAIL

---

### Test 1.4: Sign In with Same Email

**Steps:**
1. Go to: `http://localhost:3000/sign-in`
2. Enter:
   - **Email:** testuser@example.com
   - **Password:** TestPass123!
3. Click "Sign In"

**Expected:** You're logged in and redirected to dashboard

**Status:** ☐ PASS / ☐ FAIL

**Error message (if any):** _______________________________________________

---

### Test 1.5: Google OAuth (Optional - Skip if not configured)

**Steps:**
1. On sign-in page, click "Sign in with Google" button
2. Select your Google account
3. Grant permissions if asked

**Expected:** You're logged in and redirected to dashboard

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP (not configured)

---

## 🌐 PHASE 2: Website Management Tests

### Test 2.1: View Dashboard

**Steps:**
1. Make sure you're logged in (from Phase 1)
2. You should be on: `http://localhost:3000/dashboard`

**Expected:**
- You see "Websites" heading or similar
- You see an empty state OR "Add Website" button

**Status:** ☐ PASS / ☐ FAIL

**Screenshot**

---

### Test 2.2: Add New Website

**Steps:**
1. On dashboard, click "Add Website" or "New Website" button
2. You should be on: `http://localhost:3000/dashboard/websites/new`
3. Fill in the form:
   - **Website Name:** My Test Website
   - **URL:** https://example.com
   - **Description:** Test website for compliance
4. Click "Add Website" or "Save" button

**Expected:**
- Success message appears
- You're redirected back to dashboard or website list
- You see your new website listed

**Status:** ☐ PASS / ☐ FAIL

**Error message (if any):** _______________________________________________

**Screenshot if FAIL**

---

### Test 2.3: View Website Details

**Steps:**
1. On dashboard, find your "My Test Website"
2. Click on the website card or "View Details"

**Expected:**
- You see website details page
- Shows: Name, URL, Status
- Has tabs or sections for: Scan, Banner, Policies, etc.

**Status:** ☐ PASS / ☐ FAIL

---

### Test 2.4: Edit Website

**Steps:**
1. On website details page, look for "Edit" button
2. Or go to: `http://localhost:3000/dashboard/websites/[id]/edit` (replace [id] with your website ID from URL)
3. Change the description to: "Updated test website"
4. Click "Save" or "Update"

**Expected:**
- Success message appears
- Changes are saved
- You see updated description

**Status:** ☐ PASS / ☐ FAIL

---

### Test 2.5: Add Company Information

**Steps:**
1. On website details or edit page, look for "Company Information" section
2. Fill in:
   - **Company Name:** Test Company Ltd
   - **Company Email:** contact@testcompany.com
   - **DPO Name:** John Doe
   - **DPO Email:** dpo@testcompany.com
3. Click "Save"

**Expected:** Company information is saved successfully

**Status:** ☐ PASS / ☐ FAIL

---

## 🔍 PHASE 3: Website Scanning Tests

### Test 3.1: Start Manual Scan

**Steps:**
1. Go to your website details page
2. Find "Scan" button or "Start Scan" button
3. Click it
4. Wait (this may take 30-60 seconds)

**Expected:**
- Scan status shows "Running" or "In Progress"
- Loading indicator appears
- Eventually shows "Completed"

**Status:** ☐ PASS / ☐ FAIL

**Notes:** How long did it take? _______________

**Error message (if any):** _______________________________________________

**Screenshot if FAIL**

---

### Test 3.2: View Scan Results

**Steps:**
1. After scan completes, you should see scan results
2. Or navigate to: Scans tab/section

**Expected:** You see:
- ✅ Compliance Score (0-100)
- ✅ List of cookies found
- ✅ List of tracking scripts found
- ✅ Findings/recommendations

**Status:** ☐ PASS / ☐ FAIL

**Compliance Score shown:** _______________

**Number of cookies found:** _______________

**Number of scripts found:** _______________

---

### Test 3.3: View Cookie Details

**Steps:**
1. On scan results page, find "Cookies" section
2. Look at the cookies listed

**Expected:**
- Each cookie shows: Name, Domain, Category
- Cookies are categorized (Necessary, Analytics, Marketing, etc.)

**Status:** ☐ PASS / ☐ FAIL

---

### Test 3.4: View Script Details

**Steps:**
1. On scan results page, find "Scripts" or "Tracking Scripts" section
2. Look at scripts listed

**Expected:**
- Scripts are listed with names/URLs
- Shows script types (Analytics, Marketing, etc.)

**Status:** ☐ PASS / ☐ FAIL

---

### Test 3.5: View Findings/Recommendations

**Steps:**
1. On scan results, find "Findings" or "Recommendations" section

**Expected:**
- Shows compliance issues found
- Each finding has: Severity (Info/Warning/Error), Description, Recommendation

**Status:** ☐ PASS / ☐ FAIL

---

## 🍪 PHASE 4: Cookie Banner Configuration

### Test 4.1: Access Banner Configuration

**Steps:**
1. From website details, find "Banner" tab or section
2. Or go to: `http://localhost:3000/dashboard/websites/[id]/banner`

**Expected:**
- You see banner configuration page
- Options for: Theme, Position, Colors, Button Style

**Status:** ☐ PASS / ☐ FAIL

---

### Test 4.2: Configure Banner Appearance

**Steps:**
1. On banner config page, change these settings:
   - **Theme:** Dark
   - **Position:** Bottom
   - **Primary Color:** Pick a color (try purple: #8b5cf6)
   - **Button Style:** Rounded
2. Click "Save" or "Update"

**Expected:**
- Settings save successfully
- Preview updates (if preview exists)

**Status:** ☐ PASS / ☐ FAIL

---

### Test 4.3: View Banner Preview

**Steps:**
1. On banner config page, look for "Preview" section or button
2. Check if banner preview shows

**Expected:**
- You see a preview of how the banner will look
- Preview reflects your chosen settings

**Status:** ☐ PASS / ☐ FAIL

---

### Test 4.4: Get Embed Code

**Steps:**
1. Find "Embed" tab or "Get Code" section
2. Or go to: `http://localhost:3000/dashboard/websites/[id]/embed`

**Expected:**
- You see JavaScript embed code
- Code includes a `<script>` tag
- Has "Copy" button to copy the code

**Status:** ☐ PASS / ☐ FAIL

**Can you copy the code?** ☐ YES / ☐ NO

---

### Test 4.5: Test Embed Code (Advanced - Optional)

**Steps:**
1. Create a simple HTML file on your computer: `test-banner.html`
2. Paste this code:
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>Banner Test</title></head>
   <body>
     <h1>Test Page</h1>
     <!-- PASTE YOUR EMBED CODE HERE -->
   </body>
   </html>
   ```
3. Replace the comment with your actual embed code from Test 4.4
4. Open the HTML file in your browser

**Expected:**
- Cookie banner appears on the page
- Banner looks correct (matches your settings)
- Clicking buttons works

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP

---

## 📄 PHASE 5: Policy Generation Tests

### Test 5.1: Access Policy Generator

**Steps:**
1. From website details, find "Policies" tab
2. Or go to: `http://localhost:3000/dashboard/websites/[id]/policies`

**Expected:**
- You see policies page
- Options to generate: Privacy Policy and Cookie Policy
- "Generate" or "Create Policy" buttons

**Status:** ☐ PASS / ☐ FAIL

---

### Test 5.2: Generate Privacy Policy

**Steps:**
1. On policies page, click "Generate Privacy Policy" or similar button
2. Wait for generation (may take a few seconds)

**Expected:**
- Policy is generated successfully
- You see success message
- Policy appears in the list

**Status:** ☐ PASS / ☐ FAIL

**Error message (if any):** _______________________________________________

---

### Test 5.3: View Privacy Policy

**Steps:**
1. Find your generated privacy policy in the list
2. Click "View" or click on the policy

**Expected:**
- Full privacy policy text is displayed
- Contains sections like: Data Collection, Cookies, User Rights, etc.
- Includes your company information (from Test 2.5)

**Status:** ☐ PASS / ☐ FAIL

**Does it include your company name?** ☐ YES / ☐ NO

---

### Test 5.4: Generate Cookie Policy

**Steps:**
1. Go back to policies page
2. Click "Generate Cookie Policy" button
3. Wait for generation

**Expected:**
- Cookie policy is generated
- Lists cookies found in your scan
- Organized by category

**Status:** ☐ PASS / ☐ FAIL

---

### Test 5.5: View Cookie Policy

**Steps:**
1. Click to view the generated cookie policy

**Expected:**
- Shows full cookie policy
- Includes table/list of cookies with details
- Explains cookie categories

**Status:** ☐ PASS / ☐ FAIL

---

## 📊 PHASE 6: Analytics Dashboard

### Test 6.1: Access Analytics Page

**Steps:**
1. From main navigation/sidebar, click "Analytics"
2. Or go to: `http://localhost:3000/dashboard/analytics`

**Expected:**
- Analytics page loads
- Shows charts and metrics
- May show "No data yet" if no consents recorded

**Status:** ☐ PASS / ☐ FAIL

---

### Test 6.2: View Compliance Metrics

**Steps:**
1. On analytics page, look for compliance score chart/gauge

**Expected:**
- Shows your website's compliance score
- Displays as gauge or chart
- Updates based on scan results

**Status:** ☐ PASS / ☐ FAIL

---

### Test 6.3: View Consent Metrics (May be empty)

**Steps:**
1. On analytics page, look for consent-related charts

**Expected:**
- Shows consent acceptance/rejection rates
- May say "No data" (expected if no one has used your banner yet)
- Charts render without errors

**Status:** ☐ PASS / ☐ FAIL / ☐ NO DATA (acceptable)

---

### Test 6.4: Date Range Selector

**Steps:**
1. Look for date range picker on analytics page
2. Try changing the date range (Last 7 days, 30 days, etc.)

**Expected:**
- Date picker works
- Charts update based on selected range
- No errors

**Status:** ☐ PASS / ☐ FAIL

---

## 🗂️ PHASE 7: DSAR Management

### Test 7.1: Access DSAR Page

**Steps:**
1. From navigation, click "DSAR" or "Data Requests"
2. Or go to: `http://localhost:3000/dashboard/dsar`

**Expected:**
- DSAR management page loads
- Shows list of requests (may be empty)
- Has option to view public form link

**Status:** ☐ PASS / ☐ FAIL

---

### Test 7.2: Get DSAR Public Form Link

**Steps:**
1. On DSAR page, look for "Public Form" or "Share Link"
2. Copy the public form URL

**Expected:**
- You can get/copy the public form URL
- URL looks like: `http://localhost:3000/dsar/[embedCode]`

**Status:** ☐ PASS / ☐ FAIL

**Public Form URL:** _______________________________________________

---

### Test 7.3: Submit DSAR Request (Public Form)

**Steps:**
1. Open a new browser tab (or incognito window)
2. Paste the public form URL from Test 7.2
3. Fill out the form:
   - **Request Type:** Access
   - **Name:** John Test
   - **Email:** johntest@example.com
   - **Description:** I want to know what data you have about me
4. Click "Submit Request"

**Expected:**
- Form submits successfully
- Confirmation message appears
- You get a verification notice

**Status:** ☐ PASS / ☐ FAIL

---

### Test 7.4: View DSAR Request in Dashboard

**Steps:**
1. Go back to your dashboard tab
2. Navigate to DSAR page
3. Refresh the page

**Expected:**
- Your test request appears in the list
- Shows: Requester name, email, status (Pending), request type

**Status:** ☐ PASS / ☐ FAIL

---

### Test 7.5: View DSAR Request Details

**Steps:**
1. Click on the test request to view details

**Expected:**
- Full request details shown
- Shows: Timeline, requester info, description
- Options to update status, add notes, respond

**Status:** ☐ PASS / ☐ FAIL

---

### Test 7.6: Update DSAR Status

**Steps:**
1. On DSAR request details, find status dropdown
2. Change status from "Pending" to "In Progress"
3. Add an internal note: "Reviewing request"
4. Click "Save" or "Update"

**Expected:**
- Status updates successfully
- Note is saved
- Activity timeline updates

**Status:** ☐ PASS / ☐ FAIL

---

## 💳 PHASE 8: Billing & Subscriptions

### Test 8.1: Access Billing Page

**Steps:**
1. From navigation, click "Billing" or "Subscription"
2. Or go to: `http://localhost:3000/dashboard/billing`

**Expected:**
- Billing page loads
- Shows current plan (likely "Free" or "Starter")
- Shows available plans with prices

**Status:** ☐ PASS / ☐ FAIL

---

### Test 8.2: View Pricing Plans

**Steps:**
1. On billing page, view the available plans
2. Note what plans are shown

**Expected:**
- Shows multiple tiers (Starter, Professional, Enterprise)
- Each has price in ZAR (R)
- Lists features for each plan

**Status:** ☐ PASS / ☐ FAIL

**Plans shown:** _______________________________________________

---

### Test 8.3: Access Pricing Page

**Steps:**
1. Go to: `http://localhost:3000/pricing`
2. Or click "Pricing" from homepage navigation (if available)

**Expected:**
- Pricing page loads
- Shows all plans with features
- Has "Get Started" buttons

**Status:** ☐ PASS / ☐ FAIL

---

### Test 8.4: Initiate Checkout (DO NOT COMPLETE)

**⚠️ IMPORTANT: Do NOT enter real payment information or complete purchase**

**Steps:**
1. On billing or pricing page, click "Subscribe" or "Get Started" on a paid plan
2. See what happens

**Expected:**
- Redirects to PayStack checkout page OR
- Shows checkout modal/form
- Don't proceed with actual payment

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP (if you prefer not to test)

---

## 🌍 PHASE 9: Internationalization (i18n)

### Test 9.1: Check Language Switcher

**Steps:**
1. Look for language switcher on the page (usually top right)
2. Check if it exists

**Expected:**
- Language switcher is visible
- Shows current language (probably English)

**Status:** ☐ PASS / ☐ FAIL / ☐ NOT FOUND

---

### Test 9.2: Switch to German (if available)

**Steps:**
1. Click language switcher
2. Select "Deutsch" or "German" (de)
3. Page should reload

**Expected:**
- Page content changes to German
- Navigation, buttons, labels in German
- Layout remains intact

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP (no German option)

---

### Test 9.3: Switch Back to English

**Steps:**
1. Use language switcher again
2. Select English

**Expected:**
- Content switches back to English
- No errors

**Status:** ☐ PASS / ☐ FAIL

---

## 🔧 PHASE 10: Edge Cases & Navigation

### Test 10.1: Delete Website

**Steps:**
1. Go to website list/dashboard
2. Find your test website
3. Look for "Delete" button or action
4. Click delete and confirm

**Expected:**
- Confirmation dialog appears
- Website is deleted after confirmation
- Removed from list

**Status:** ☐ PASS / ☐ FAIL

---

### Test 10.2: Create Second Website

**Steps:**
1. Add another website:
   - **Name:** Second Test Site
   - **URL:** https://github.com
   - **Description:** Testing multiple websites
2. Save it

**Expected:**
- Both websites appear in your dashboard
- You can switch between them

**Status:** ☐ PASS / ☐ FAIL

---

### Test 10.3: Test Navigation

**Steps:**
1. Click through all main navigation items:
   - Dashboard
   - Analytics
   - DSAR
   - Billing
2. For each, verify the page loads

**Expected:**
- All pages load without errors
- Navigation is responsive

**Status:** ☐ PASS / ☐ FAIL

---

### Test 10.4: Mobile Responsiveness (Optional)

**Steps:**
1. Press F12 to open Developer Tools
2. Click the device toolbar icon (phone/tablet icon)
3. Select "iPhone 12 Pro" or similar
4. Navigate through the app

**Expected:**
- Layout adjusts for mobile screen
- All features remain accessible
- No overlapping elements

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP

---

### Test 10.5: Browser Console Check

**Steps:**
1. Open browser console (F12 > Console tab)
2. Navigate through different pages
3. Look for red error messages

**Expected:**
- No critical errors in console
- Some warnings are okay
- App functions normally

**Status:** ☐ PASS / ☐ FAIL

**Errors found:** _______________________________________________

---

## 📝 TESTING SUMMARY

### Fill This Out After Completing All Tests:

**Total Tests Passed:** _____ / ~50

**Total Tests Failed:** _____

**Critical Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Minor Issues Found:**
1. _______________________________________________
2. _______________________________________________

**Features That Work Well:**
1. _______________________________________________
2. _______________________________________________

**Overall Assessment:**
☐ Ready for production (0-2 minor issues)
☐ Needs bug fixes (3-5 issues)
☐ Needs significant work (6+ issues)

---

## 🚀 Next Steps

**After completing this checklist:**

1. **Document all failures** - Create a list with:
   - Test number
   - What went wrong
   - Screenshots
   - Error messages

2. **Share with me** - Paste:
   - Your testing summary
   - List of failed tests
   - Any screenshots/error messages

3. **I will then:**
   - Fix each bug systematically
   - Test the fixes
   - Provide you with patched code
   - Re-test with you

**Ready to debug! 🔧**

---

## 📸 How to Report Issues

**For each failed test, provide:**

```
Test Number: X.X
Test Name: [Name]
What Happened: [Describe what you saw]
Error Message: [Copy-paste any error text]
Screenshot: [Attach or describe]
Browser: [Chrome/Firefox/Safari]
```

**Example:**
```
Test Number: 3.1
Test Name: Start Manual Scan
What Happened: Clicked "Scan" button, got spinning loader, then error message appeared
Error Message: "Failed to scan website: Connection timeout"
Screenshot: [attached]
Browser: Chrome
```

---

**Good luck with testing! You've got this! 🎉**

Any questions during testing? Just ask and I'll clarify.
