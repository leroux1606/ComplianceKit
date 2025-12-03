// Analytics Types

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ComplianceScoreTrend {
  date: string;
  score: number;
  websiteName?: string;
}

export interface ConsentMetrics {
  total: number;
  acceptedAll: number;
  rejectedAll: number;
  partial: number;
  acceptanceRate: number;
  byCategory: {
    analytics: number;
    marketing: number;
    functional: number;
  };
}

export interface ConsentTrend {
  date: string;
  total: number;
  acceptedAll: number;
  rejectedAll: number;
  partial: number;
}

export interface ScanMetrics {
  totalScans: number;
  averageScore: number;
  cookiesFound: number;
  scriptsFound: number;
  findingsCount: number;
  findingsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface CookieDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface ScriptDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface DsarMetrics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
  overdue: number;
  averageResponseTime: number; // in days
  byType: {
    access: number;
    erasure: number;
    rectification: number;
    portability: number;
    restriction: number;
    objection: number;
  };
}

export interface DsarTrend {
  date: string;
  submitted: number;
  completed: number;
}

export interface OverallAnalytics {
  complianceScore: number;
  complianceScoreTrend: ComplianceScoreTrend[];
  consentMetrics: ConsentMetrics;
  consentTrend: ConsentTrend[];
  scanMetrics: ScanMetrics;
  cookieDistribution: CookieDistribution[];
  scriptDistribution: ScriptDistribution[];
  dsarMetrics: DsarMetrics;
  dsarTrend: DsarTrend[];
}

export interface WebsiteAnalytics {
  websiteId: string;
  websiteName: string;
  complianceScore: number;
  complianceScoreTrend: ComplianceScoreTrend[];
  consentMetrics: ConsentMetrics;
  consentTrend: ConsentTrend[];
  scanMetrics: ScanMetrics;
  cookieDistribution: CookieDistribution[];
  scriptDistribution: ScriptDistribution[];
  lastScanDate: Date | null;
}

export type DateRange = "7d" | "30d" | "90d" | "1y" | "all";

export interface AnalyticsFilter {
  dateRange: DateRange;
  websiteId?: string;
}

// Helper to get date range
export function getDateRangeStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.setDate(now.getDate() - 7));
    case "30d":
      return new Date(now.setDate(now.getDate() - 30));
    case "90d":
      return new Date(now.setDate(now.getDate() - 90));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "all":
      return new Date(0);
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
}

// Helper to format date for grouping
export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to generate date range array
export function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

