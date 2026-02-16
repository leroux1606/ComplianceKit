import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyDetailsForm } from "@/components/dashboard/company-details-form";
import { getUserCompanyDetails } from "@/lib/actions/user";
import { AccountDeletionSection } from "@/components/dashboard/account-deletion-section";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings | ComplianceKit",
  description: "Manage your account and company settings",
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  const companyDetails = await getUserCompanyDetails();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and company information
        </p>
      </div>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            This information will be used when generating privacy policies and cookie policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyDetailsForm initialData={companyDetails || {}} />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How This Information is Used</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • <strong>Company Name:</strong> Used in policy headers and legal sections
          </p>
          <p>
            • <strong>Company Address:</strong> Included in contact information sections
          </p>
          <p>
            • <strong>Company Email:</strong> Primary contact for data protection inquiries
          </p>
          <p>
            • <strong>DPO Name & Email:</strong> Data Protection Officer contact information (required for GDPR compliance if applicable)
          </p>
          <p className="pt-2 text-xs">
            <strong>Note:</strong> These details are optional but recommended for generating accurate, professional policies.
          </p>
        </CardContent>
      </Card>

      {/* Account Deletion Section */}
      <AccountDeletionSection userEmail={session.user.email!} />
    </div>
  );
}
