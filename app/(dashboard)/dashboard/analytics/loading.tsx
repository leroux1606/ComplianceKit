import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>

      {/* Date Range and Export */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[320px]" />
        <Skeleton className="h-[320px] md:col-span-2" />
      </div>

      {/* Consent Analytics */}
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>

      <Skeleton className="h-[350px]" />

      {/* Scan Analytics */}
      <Skeleton className="h-6 w-36" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>

      {/* DSAR Analytics */}
      <Skeleton className="h-6 w-36" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    </div>
  );
}

