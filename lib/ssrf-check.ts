import { promises as dns } from "dns";

/**
 * IP ranges that must never be scanned.
 * Covers: loopback, RFC1918 private, link-local (AWS metadata), CGNAT,
 * IPv6 loopback, IPv6 unique-local, and IPv6 link-local.
 */
const PRIVATE_IP_PATTERNS = [
  /^127\./,                                          // 127.0.0.0/8  loopback
  /^10\./,                                           // 10.0.0.0/8   RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./,                     // 172.16.0.0/12 RFC1918
  /^192\.168\./,                                     // 192.168.0.0/16 RFC1918
  /^169\.254\./,                                     // 169.254.0.0/16 link-local / AWS metadata
  /^100\.(6[4-9]|[7-9]\d|1([01]\d|2[0-7]))\./,     // 100.64.0.0/10  CGNAT
  /^0\./,                                            // 0.0.0.0/8 this-network
  /^::1$/,                                           // ::1 IPv6 loopback
  /^fc[0-9a-f]{2}:/i,                                // fc00::/7  IPv6 unique local
  /^fe[89ab][0-9a-f]:/i,                             // fe80::/10 IPv6 link-local
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

/**
 * Validates that a URL is safe to pass to Puppeteer.
 * Rejects private/internal network addresses to prevent SSRF attacks.
 *
 * Returns { safe: true } if the URL is safe to scan,
 * or { safe: false, reason: string } if it should be blocked.
 */
export async function validateScanUrl(
  url: string
): Promise<{ safe: true } | { safe: false; reason: string }> {
  // Must parse as a valid URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: "Invalid URL" };
  }

  // Only HTTP and HTTPS are allowed — blocks file://, data://, javascript://, etc.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, reason: "Only HTTP and HTTPS URLs are allowed" };
  }

  const hostname = parsed.hostname;

  // Block bare IP literals that are obviously private before DNS lookup
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    isPrivateIp(hostname)
  ) {
    return { safe: false, reason: "Scanning private network addresses is not allowed" };
  }

  // Block reserved TLDs and suffixes used for internal/local networks
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".test")
  ) {
    return { safe: false, reason: "Scanning local or reserved domain names is not allowed" };
  }

  // Resolve the hostname and verify the resolved IP is public
  try {
    const { address } = await dns.lookup(hostname);
    if (isPrivateIp(address)) {
      return { safe: false, reason: "Scanning private network addresses is not allowed" };
    }
  } catch {
    return { safe: false, reason: "Could not resolve hostname" };
  }

  return { safe: true };
}
