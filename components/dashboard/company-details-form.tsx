"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserCompanyDetails, type UserCompanyDetails } from "@/lib/actions/user";

interface CompanyDetailsFormProps {
  initialData: UserCompanyDetails;
}

export function CompanyDetailsForm({ initialData }: CompanyDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserCompanyDetails>(initialData);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUserCompanyDetails(formData);
      alert("Company details updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to update company details:", error);
      alert(`Failed to update: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(field: keyof UserCompanyDetails, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName || ""}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="e.g., Acme Corporation"
          />
          <p className="text-xs text-muted-foreground">
            Legal name of your company or organization
          </p>
        </div>

        {/* Company Email */}
        <div className="space-y-2">
          <Label htmlFor="companyEmail">Company Email</Label>
          <Input
            id="companyEmail"
            type="email"
            value={formData.companyEmail || ""}
            onChange={(e) => handleChange("companyEmail", e.target.value)}
            placeholder="e.g., contact@company.com"
          />
          <p className="text-xs text-muted-foreground">
            Primary email for data protection inquiries
          </p>
        </div>
      </div>

      {/* Company Address */}
      <div className="space-y-2">
        <Label htmlFor="companyAddress">Company Address</Label>
        <Textarea
          id="companyAddress"
          value={formData.companyAddress || ""}
          onChange={(e) => handleChange("companyAddress", e.target.value)}
          placeholder="e.g., 123 Main Street, City, Country, Postal Code"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Full registered address for legal correspondence
        </p>
      </div>

      {/* DPO Section */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="text-sm font-medium">Data Protection Officer (DPO)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Required if your organization processes large amounts of personal data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* DPO Name */}
          <div className="space-y-2">
            <Label htmlFor="dpoName">DPO Name</Label>
            <Input
              id="dpoName"
              value={formData.dpoName || ""}
              onChange={(e) => handleChange("dpoName", e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>

          {/* DPO Email */}
          <div className="space-y-2">
            <Label htmlFor="dpoEmail">DPO Email</Label>
            <Input
              id="dpoEmail"
              type="email"
              value={formData.dpoEmail || ""}
              onChange={(e) => handleChange("dpoEmail", e.target.value)}
              placeholder="e.g., dpo@company.com"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
