# Quick Setup Guide - Account Deletion Feature

## What Was Implemented

A complete GDPR-compliant account deletion system that allows users to:
- Export all their data (JSON format)
- Request account deletion with 30-day grace period
- Receive email confirmation
- Automatic processing after 30 days (via cron job)

**Key Benefit for Compliance:** Properly handles GDPR Article 17 (Right to Erasure) while maintaining legal retention requirements for tax records (7 years, anonymized).

---

## Setup Steps (Required)

### 1. Update Your Database

Run the Prisma migration to add the new fields:

```bash
# Generate Prisma client with new schema
pnpm db:generate

# Push changes to database (recommended for development)
pnpm db:push

# OR create a migration (recommended for production)
pnpm db:migrate
```

This adds three fields to the `users` table:
- `deletedAt` - Timestamp when deletion was requested
- `anonymizedAt` - Timestamp when data was anonymized
- `deletionReason` - User's reason for leaving

### 2. Add Cron Secret to Environment

Generate a secure secret:

```bash
openssl rand -base64 32
```

Add to `.env.local`:

```env
CRON_SECRET=paste-the-generated-secret-here
```

**Important:** Add the same `CRON_SECRET` to your production environment (Vercel, etc.)

### 3. Configure Automated Processing (Choose One)

#### Option A: Vercel Cron (Recommended if using Vercel)

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-account-deletions",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs daily at 2 AM UTC. Deploy to Vercel and it will automatically register the cron job.

#### Option B: Manual Testing / External Cron

You can call the endpoint manually or via an external cron service:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/process-account-deletions
```

For production, replace with your domain.

---

## How to Test

### 1. Test Data Export

1. Go to **Dashboard → Settings**
2. Scroll to "Your Data & Privacy Rights"
3. Click **"Export My Data"**
4. Verify a JSON file downloads with your data

### 2. Test Account Deletion Request

1. Go to **Dashboard → Settings**
2. Scroll to "Danger Zone"
3. Click **"Delete My Account"**
4. Read the dialog, optionally provide a reason
5. Type `DELETE` to confirm
6. Check terminal for email log (in development mode)
7. You should be logged out immediately

### 3. Test Cron Job (Manual)

```bash
# Run the cron endpoint manually
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/process-account-deletions
```

To test with a real deletion, you need to manually set `deletedAt` to 31+ days ago in the database, or wait 30 days.

**Quick test SQL:**
```sql
-- Mark a test user for deletion 31 days ago
UPDATE users 
SET "deletedAt" = NOW() - INTERVAL '31 days'
WHERE email = 'test@example.com';

-- Then run the cron job manually (it should process this user)
```

---

## Where to Find Things

### UI Components
- **Settings Page:** `app/(dashboard)/dashboard/settings/page.tsx`
- **Delete Dialog:** `components/dashboard/delete-account-dialog.tsx`
- **Export Button:** `components/dashboard/export-data-button.tsx`
- **Account Section:** `components/dashboard/account-deletion-section.tsx`

### Server Logic
- **User Actions:** `lib/actions/user.ts` (export, delete, anonymize)
- **Email:** `lib/email.ts` (deletion confirmation email)
- **Cron API:** `app/api/cron/process-account-deletions/route.ts`

### Documentation
- **Cron Setup:** `ACCOUNT-DELETION-CRON.md` (detailed cron configuration)
- **Summary:** `ACCOUNT-DELETION-SUMMARY.md` (implementation overview)
- **This Guide:** `ACCOUNT-DELETION-SETUP.md`

### Database
- **Schema:** `prisma/schema.prisma` (User model updated)

---

## What Happens When User Deletes Account

### Immediately:
1. Account marked with `deletedAt` timestamp
2. All sessions revoked (user logged out)
3. Subscription cancelled
4. Confirmation email sent

### After 30 Days (Automated):
1. Cron job finds accounts with `deletedAt` ≥ 30 days old
2. **If user has billing history:**
   - Anonymize: Replace email/name with random strings
   - Keep invoices (tax law - 7 years)
   - Delete all other data
3. **If no billing history:**
   - Fully delete entire user record
   - No anonymization needed

---

## GDPR Compliance Summary

✅ **Article 15 - Right of Access:**  
Users can export all their data via "Export My Data" button

✅ **Article 17 - Right to Erasure:**  
Users can delete their account with 30-day grace period

✅ **Article 20 - Data Portability:**  
Exported data is in machine-readable JSON format

✅ **Legal Retention:**  
Billing records anonymized and retained for 7 years (tax law requirement)

---

## Production Checklist

Before deploying to production:

- [ ] Database migration applied (`pnpm db:push` or `pnpm db:migrate`)
- [ ] `CRON_SECRET` set in production environment
- [ ] Cron job configured (Vercel cron or external service)
- [ ] Tested data export functionality
- [ ] Tested account deletion flow
- [ ] Tested cron job manually
- [ ] Updated Privacy Policy to mention account deletion
- [ ] Updated Terms of Service if needed
- [ ] Set up monitoring/alerts for cron job failures

---

## Need Help?

- See `ACCOUNT-DELETION-CRON.md` for detailed cron configuration options
- See `ACCOUNT-DELETION-SUMMARY.md` for implementation details
- Check terminal logs for errors during testing

---

## Example Email (Development Mode)

When a user requests deletion, you'll see this in your terminal:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: user@example.com
Subject: ⚠️ Account Deletion Scheduled - ComplianceKit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Account Deletion Requested

Hi there,

Your ComplianceKit account has been scheduled for deletion...
[full email content]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

In production with `RESEND_API_KEY` set, real emails will be sent.

---

## That's It!

The account deletion feature is fully implemented and ready to use. Just run the database migration and set up the cron job, and you're good to go! 🎉
