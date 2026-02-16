"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestAccountDeletion } from "@/lib/actions/user";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  userEmail,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const result = await requestAccountDeletion(reason || undefined);

      if (result.success) {
        toast.success("Account deletion scheduled", {
          description: "You will receive a confirmation email shortly.",
        });
        
        // Close dialog
        onOpenChange(false);
        
        // Redirect to sign in after a short delay (user is logged out)
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        toast.error(result.error || "Failed to schedule account deletion");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                This action will schedule your account for permanent deletion.
              </p>
              
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-4 space-y-2">
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  ⚠️ 30-Day Grace Period
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Your account will be deactivated immediately, but you have <strong>30 days</strong> to 
                  change your mind by contacting support. After 30 days, your data will be permanently deleted.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground">What will be deleted:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• All personal information (name, email, profile)</li>
                  <li>• All your websites and scans</li>
                  <li>• All generated policies and documents</li>
                  <li>• All cookie consent records</li>
                  <li>• All DSAR requests</li>
                  <li>• Your active subscription (cancelled immediately)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground">What will be retained (anonymized):</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Billing records and invoices (required by tax law - 7 years)</li>
                  <li>• These records will be anonymized (no personal information)</li>
                </ul>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>💾 Data Export:</strong> We recommend exporting your data before deletion. 
                  You can do this from the Settings page before confirming deletion.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for leaving (optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Help us improve by telling us why you're leaving..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isDeleting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-destructive">
                  Type <strong>DELETE</strong> to confirm
                </Label>
                <Input
                  id="confirm"
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isDeleting}
                  className="font-mono"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                A confirmation email will be sent to: <strong>{userEmail}</strong>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting || confirmText !== "DELETE"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete My Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
