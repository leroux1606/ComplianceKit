import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dns module before importing the module under test
vi.mock("dns", () => ({
  promises: {
    lookup: vi.fn(),
  },
}));

import { validateScanUrl } from "../ssrf-check";
import { promises as dns } from "dns";

const mockLookup = vi.mocked(dns.lookup);

beforeEach(() => {
  vi.resetAllMocks();
});

// Helper: make lookup resolve to a given IP
function resolvesTo(ip: string) {
  mockLookup.mockResolvedValue({ address: ip, family: 4 } as never);
}

// Helper: make lookup fail (unresolvable hostname)
function failsLookup() {
  mockLookup.mockRejectedValue(new Error("ENOTFOUND"));
}

// ─── Protocol validation ────────────────────────────────────────────────────

describe("protocol validation", () => {
  it("allows https://", async () => {
    resolvesTo("93.184.216.34"); // example.com
    const result = await validateScanUrl("https://example.com");
    expect(result.safe).toBe(true);
  });

  it("allows http://", async () => {
    resolvesTo("93.184.216.34");
    const result = await validateScanUrl("http://example.com");
    expect(result.safe).toBe(true);
  });

  it("blocks file:// protocol", async () => {
    const result = await validateScanUrl("file:///etc/passwd");
    expect(result.safe).toBe(false);
    expect((result as { safe: false; reason: string }).reason).toMatch(/HTTP/i);
  });

  it("blocks javascript: protocol", async () => {
    const result = await validateScanUrl("javascript:alert(1)");
    expect(result.safe).toBe(false);
  });

  it("blocks data: protocol", async () => {
    const result = await validateScanUrl("data:text/html,<script>alert(1)</script>");
    expect(result.safe).toBe(false);
  });

  it("blocks ftp:// protocol", async () => {
    const result = await validateScanUrl("ftp://example.com");
    expect(result.safe).toBe(false);
  });

  it("rejects a completely invalid URL", async () => {
    const result = await validateScanUrl("not-a-url");
    expect(result.safe).toBe(false);
    expect((result as { safe: false; reason: string }).reason).toMatch(/invalid url/i);
  });

  it("rejects an empty string", async () => {
    const result = await validateScanUrl("");
    expect(result.safe).toBe(false);
  });
});

// ─── Localhost / loopback blocking ──────────────────────────────────────────

describe("localhost blocking (pre-DNS)", () => {
  it("blocks 'localhost' hostname", async () => {
    const result = await validateScanUrl("http://localhost");
    expect(result.safe).toBe(false);
    expect((result as { safe: false; reason: string }).reason).toMatch(/private/i);
  });

  it("blocks 'localhost' with port", async () => {
    const result = await validateScanUrl("http://localhost:5432");
    expect(result.safe).toBe(false);
  });

  it("blocks 127.0.0.1", async () => {
    const result = await validateScanUrl("http://127.0.0.1");
    expect(result.safe).toBe(false);
  });

  it("blocks 127.0.0.2 (whole /8 loopback range)", async () => {
    const result = await validateScanUrl("http://127.0.0.2");
    expect(result.safe).toBe(false);
  });

  it("blocks 0.0.0.0", async () => {
    const result = await validateScanUrl("http://0.0.0.0");
    expect(result.safe).toBe(false);
  });
});

// ─── Private IP range blocking (pre-DNS) ────────────────────────────────────

describe("private IP blocking (pre-DNS, IP literal in URL)", () => {
  it("blocks 10.0.0.1 (RFC1918 class A)", async () => {
    const result = await validateScanUrl("http://10.0.0.1");
    expect(result.safe).toBe(false);
  });

  it("blocks 10.255.255.255 (top of RFC1918 class A)", async () => {
    const result = await validateScanUrl("http://10.255.255.255");
    expect(result.safe).toBe(false);
  });

  it("blocks 172.16.0.1 (RFC1918 class B start)", async () => {
    const result = await validateScanUrl("http://172.16.0.1");
    expect(result.safe).toBe(false);
  });

  it("blocks 172.31.255.255 (RFC1918 class B end)", async () => {
    const result = await validateScanUrl("http://172.31.255.255");
    expect(result.safe).toBe(false);
  });

  it("allows 172.15.0.1 (just outside RFC1918 class B)", async () => {
    resolvesTo("172.15.0.1");
    const result = await validateScanUrl("http://172.15.0.1");
    // 172.15.x is NOT in the 172.16–172.31 range, so it should be allowed
    expect(result.safe).toBe(true);
  });

  it("allows 172.32.0.1 (just outside RFC1918 class B)", async () => {
    resolvesTo("172.32.0.1");
    const result = await validateScanUrl("http://172.32.0.1");
    expect(result.safe).toBe(true);
  });

  it("blocks 192.168.0.1 (RFC1918 class C)", async () => {
    const result = await validateScanUrl("http://192.168.0.1");
    expect(result.safe).toBe(false);
  });

  it("blocks 192.168.100.50 (RFC1918 class C)", async () => {
    const result = await validateScanUrl("http://192.168.100.50");
    expect(result.safe).toBe(false);
  });

  it("blocks 169.254.169.254 (AWS metadata endpoint)", async () => {
    const result = await validateScanUrl("http://169.254.169.254/latest/meta-data/");
    expect(result.safe).toBe(false);
  });

  it("blocks 169.254.0.1 (link-local range)", async () => {
    const result = await validateScanUrl("http://169.254.0.1");
    expect(result.safe).toBe(false);
  });

  it("blocks 100.64.0.1 (CGNAT range start)", async () => {
    const result = await validateScanUrl("http://100.64.0.1");
    expect(result.safe).toBe(false);
  });

  it("blocks 100.127.255.255 (CGNAT range end)", async () => {
    const result = await validateScanUrl("http://100.127.255.255");
    expect(result.safe).toBe(false);
  });

  it("allows 100.63.255.255 (just before CGNAT range)", async () => {
    resolvesTo("100.63.255.255");
    const result = await validateScanUrl("http://100.63.255.255");
    expect(result.safe).toBe(true);
  });
});

