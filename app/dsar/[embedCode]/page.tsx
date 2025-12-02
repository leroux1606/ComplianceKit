import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { db } from "@/lib/db";
import { DsarSubmissionForm } from "@/components/dsar/dsar-submission-form";

interface DsarPageProps {
  params: Promise<{ embedCode: string }>;
}

export async function generateMetadata({ params }: DsarPageProps): Promise<Metadata> {
  const { embedCode } = await params;
  
  const website = await db.website.findUnique({
    where: { embedCode },
    select: { name: true, companyName: true },
  });

  if (!website) {
    return { title: "Data Subject Request" };
  }

  return {
    title: `Data Subject Request | ${website.companyName || website.name}`,
    description: "Submit a data subject access request to exercise your GDPR rights",
  };
}

export default async function DsarPage({ params }: DsarPageProps) {
  const { embedCode } = await params;

  const website = await db.website.findUnique({
    where: { embedCode },
    select: {
      name: true,
      companyName: true,
      companyEmail: true,
      dpoEmail: true,
    },
  });

  if (!website) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">
                {website.companyName || website.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Data Subject Request Portal
              </p>
            </div>
            <Link 
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Powered by ComplianceKit
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <DsarSubmissionForm
          embedCode={embedCode}
          companyName={website.companyName || undefined}
          contactEmail={website.dpoEmail || website.companyEmail || undefined}
        />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            This form is provided to help you exercise your rights under the 
            General Data Protection Regulation (GDPR).
          </p>
        </div>
      </footer>
    </div>
  );
}

