"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  type OverallAnalytics,
  type WebsiteAnalytics,
  type ConsentMetrics,
  type ConsentTrend,
  type ScanMetrics,
  type CookieDistribution,
  type ScriptDistribution,
  type DsarMetrics,
  type DsarTrend,
  type ComplianceScoreTrend,
  type DateRange,
  getDateRangeStart,
  formatDateKey,
  generateDateRange,
} from "@/lib/analytics/types";
import type { ConsentPreferences } from "@/lib/actions/consent";

/**
 * Get overall analytics for all user's websites
 */
export async function getOverallAnalytics(
  dateRange: DateRange = "30d"
): Promise<OverallAnalytics> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const startDate = getDateRangeStart(dateRange);
  const endDate = new Date();

  // Get all user's websites
  const websites = await db.website.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  const websiteIds = websites.map((w) => w.id);

  // Parallel fetch all analytics data
  const [
    complianceData,
    consentData,
    scanData,
    cookieData,
    scriptData,
    dsarData,
  ] = await Promise.all([
    getComplianceScoreData(websiteIds, startDate),
    getConsentData(websiteIds, startDate),
    getScanData(websiteIds, startDate),
    getCookieDistributionData(websiteIds, startDate),
    getScriptDistributionData(websiteIds, startDate),
    getDsarData(websiteIds, startDate),
  ]);

  // Calculate overall compliance score (average of latest scans)
  const overallScore =
    complianceData.latestScores.length > 0
      ? Math.round(
          complianceData.latestScores.reduce((a, b) => a + b, 0) /
            complianceData.latestScores.length
        )
      : 0;

  return {
    complianceScore: overallScore,
    complianceScoreTrend: complianceData.trend,
    consentMetrics: consentData.metrics,
    consentTrend: consentData.trend,
    scanMetrics: scanData.metrics,
    cookieDistribution: cookieData,
    scriptDistribution: scriptData,
    dsarMetrics: dsarData.metrics,
    dsarTrend: dsarData.trend,
  };
}

/**
 * Get analytics for a specific website
 */
export async function getWebsiteAnalytics(
  websiteId: string,
  dateRange: DateRange = "30d"
): Promise<WebsiteAnalytics | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      userId: session.user.id,
    },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!website) {
    return null;
  }

  const startDate = getDateRangeStart(dateRange);

  const [complianceData, consentData, scanData, cookieData, scriptData] =
    await Promise.all([
      getComplianceScoreData([websiteId], startDate),
      getConsentData([websiteId], startDate),
      getScanData([websiteId], startDate),
      getCookieDistributionData([websiteId], startDate),
      getScriptDistributionData([websiteId], startDate),
    ]);

  const latestScore =
    complianceData.latestScores.length > 0 ? complianceData.latestScores[0] : 0;

  return {
    websiteId,
    websiteName: website.name,
    complianceScore: latestScore,
    complianceScoreTrend: complianceData.trend,
    consentMetrics: consentData.metrics,
    consentTrend: consentData.trend,
    scanMetrics: scanData.metrics,
    cookieDistribution: cookieData,
    scriptDistribution: scriptData,
    lastScanDate: website.lastScanAt,
  };
}

/**
 * Get compliance score trend data
 */
async function getComplianceScoreData(
  websiteIds: string[],
  startDate: Date
): Promise<{ latestScores: number[]; trend: ComplianceScoreTrend[] }> {
  if (websiteIds.length === 0) {
    return { latestScores: [], trend: [] };
  }

  // Get latest scan scores
  const latestScans = await db.scan.findMany({
    where: {
      websiteId: { in: websiteIds },
      status: "completed",
      score: { not: null },
    },
    orderBy: { createdAt: "desc" },
    distinct: ["websiteId"],
    select: { score: true },
  });

  const latestScores = latestScans
    .filter((s) => s.score !== null)
    .map((s) => s.score as number);

  // Get trend data
  const scans = await db.scan.findMany({
    where: {
      websiteId: { in: websiteIds },
      status: "completed",
      score: { not: null },
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: "asc" },
    select: {
      score: true,
      createdAt: true,
      website: { select: { name: true } },
    },
  });

  const trend: ComplianceScoreTrend[] = scans.map((scan) => ({
    date: formatDateKey(scan.createdAt),
    score: scan.score as number,
    websiteName: scan.website.name,
  }));

  return { latestScores, trend };
}

