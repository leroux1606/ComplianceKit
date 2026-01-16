"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { exportUserData, deleteUserAccount, updateUserProfile, updateUserEmail, updateUserPassword } from "@/lib/actions/user";
import { Download, Trash2, Shield, AlertTriangle, User as UserIcon, Mail, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  // GDPR Actions State
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  // Profile Update State
  const [name, setName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Email Update State
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load user data from session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  /**
   * Export user data (GDPR Data Portability)
   */
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportUserData();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success && result.data) {
        // Convert data to JSON and trigger download
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `compliancekit-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Data exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Delete user account (GDPR Right to Erasure)
   */
  const handleDeleteAccount = async () => {
    if (!confirmEmail.trim()) {
      toast.error("Please enter your email to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(confirmEmail);

      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
        return;
      }

      if (result.success) {
        toast.success(result.message || "Account deleted successfully");

        // Sign out and redirect to home
        setTimeout(async () => {
          await signOut({ redirect: false });
          router.push("/?deleted=true");
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to delete account");
      console.error(error);
      setIsDeleting(false);
    }
  };

  /**
   * Update profile (name)
   */
  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const result = await updateUserProfile({ name });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
        // Update session with new name
        await updateSession();
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * Update email
   */
  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter a new email");
      return;
    }

    if (!emailPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const result = await updateUserEmail(newEmail, emailPassword);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.message || "Email updated successfully");
        setNewEmail("");
        setEmailPassword("");
        // Update session
        await updateSession();
        // Force sign out for security (email changed)
        setTimeout(async () => {
          toast.info("Please sign in again with your new email");
          await signOut({ redirect: false });
          router.push("/auth/signin");
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to update email");
      console.error(error);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  /**
   * Update password
   */
  const handleUpdatePassword = async () => {
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await updateUserPassword(currentPassword, newPassword);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.message || "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("Failed to update password");
      console.error(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and privacy preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Name */}
          <div className="space-y-3">
            <Label htmlFor="name">Display Name</Label>
            <div className="flex gap-3">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1"
              />
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile || !name.trim() || name === session?.user?.name}
              >
                {isUpdatingProfile ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is the name that will be displayed throughout the application.
            </p>
          </div>

          <Separator />

          {/* Current Email */}
          <div className="space-y-3">
            <Label>Current Email</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{session?.user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Account Security</CardTitle>
          </div>
          <CardDescription>
            Manage your email and password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Email */}
          <div className="space-y-3">
            <h3 className="font-medium">Change Email Address</h3>
            <p className="text-sm text-muted-foreground">
              Update your email address. You'll need to verify your new email.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="newEmail">New Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@email.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="emailPassword">Current Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={handleUpdateEmail}
                disabled={isUpdatingEmail || !newEmail.trim() || !emailPassword.trim()}
                variant="outline"
              >
                {isUpdatingEmail ? "Updating..." : "Update Email"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Update Password */}
          <div className="space-y-3">
            <h3 className="font-medium">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Update your password. Must be at least 8 characters with uppercase, lowercase, and numbers.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 characters)"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                disabled={
                  isUpdatingPassword ||
                  !currentPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
                variant="outline"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy & GDPR Rights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Data Privacy & GDPR Rights</CardTitle>
          </div>
          <CardDescription>
            Exercise your rights under the General Data Protection Regulation (GDPR)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Data */}
          <div className="flex items-start justify-between border-b pb-6">
            <div className="space-y-1 flex-1">
              <h3 className="font-medium">Export Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your personal data in JSON format. This includes your account information, websites, scans, policies, and more.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>GDPR Right:</strong> Article 20 - Right to Data Portability
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
              className="ml-4"
            >
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-medium flex items-center gap-2">
                Delete Your Account
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>GDPR Right:</strong> Article 17 - Right to Erasure ("Right to be Forgotten")
              </p>
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-xs text-destructive-foreground font-medium">
                  ⚠️ This will permanently delete:
                </p>
                <ul className="text-xs text-destructive-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Your account and profile</li>
                  <li>All websites and scan data</li>
                  <li>Generated policies and configurations</li>
                  <li>Consent records</li>
                  <li>DSAR requests (retained for 30 days for legal compliance)</li>
                  <li>Billing and subscription information</li>
                </ul>
              </div>
            </div>
            <div className="ml-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        This action <strong>cannot be undone</strong>. This will permanently delete your account and remove all your data from our servers.
                      </p>
                      <div className="pt-4">
                        <Label htmlFor="confirmEmail">
                          Type your email address to confirm:
                        </Label>
                        <Input
                          id="confirmEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmEmail("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rights Under GDPR</CardTitle>
          <CardDescription>
            Learn more about your data protection rights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3">
            <div>
              <p className="font-medium">✅ Right of Access</p>
              <p className="text-muted-foreground text-xs">
                You can request access to your personal data at any time using the export function above.
              </p>
            </div>
            <div>
              <p className="font-medium">✅ Right to Rectification</p>
              <p className="text-muted-foreground text-xs">
                You can update your account information in the Profile and Security sections above.
              </p>
            </div>
            <div>
              <p className="font-medium">✅ Right to Erasure</p>
              <p className="text-muted-foreground text-xs">
                You can delete your account and all data at any time using the delete function above.
              </p>
            </div>
            <div>
              <p className="font-medium">✅ Right to Data Portability</p>
              <p className="text-muted-foreground text-xs">
                You can export your data in machine-readable JSON format.
              </p>
            </div>
            <div>
              <p className="font-medium">✅ Right to Object</p>
              <p className="text-muted-foreground text-xs">
                You can object to processing of your data. Contact us at privacy@compliancekit.com.
              </p>
            </div>
            <div>
              <p className="font-medium">✅ Right to Lodge a Complaint</p>
              <p className="text-muted-foreground text-xs">
                You can lodge a complaint with your local data protection authority if you believe your rights have been violated.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              For questions about your data or privacy, please contact us at{" "}
              <a href="mailto:privacy@compliancekit.com" className="text-primary hover:underline">
                privacy@compliancekit.com
              </a>
              . We will respond within 30 days as required by GDPR.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
