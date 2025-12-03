import { cn } from "@/lib/utils";

interface ComplianceScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ComplianceScore({
  score,
  size = "md",
  showLabel = true,
}: ComplianceScoreProps) {
  const { color, bgColor, label } = getScoreStyle(score);

  const sizeClasses = {
    sm: "h-12 w-12 text-lg",
    md: "h-20 w-20 text-2xl",
    lg: "h-28 w-28 text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-bold",
          sizeClasses[size],
          bgColor,
          color
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium", color)}>{label}</span>
      )}
    </div>
  );
}

function getScoreStyle(score: number) {
  if (score >= 80) {
    return {
      color: "text-green-600",
      bgColor: "bg-green-100",
      label: "Excellent",
    };
  } else if (score >= 60) {
    return {
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "Good",
    };
  } else if (score >= 40) {
    return {
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      label: "Fair",
    };
  } else {
    return {
      color: "text-red-600",
      bgColor: "bg-red-100",
      label: "Needs Work",
    };
  }
}

interface ScoreBreakdownProps {
  breakdown: {
    privacyPolicy: number;
    cookieBanner: number;
    cookieCategories: number;
    trackingDisclosure: number;
    penalties: number;
  };
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const items = [
    { label: "Privacy Policy", value: breakdown.privacyPolicy, max: 25 },
    { label: "Cookie Banner", value: breakdown.cookieBanner, max: 25 },
    { label: "Cookie Categories", value: breakdown.cookieCategories, max: 25 },
    { label: "Tracking Disclosure", value: breakdown.trackingDisclosure, max: 25 },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.label}</span>
            <span className="font-medium">
              {item.value}/{item.max}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(item.value / item.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {breakdown.penalties > 0 && (
        <div className="flex justify-between text-sm text-red-600">
          <span>Penalties</span>
          <span className="font-medium">-{breakdown.penalties}</span>
        </div>
      )}
    </div>
  );
}



