import Link from "next/link";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WebsiteNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Globe className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Website Not Found</h2>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        The website you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/websites">Back to Websites</Link>
      </Button>
    </div>
  );
}

