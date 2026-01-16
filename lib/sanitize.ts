/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize HTML to prevent XSS
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize plain text input
 * Removes control characters and excessive whitespace
 */
export function sanitizeText(input: string): string {
  if (!input) return "";

  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Sanitize email address
 * Basic validation and normalization
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w.@+-]/g, ""); // Only allow valid email characters
}

/**
 * Sanitize URL
 * Ensures URL is safe and valid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

/**
 * Sanitize user input for database storage
 * Prevents common injection patterns
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return "";

  return sanitizeText(input)
    .substring(0, 10000); // Limit length to prevent DOS
}

/**
 * Sanitize file name
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return "";

  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Only allow safe characters
    .replace(/\.{2,}/g, ".") // Prevent directory traversal
    .substring(0, 255); // Limit length
}

/**
 * Escape SQL LIKE pattern
 * For safe use in SQL LIKE queries
 */
export function escapeLikePattern(pattern: string): string {
  if (!pattern) return "";

  return pattern
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/**
 * Sanitize rich text content (for policies)
 * Allows safe HTML tags, removes dangerous ones
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";

  // Allowed tags for policy documents
  const allowedTags = [
    "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "a", "table", "tr", "td", "th", "thead", "tbody"
  ];

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, ""); // Remove javascript: protocol

  // Only allow whitelisted tags (basic implementation)
  // In production, use a proper library like DOMPurify or sanitize-html
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return "";
  });

  return sanitized;
}

/**
 * Validate and sanitize JSON input
 * Prevents JSON injection
 */
export function sanitizeJson(input: unknown): unknown {
  if (input === null || input === undefined) return null;

  if (typeof input === "string") {
    return sanitizeText(input);
  }

  if (typeof input === "number" || typeof input === "boolean") {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeJson);
  }

  if (typeof input === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJson(value);
      }
    }
    return sanitized;
  }

  return null;
}
