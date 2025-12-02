import { WebsiteCard } from "@/components/dashboard/website-card";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Website {
  id: string;
  name: string;
  url: string;
  description: string | null;
  status: string;
  lastScanAt: Date | null;
  createdAt: Date;
  _count: {
    scans: number;
    policies: number;
  };
}

interface WebsiteListProps {
  websites: Website[];
}

export function WebsiteList({ websites }: WebsiteListProps) {
  if (websites.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {websites.map((website) => (
        <WebsiteCard key={website.id} website={website} />
      ))}
    </div>
  );
}

