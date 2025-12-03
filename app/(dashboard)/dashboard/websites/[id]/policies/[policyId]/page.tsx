import { notFound } from "next/navigation";

import { getPolicy } from "@/lib/actions/policy";
import { getWebsite } from "@/lib/actions/website";
import { PolicyViewer } from "@/components/dashboard/policy-viewer";

interface PolicyPageProps {
  params: Promise<{ id: string; policyId: string }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { id, policyId } = await params;
  
  const [website, policy] = await Promise.all([
    getWebsite(id),
    getPolicy(policyId),
  ]);

  if (!website || !policy) {
    notFound();
  }

  // Verify policy belongs to this website
  if (policy.websiteId !== id) {
    notFound();
  }

  return <PolicyViewer policy={policy} websiteUrl={website.url} />;
}