// ─── Reserved TLD blocking ───────────────────────────────────────────────────

describe("reserved TLD blocking", () => {
  it("blocks *.local", async () => {
    const result = await validateScanUrl("http://my-router.local");
    expect(result.safe).toBe(false);
  });

  it("blocks *.internal", async () => {
    const result = await validateScanUrl("http://database.internal");
    expect(result.safe).toBe(false);
  });

  it("blocks *.localhost (as TLD)", async () => {
    const result = await validateScanUrl("http://app.localhost");
    expect(result.safe).toBe(false);
  });

  it("blocks *.example (reserved by IANA)", async () => {
    const result = await validateScanUrl("http://site.example");
    expect(result.safe).toBe(false);
  });

  it("blocks *.invalid", async () => {
    const result = await validateScanUrl("http://site.invalid");
    expect(result.safe).toBe(false);
  });

  it("blocks *.test", async () => {
    const result = await validateScanUrl("http://dev.test");
    expect(result.safe).toBe(false);
  });
});

// ─── DNS-resolved private IP blocking ───────────────────────────────────────

describe("DNS-resolved private IP blocking", () => {
  it("blocks a domain that resolves to a private IP", async () => {
    resolvesTo("10.0.0.1");
    const result = await validateScanUrl("https://evil.example.com");
    expect(result.safe).toBe(false);
    expect((result as { safe: false; reason: string }).reason).toMatch(/private/i);
  });

  it("blocks a domain that resolves to 127.x (loopback)", async () => {
    resolvesTo("127.0.0.1");
    const result = await validateScanUrl("https://sneaky.evil.com");
    expect(result.safe).toBe(false);
  });

  it("blocks a domain that resolves to AWS metadata IP", async () => {
    resolvesTo("169.254.169.254");
    const result = await validateScanUrl("https://aws-creds-leak.com");
    expect(result.safe).toBe(false);
  });

  it("blocks an unresolvable hostname", async () => {
    failsLookup();
    const result = await validateScanUrl("https://does-not-exist-abc123.com");
    expect(result.safe).toBe(false);
    expect((result as { safe: false; reason: string }).reason).toMatch(/resolve/i);
  });

  it("allows a domain that resolves to a public IP", async () => {
    resolvesTo("1.1.1.1"); // Cloudflare DNS — public
    const result = await validateScanUrl("https://cloudflare.com");
    expect(result.safe).toBe(true);
  });

  it("allows a domain that resolves to another public IP", async () => {
    resolvesTo("93.184.216.34"); // example.com — public IANA IP
    const result = await validateScanUrl("https://example.com");
    expect(result.safe).toBe(true);
  });
});

// ─── Edge cases ──────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("handles URLs with ports correctly", async () => {
    resolvesTo("93.184.216.34");
    const result = await validateScanUrl("https://example.com:8443/path?q=1");
    expect(result.safe).toBe(true);
  });

  it("blocks localhost even with a non-standard port", async () => {
    const result = await validateScanUrl("http://localhost:8080/admin");
    expect(result.safe).toBe(false);
  });

  it("blocks 127.0.0.1 even with a path", async () => {
    const result = await validateScanUrl("http://127.0.0.1/etc/passwd");
    expect(result.safe).toBe(false);
  });

  it("handles HTTPS with trailing slash", async () => {
    resolvesTo("93.184.216.34");
    const result = await validateScanUrl("https://example.com/");
    expect(result.safe).toBe(true);
  });
});