/**
 * Get consent metrics and trend
 */
async function getConsentData(
  websiteIds: string[],
  startDate: Date
): Promise<{ metrics: ConsentMetrics; trend: ConsentTrend[] }> {
  if (websiteIds.length === 0) {
    return {
      metrics: {
        total: 0,
        acceptedAll: 0,
        rejectedAll: 0,
        partial: 0,
        acceptanceRate: 0,
        byCategory: { analytics: 0, marketing: 0, functional: 0 },
      },
      trend: [],
    };
  }

  const consents = await db.consent.findMany({
    where: {
      websiteId: { in: websiteIds },
      consentedAt: { gte: startDate },
    },
    select: {
      preferences: true,
      consentedAt: true,
    },
  });

  // Calculate metrics
  let acceptedAll = 0;
  let rejectedAll = 0;
  let partial = 0;
  let analytics = 0;
  let marketing = 0;
  let functional = 0;

  for (const consent of consents) {
    const prefs = consent.preferences as unknown as ConsentPreferences;

    if (prefs.analytics && prefs.marketing && prefs.functional) {
      acceptedAll++;
    } else if (!prefs.analytics && !prefs.marketing && !prefs.functional) {
      rejectedAll++;
    } else {
      partial++;
    }

    if (prefs.analytics) analytics++;
    if (prefs.marketing) marketing++;
    if (prefs.functional) functional++;
  }

  const total = consents.length;
  const acceptanceRate = total > 0 ? Math.round((acceptedAll / total) * 100) : 0;

  // Calculate trend by date
  const trendMap = new Map<
    string,
    { total: number; acceptedAll: number; rejectedAll: number; partial: number }
  >();

  for (const consent of consents) {
    const dateKey = formatDateKey(consent.consentedAt);
    const prefs = consent.preferences as unknown as ConsentPreferences;

    if (!trendMap.has(dateKey)) {
      trendMap.set(dateKey, { total: 0, acceptedAll: 0, rejectedAll: 0, partial: 0 });
    }

    const entry = trendMap.get(dateKey)!;
    entry.total++;

    if (prefs.analytics && prefs.marketing && prefs.functional) {
      entry.acceptedAll++;
    } else if (!prefs.analytics && !prefs.marketing && !prefs.functional) {
      entry.rejectedAll++;
    } else {
      entry.partial++;
    }
  }

  // Fill in missing dates
  const dateRange = generateDateRange(startDate, new Date());
  const trend: ConsentTrend[] = dateRange.map((date) => ({
    date,
    ...(trendMap.get(date) || { total: 0, acceptedAll: 0, rejectedAll: 0, partial: 0 }),
  }));

  return {
    metrics: {
      total,
      acceptedAll,
      rejectedAll,
      partial,
      acceptanceRate,
      byCategory: { analytics, marketing, functional },
    },
    trend,
  };
}

/**
 * Get scan metrics
 */
async function getScanData(
  websiteIds: string[],
  startDate: Date
): Promise<{ metrics: ScanMetrics }> {
  if (websiteIds.length === 0) {
    return {
      metrics: {
        totalScans: 0,
        averageScore: 0,
        cookiesFound: 0,
        scriptsFound: 0,
        findingsCount: 0,
        findingsBySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      },
    };
  }

  const scans = await db.scan.findMany({
    where: {
      websiteId: { in: websiteIds },
      status: "completed",
      createdAt: { gte: startDate },
    },
    include: {
      _count: {
        select: { cookies: true, scripts: true, findings: true },
      },
    },
  });

  const findings = await db.finding.findMany({
    where: {
      scan: {
        websiteId: { in: websiteIds },
        createdAt: { gte: startDate },
      },
    },
    select: { severity: true },
  });

  const totalScans = scans.length;
  const scoresSum = scans.reduce((sum, s) => sum + (s.score || 0), 0);
  const averageScore = totalScans > 0 ? Math.round(scoresSum / totalScans) : 0;
  const cookiesFound = scans.reduce((sum, s) => sum + s._count.cookies, 0);
  const scriptsFound = scans.reduce((sum, s) => sum + s._count.scripts, 0);
  const findingsCount = findings.length;

  const findingsBySeverity = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  return {
    metrics: {
      totalScans,
      averageScore,
      cookiesFound,
      scriptsFound,
      findingsCount,
      findingsBySeverity,
    },
  };
}

