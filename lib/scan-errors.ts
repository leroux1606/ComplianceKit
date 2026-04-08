/**
 * Classify raw scan error messages into user-friendly descriptions.
 * Puppeteer and network errors are opaque — this maps them to actionable guidance.
 */
export interface ScanErrorInfo {
  title: string;
  description: string;
  canRetry: boolean;
}

export function classifyScanError(raw: string | null | undefined): ScanErrorInfo {
  const msg = (raw ?? "").toLowerCase();

  if (!raw) {
    return {
      title: "Scan failed",
      description: "An unknown error occurred. Please try again.",
      canRetry: true,
    };
  }

  // DNS / unreachable
  if (
    msg.includes("err_name_not_resolved") ||
    msg.includes("net::err_name") ||
    msg.includes("getaddrinfo") ||
    msg.includes("enotfound")
  ) {
    return {
      title: "Site unreachable",
      description:
        "The domain could not be resolved. Check the URL is correct and the site is live.",
      canRetry: false,
    };
  }

  // Connection refused / reset
  if (
    msg.includes("err_connection_refused") ||
    msg.includes("econnrefused") ||
    msg.includes("err_connection_reset")
  ) {
    return {
      title: "Connection refused",
      description:
        "The server actively rejected the connection. The site may be down or behind a firewall.",
      canRetry: true,
    };
  }

  // Timeout
  if (
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("err_timed_out") ||
    msg.includes("navigation timeout")
  ) {
    return {
      title: "Scan timed out",
      description:
        "The page took too long to load. This can happen on slow sites or those with heavy JavaScript. Try again — if it keeps failing the site may be blocking automated tools.",
      canRetry: true,
    };
  }

  // Bot protection / access denied
  if (
    msg.includes("403") ||
    msg.includes("access denied") ||
    msg.includes("forbidden") ||
    msg.includes("cloudflare") ||
    msg.includes("bot") ||
    msg.includes("captcha")
  ) {
    return {
      title: "Access blocked",
      description:
        "The site blocked the scan, likely due to bot protection (Cloudflare, CAPTCHA, etc.). We cannot scan sites with strict bot protection.",
      canRetry: false,
    };
  }

  // SSL / certificate errors
  if (
    msg.includes("ssl") ||
    msg.includes("certificate") ||
    msg.includes("err_cert") ||
    msg.includes("err_ssl")
  ) {
    return {
      title: "SSL certificate error",
      description:
        "The site has an invalid or expired SSL certificate. Fix the certificate issue and try again.",
      canRetry: false,
    };
  }

  // SSRF / invalid URL
  if (
    msg.includes("private") ||
    msg.includes("reserved") ||
    msg.includes("localhost") ||
    msg.includes("not allowed") ||
    msg.includes("invalid url")
  ) {
    return {
      title: "Invalid URL",
      description:
        "This URL cannot be scanned. Only publicly accessible websites are supported.",
      canRetry: false,
    };
  }

  // Fallback
  return {
    title: "Scan failed",
    description: `An unexpected error occurred: ${raw}. Please try again or contact support if the problem persists.`,
    canRetry: true,
  };
}
