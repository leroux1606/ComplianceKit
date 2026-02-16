# Account Deletion Scheduled Job

This document describes the scheduled job (cron) that processes account deletions after the 30-day grace period.

## Overview

When a user requests account deletion via the Settings page:
1. Their account is marked with `deletedAt` timestamp (soft delete)
2. They are immediately logged out (all sessions revoked)
3. Their subscription is cancelled immediately
4. They receive a confirmation email
5. **They have 30 days to cancel** by contacting support

After 30 days, a scheduled job should run to **permanently delete or anonymize** their data.

---

## Implementation Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployment)

Create a cron API route:

**File:** `app/api/cron/process-account-deletions/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permanentlyDeleteUser } from "@/lib/actions/user";

/**
 * Cron job to process account deletions after 30-day grace period
 * This should run daily
 * 
 * Vercel Cron: Configure in vercel.json
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all users marked for deletion where grace period has passed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersToDelete = await db.user.findMany({
      where: {
        deletedAt: {
          lte: thirtyDaysAgo,
        },
        anonymizedAt: null, // Not already processed
      },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    console.log(`Found ${usersToDelete.length} users to process`);

    const results = {
      processed: 0,
      anonymized: 0,
      deleted: 0,
      errors: 0,
    };

    // Process each user
    for (const user of usersToDelete) {
      try {
        const result = await permanentlyDeleteUser(user.id);
        
        if (result.success) {
          results.processed++;
          if (result.anonymized) {
            results.anonymized++;
            console.log(`Anonymized user: ${user.id}`);
          } else {
            results.deleted++;
            console.log(`Deleted user: ${user.id}`);
          }
        } else {
          results.errors++;
          console.error(`Failed to process user ${user.id}:`, result.error);
        }
      } catch (error) {
        results.errors++;
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account deletion processing complete",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Configure Vercel Cron:**

Add to `vercel.json`:

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

**Add environment variable:**

```env
CRON_SECRET=your-secret-key-here
```

Generate a secret:
```bash
openssl rand -base64 32
```

---

### Option 2: GitHub Actions (For GitHub-hosted projects)

Create `.github/workflows/process-deletions.yml`:

```yaml
name: Process Account Deletions

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  process-deletions:
    runs-on: ubuntu-latest
    
    steps:
      - name: Call Cron Endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            ${{ secrets.APP_URL }}/api/cron/process-account-deletions
```

Add secrets to your GitHub repository:
- `CRON_SECRET`: Same as in your `.env`
- `APP_URL`: Your production URL (e.g., https://compliancekit.app)

---

### Option 3: External Cron Service (EasyCron, cron-job.org, etc.)

1. Deploy the API route from Option 1
2. Sign up for a cron service (e.g., https://www.easycron.com/)
3. Configure:
   - **URL:** `https://yourdomain.com/api/cron/process-account-deletions`
   - **Method:** GET
   - **Schedule:** Daily at 2 AM
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`

---

## Testing the Cron Job

### Manual Testing

You can manually trigger the cron job:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/process-account-deletions
```

Or in production:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/process-account-deletions
```

### Test User Creation

To test the deletion flow without waiting 30 days:

```sql
-- In your database, manually set deletedAt to 31 days ago
UPDATE users 
SET "deletedAt" = NOW() - INTERVAL '31 days',
    "deletionReason" = 'Test deletion'
WHERE email = 'test@example.com';
```

Then run the cron job manually to verify it processes the user.

---

## Monitoring & Alerts

### Logging

The cron job logs all actions:
- Number of users found
- Each user processed (anonymized or deleted)
- Any errors

View logs in:
- **Vercel:** Dashboard → Deployments → Function logs
- **GitHub Actions:** Actions tab → Workflow runs

### Recommended Monitoring

1. **Set up alerts** for cron job failures
2. **Monitor execution time** (should complete quickly)
3. **Track metrics:**
   - Users processed per day
   - Anonymized vs. fully deleted
   - Error rate

### Error Handling

The cron job:
- ✅ Continues processing even if one user fails
- ✅ Logs all errors for review
- ✅ Returns success with error count
- ✅ Doesn't retry failed users (prevents infinite loops)

If a user fails to process:
1. Review the error logs
2. Fix the issue (e.g., database constraint)
3. The cron will retry them the next day (they'll still match the query)

---

## GDPR Compliance Notes

### Right to Erasure (Article 17)

✅ **30-day grace period:** Gives users time to change their mind
✅ **Complete deletion:** All PII is removed after grace period
✅ **Legal retention:** Billing records anonymized but retained (tax law - 7 years)
✅ **Audit trail:** Deletion is logged for compliance

### What is Deleted vs. Retained

**Deleted:**
- Name, email, password, profile picture
- All OAuth accounts
- All sessions
- All websites and scans
- All generated policies
- All cookie consent records
- All DSAR requests
- All user-created content

**Retained (Anonymized):**
- Invoices (required by tax law - 7 years)
- Subscription records (linked to anonymized user)
- These records have NO personal information

**Full Deletion:**
- If the user has NO billing history, the entire account is deleted
- No anonymization needed

---

## Deployment Checklist

- [ ] Create the API route (`app/api/cron/process-account-deletions/route.ts`)
- [ ] Generate and set `CRON_SECRET` environment variable
- [ ] Configure cron schedule (Vercel cron / GitHub Actions / External service)
- [ ] Test manually with a test account
- [ ] Monitor first few runs in production
- [ ] Set up alerts for failures
- [ ] Document the cron schedule in your operations manual

---

## Schedule Recommendation

**Daily at 2 AM UTC** is recommended:
- Low traffic time
- Consistent daily processing
- Not too frequent (once per day is sufficient)

You can adjust based on your needs, but **at least once per day** is recommended to ensure timely compliance with user requests.

---

## Support Contact

If a user contacts support to cancel their deletion:

1. Verify their identity
2. Use the `cancelAccountDeletion()` function (if within 30 days)
3. Or manually update the database:
   ```sql
   UPDATE users 
   SET "deletedAt" = NULL, "deletionReason" = NULL
   WHERE id = 'user-id';
   ```
4. Inform the user their account has been restored
5. They can now log in again

---

## Summary

The account deletion system is **fully GDPR-compliant** and handles:
- ✅ User-requested deletion (Article 17)
- ✅ 30-day grace period
- ✅ Legal data retention (anonymized)
- ✅ Complete PII removal
- ✅ Audit trail
- ✅ Email notifications

The scheduled job ensures deletions are processed automatically and reliably.