/**
 * Get cookie distribution data
 */
async function getCookieDistributionData(
  websiteIds: string[],
  startDate: Date
): Promise<CookieDistribution[]> {
  if (websiteIds.length === 0) {
    return [];
  }

  const cookies = await db.cookie.groupBy({
    by: ["category"],
    where: {
      scan: {
        websiteId: { in: websiteIds },
        createdAt: { gte: startDate },
      },
    },
    _count: { category: true },
  });

  const total = cookies.reduce((sum, c) => sum + c._count.category, 0);

  return cookies.map((c) => ({
    category: c.category || "unknown",
    count: c._count.category,
    percentage: total > 0 ? Math.round((c._count.category / total) * 100) : 0,
  }));
}

/**
 * Get script distribution data
 */
async function getScriptDistributionData(
  websiteIds: string[],
  startDate: Date
): Promise<ScriptDistribution[]> {
  if (websiteIds.length === 0) {
    return [];
  }

  const scripts = await db.script.groupBy({
    by: ["category"],
    where: {
      scan: {
        websiteId: { in: websiteIds },
        createdAt: { gte: startDate },
      },
    },
    _count: { category: true },
  });

  const total = scripts.reduce((sum, s) => sum + s._count.category, 0);

  return scripts.map((s) => ({
    category: s.category || "unknown",
    count: s._count.category,
    percentage: total > 0 ? Math.round((s._count.category / total) * 100) : 0,
  }));
}

/**
 * Get DSAR metrics and trend
 */
async function getDsarData(
  websiteIds: string[],
  startDate: Date
): Promise<{ metrics: DsarMetrics; trend: DsarTrend[] }> {
  if (websiteIds.length === 0) {
    return {
      metrics: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
        overdue: 0,
        averageResponseTime: 0,
        byType: {
          access: 0,
          erasure: 0,
          rectification: 0,
          portability: 0,
          restriction: 0,
          objection: 0,
        },
      },
      trend: [],
    };
  }

  const dsars = await db.dataSubjectRequest.findMany({
    where: {
      websiteId: { in: websiteIds },
      createdAt: { gte: startDate },
    },
    select: {
      status: true,
      requestType: true,
      createdAt: true,
      completedAt: true,
      dueDate: true,
    },
  });

  // Calculate metrics
  const total = dsars.length;
  const pending = dsars.filter((d) => d.status === "pending" || d.status === "verified").length;
  const inProgress = dsars.filter((d) => d.status === "in_progress").length;
  const completed = dsars.filter((d) => d.status === "completed").length;
  const rejected = dsars.filter((d) => d.status === "rejected").length;
  const overdue = dsars.filter(
    (d) =>
      !["completed", "rejected"].includes(d.status) && d.dueDate < new Date()
  ).length;

  // Calculate average response time for completed requests
  const completedDsars = dsars.filter((d) => d.completedAt);
  const totalResponseTime = completedDsars.reduce((sum, d) => {
    const responseTime =
      (d.completedAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return sum + responseTime;
  }, 0);
  const averageResponseTime =
    completedDsars.length > 0
      ? Math.round(totalResponseTime / completedDsars.length)
      : 0;

  // Count by type
  const byType = {
    access: dsars.filter((d) => d.requestType === "access").length,
    erasure: dsars.filter((d) => d.requestType === "erasure").length,
    rectification: dsars.filter((d) => d.requestType === "rectification").length,
    portability: dsars.filter((d) => d.requestType === "portability").length,
    restriction: dsars.filter((d) => d.requestType === "restriction").length,
    objection: dsars.filter((d) => d.requestType === "objection").length,
  };

  // Calculate trend
  const trendMap = new Map<string, { submitted: number; completed: number }>();

  for (const dsar of dsars) {
    const submittedDateKey = formatDateKey(dsar.createdAt);

    if (!trendMap.has(submittedDateKey)) {
      trendMap.set(submittedDateKey, { submitted: 0, completed: 0 });
    }
    trendMap.get(submittedDateKey)!.submitted++;

    if (dsar.completedAt) {
      const completedDateKey = formatDateKey(dsar.completedAt);
      if (!trendMap.has(completedDateKey)) {
        trendMap.set(completedDateKey, { submitted: 0, completed: 0 });
      }
      trendMap.get(completedDateKey)!.completed++;
    }
  }

  const dateRange = generateDateRange(startDate, new Date());
  const trend: DsarTrend[] = dateRange.map((date) => ({
    date,
    ...(trendMap.get(date) || { submitted: 0, completed: 0 }),
  }));

  return {
    metrics: {
      total,
      pending,
      inProgress,
      completed,
      rejected,
      overdue,
      averageResponseTime,
      byType,
    },
    trend,
  };
}

