"use client";

import { useState } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { ExportDataButton } from "./export-data-button";

interface AccountDeletionSectionProps {
  userEmail: string;
}

export function AccountDeletionSection({ userEmail }: AccountDeletionSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      {/* Data Privacy & Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data & Privacy Rights</CardTitle>
          <CardDescription>
            GDPR Article 15 (Right of Access) & Article 20 (Data Portability)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Export Your Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Download a complete copy of all your personal data stored in ComplianceKit. 
              This includes your account information, websites, scans, policies, and more in 
              a machine-readable JSON format.
            </p>
            <ExportDataButton />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Delete Your Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your ComplianceKit account and all associated data. 
                This action complies with GDPR Article 17 (Right to Erasure / Right to be Forgotten).
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-4 space-y-2">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                What you should know:
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                <li>• Your account will be deactivated immediately</li>
                <li>• You have 30 days to cancel by contacting support</li>
                <li>• After 30 days, all your data will be permanently deleted</li>
                <li>• Billing records will be anonymized (required by law for 7 years)</li>
                <li>• We recommend exporting your data first (button above)</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        userEmail={userEmail}
      />
    </>
  );
}
