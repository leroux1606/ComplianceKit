/**
 * Structured logger — JSON in production, pretty-printed in development.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("scan.complete", { scanId, score, duration });
 *   logger.error("payment.failed", { userId }, error);
 *   logger.warn("rate_limit.fallback", { key });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  event: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === "development";

function log(level: LogLevel, event: string, data?: Record<string, unknown>, error?: unknown): void {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  if (error) {
    entry.error =
      error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack }
        : String(error);
  }

  if (isDev) {
    // Readable format for local dev
    const prefix = `[${entry.ts}] ${level.toUpperCase().padEnd(5)} ${event}`;
    const { ts: _ts, level: _level, event: _event, ...rest } = entry;

    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(prefix, Object.keys(rest).length > 0 ? rest : "");
  } else {
    // Structured JSON for log aggregation (Vercel, Datadog, CloudWatch, etc.)
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (event: string, data?: Record<string, unknown>) => log("debug", event, data),
  info:  (event: string, data?: Record<string, unknown>) => log("info",  event, data),
  warn:  (event: string, data?: Record<string, unknown>) => log("warn",  event, data),
  error: (event: string, data?: Record<string, unknown>, error?: unknown) =>
    log("error", event, data, error),
};