/**
 * Export analytics report as CSV
 */
export async function exportAnalyticsReport(
  dateRange: DateRange = "30d"
): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const analytics = await getOverallAnalytics(dateRange);

  const lines: string[] = [
    "ComplianceKit Analytics Report",
    `Generated: ${new Date().toISOString()}`,
    `Date Range: ${dateRange}`,
    "",
    "=== COMPLIANCE OVERVIEW ===",
    `Overall Compliance Score: ${analytics.complianceScore}%`,
    "",
    "=== CONSENT METRICS ===",
    `Total Consents: ${analytics.consentMetrics.total}`,
    `Accepted All: ${analytics.consentMetrics.acceptedAll}`,
    `Rejected All: ${analytics.consentMetrics.rejectedAll}`,
    `Partial Consent: ${analytics.consentMetrics.partial}`,
    `Acceptance Rate: ${analytics.consentMetrics.acceptanceRate}%`,
    "",
    "Consent by Category:",
    `  Analytics: ${analytics.consentMetrics.byCategory.analytics}`,
    `  Marketing: ${analytics.consentMetrics.byCategory.marketing}`,
    `  Functional: ${analytics.consentMetrics.byCategory.functional}`,
    "",
    "=== SCAN METRICS ===",
    `Total Scans: ${analytics.scanMetrics.totalScans}`,
    `Average Score: ${analytics.scanMetrics.averageScore}%`,
    `Cookies Found: ${analytics.scanMetrics.cookiesFound}`,
    `Scripts Found: ${analytics.scanMetrics.scriptsFound}`,
    `Total Findings: ${analytics.scanMetrics.findingsCount}`,
    "",
    "Findings by Severity:",
    `  Critical: ${analytics.scanMetrics.findingsBySeverity.critical}`,
    `  High: ${analytics.scanMetrics.findingsBySeverity.high}`,
    `  Medium: ${analytics.scanMetrics.findingsBySeverity.medium}`,
    `  Low: ${analytics.scanMetrics.findingsBySeverity.low}`,
    `  Info: ${analytics.scanMetrics.findingsBySeverity.info}`,
    "",
    "=== DSAR METRICS ===",
    `Total Requests: ${analytics.dsarMetrics.total}`,
    `Pending: ${analytics.dsarMetrics.pending}`,
    `In Progress: ${analytics.dsarMetrics.inProgress}`,
    `Completed: ${analytics.dsarMetrics.completed}`,
    `Rejected: ${analytics.dsarMetrics.rejected}`,
    `Overdue: ${analytics.dsarMetrics.overdue}`,
    `Avg Response Time: ${analytics.dsarMetrics.averageResponseTime} days`,
    "",
    "DSAR by Type:",
    `  Access: ${analytics.dsarMetrics.byType.access}`,
    `  Erasure: ${analytics.dsarMetrics.byType.erasure}`,
    `  Rectification: ${analytics.dsarMetrics.byType.rectification}`,
    `  Portability: ${analytics.dsarMetrics.byType.portability}`,
    `  Restriction: ${analytics.dsarMetrics.byType.restriction}`,
    `  Objection: ${analytics.dsarMetrics.byType.objection}`,
  ];

  return lines.join("\n");
}

