import Link from "next/link";
import { FileX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DsarNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <FileX className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The data subject request you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <Button asChild>
        <Link href="/dashboard/dsar">Back to DSAR Management</Link>
      </Button>
    </div>
  );
}



