import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, LogIn, UserPlus } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcceptInviteButton } from "./accept-invite-button";

export const metadata: Metadata = {
  title: "Accept Invitation | ComplianceKit",
};

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="No invitation token provided. Check your email for the correct link." />;
  }

  // Look up the invite
  const member = await db.teamMember.findUnique({
    where: { inviteToken: token },
    include: { owner: { select: { name: true, email: true, companyName: true } } },
  });

  if (!member) {
    return <ErrorCard message="Invitation not found. It may have already been used or revoked." />;
  }

  if (member.status !== "pending") {
    return <ErrorCard message="This invitation has already been accepted or revoked." />;
  }

  const session = await auth();
  const roleLabel = member.role === "admin" ? "Admin" : "Viewer";
  const ownerDisplay = member.owner.companyName || member.owner.name || member.owner.email;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">You&apos;re invited</CardTitle>
          <CardDescription>
            <strong>{ownerDisplay}</strong> has invited you to join their ComplianceKit workspace
            as a <strong>{roleLabel}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium">What {roleLabel}s can do:</p>
            {member.role === "admin" ? (
              <ul className="text-muted-foreground space-y-0.5 text-xs list-disc list-inside">
                <li>Manage websites and run scans</li>
                <li>Generate and view privacy policies</li>
                <li>Handle data subject requests (DSARs)</li>
                <li>Configure cookie consent banners</li>
              </ul>
            ) : (
              <ul className="text-muted-foreground space-y-0.5 text-xs list-disc list-inside">
                <li>View websites, scans, and policies</li>
                <li>View data subject requests</li>
              </ul>
            )}
          </div>

          {session?.user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Accepting as <strong>{session.user.email}</strong>
              </p>
              <AcceptInviteButton token={token} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Sign in or create an account to accept this invitation.
              </p>
              <Button asChild className="w-full">
                <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`${appUrl}/accept-invite?token=${token}`)}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In to Accept
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/sign-up?callbackUrl=${encodeURIComponent(`${appUrl}/accept-invite?token=${token}`)}`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <XCircle className="h-14 w-14 text-destructive" />
          </div>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
