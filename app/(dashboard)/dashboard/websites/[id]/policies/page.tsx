import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { getWebsite } from "@/lib/actions/website";
import { getPolicies, getCompanyInfo } from "@/lib/actions/policy";
import { CompanyInfoForm } from "@/components/dashboard/company-info-form";
import { PolicyGenerator } from "@/components/dashboard/policy-generator";
import { PolicyList } from "@/components/dashboard/policy-list";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface PoliciesPageProps {
  params: Promise<{ id: string }>;
}

export default async function PoliciesPage({ params }: PoliciesPageProps) {
  const { id } = await params;
  
  const website = await getWebsite(id);

  if (!website) {
    notFound();
  }

  const [companyInfo, policies] = await Promise.all([
    getCompanyInfo(id),
    getPolicies(id),
  ]);

  // Check if there's scan data
  const session = await auth();
  const latestScan = await db.scan.findFirst({
    where: {
      websiteId: id,
      status: "completed",
      website: {
        userId: session?.user?.id,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasCompanyInfo = Boolean(
    companyInfo?.companyName && 
    companyInfo?.companyAddress && 
    companyInfo?.companyEmail
  );

  const hasScanData = Boolean(latestScan);

  // Get existing active policies
  const activePrivacyPolicy = policies.find(
    (p) => p.type === "privacy_policy" && p.isActive
  );
  const activeCookiePolicy = policies.find(
    (p) => p.type === "cookie_policy" && p.isActive
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <FileText className="h-4 w-4" />
          <span>Legal Documents</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Policies for {website.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate GDPR-compliant privacy and cookie policies for your website.
        </p>
      </div>

      {/* Company Information Form */}
      <CompanyInfoForm websiteId={id} initialData={companyInfo} />

      {/* Policy Generator */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Generate Policies</h2>
        <PolicyGenerator
          websiteId={id}
          hasCompanyInfo={hasCompanyInfo}
          hasScanData={hasScanData}
          existingPolicies={{
            privacyPolicy: activePrivacyPolicy
              ? {
                  id: activePrivacyPolicy.id,
                  version: activePrivacyPolicy.version,
                  generatedAt: activePrivacyPolicy.generatedAt,
                }
              : undefined,
            cookiePolicy: activeCookiePolicy
              ? {
                  id: activeCookiePolicy.id,
                  version: activeCookiePolicy.version,
                  generatedAt: activeCookiePolicy.generatedAt,
                }
              : undefined,
          }}
        />
      </div>

      {/* Policy History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Policy History</h2>
        <PolicyList policies={policies} websiteId={id} />
      </div>
    </div>
  );
}

