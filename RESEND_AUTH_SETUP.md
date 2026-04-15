# ComplianceKit — Add Resend Magic Link Authentication

*Reference implementation: AccessKit `src/lib/auth.ts`*

---

## What This Adds

A passwordless **magic link** sign-in option alongside the existing email/password and Google OAuth.  
User enters their email → receives a link → clicks it → logged in. No password needed.

Benefits:
- No password to forget or reset
- Lower friction for new signups
- Same Resend account already used by AccessKit

---

## Prerequisites

- Resend account with API key (same one as AccessKit)
- `resend` npm package installed
- `EMAIL_FROM` env var set

---

## Step 1 — Install Resend provider

```bash
pnpm add resend
```

Check if already in `package.json` — if not, install it.

---

## Step 2 — Add environment variables

Add to `.env`:

```env
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=onboarding@resend.dev
```

> Use `onboarding@resend.dev` for development (no domain verification needed).  
> Switch to `noreply@compliancekit.app` after verifying the domain in Resend.

---

## Step 3 — Update `lib/auth.ts`

Add the Resend provider alongside the existing Google and Credentials providers:

```typescript
import Resend from "next-auth/providers/resend";

// Inside the providers array, add:
Resend({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
  async sendVerificationRequest({ identifier, url }) {
    // Always log to console for local dev (works without email delivery)
    console.log("\n========================================");
    console.log("🔗 MAGIC LINK FOR:", identifier);
    console.log(url);
    console.log("========================================\n");

    // Send real email
    try {
      const { Resend: ResendClient } = await import("resend");
      const resend = new ResendClient(process.env.RESEND_API_KEY ?? "");
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: identifier,
        subject: "Sign in to ComplianceKit",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
            <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Sign in to ComplianceKit</h2>
            <p style="color:#6b7280;margin-bottom:24px">Click the button below to sign in. This link expires in 24 hours.</p>
            <a href="${url}"
               style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
              Sign in
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">
              If you didn't request this, you can ignore this email.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Email send failed (use console link above):", err);
    }
  },
}),
```

Full `providers` array after change:

```typescript
providers: [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  Resend({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    async sendVerificationRequest({ identifier, url }) {
      // ... (code above)
    },
  }),
  Credentials({
    // ... existing credentials provider unchanged
  }),
],
```

---

## Step 4 — Add magic link UI to login page

Find the login page (likely `app/(auth)/login/page.tsx` or similar).

Add a magic link form section alongside the existing email/password form:

```tsx
"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await signIn("resend", {
        email,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.ok) setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="text-center p-4 rounded-lg border">
        <p className="font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground mt-1">
          Magic link sent to <strong>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending || !email}
        className="w-full rounded-lg bg-primary text-white py-2 text-sm font-medium"
      >
        {isPending ? "Sending..." : "Send magic link"}
      </button>
    </form>
  );
}
```

Add a divider and the `<MagicLinkForm />` component below the existing login form.

---

## Step 5 — Add VerificationToken model (if missing)

Check `prisma/schema.prisma` — the `VerificationToken` model must exist for magic links to work:

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

If it's missing, add it and run:

```bash
pnpm db:push
```

---

## Step 6 — Add verify-request page (optional but recommended)

Create `app/(auth)/verify-request/page.tsx`:

```tsx
export default function VerifyRequestPage() {
  return (
    <div className="text-center space-y-3">
      <h1 className="text-xl font-bold">Check your email</h1>
      <p className="text-muted-foreground text-sm">
        A magic link has been sent. Click it to sign in.
      </p>
    </div>
  );
}
```

Add to auth config pages:
```typescript
pages: {
  signIn: "/login",
  verifyRequest: "/verify-request",
  error: "/login",
}
```

---

## Step 7 — Test locally

1. Start dev server: `pnpm dev`
2. Go to login page
3. Enter your email (`jan.leroux0@gmail.com` — only address that works without domain verification)
4. Click Send magic link
5. Check CMD window for the magic link URL (printed to console)
6. Paste URL in browser → logged in

---

## Notes

- Magic link works **alongside** existing email/password login — users choose
- In production, verify your domain in Resend so any email address works
- The same Resend API key from AccessKit works here — same account, different `from` address
- AccessKit reference: `src/lib/auth.ts` — copy the `sendVerificationRequest` function exactly
