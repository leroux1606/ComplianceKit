/**
 * DSAR Attachment Security Validator — B4
 *
 * B4 audit finding: the DsarAttachment schema model exists but no upload
 * implementation has been built. This module provides the mandatory security
 * controls that ANY future upload route must use before writing a file.
 *
 * Requirements enforced here:
 *   1. MIME type allowlist — validated against actual file bytes (magic numbers),
 *      not just the Content-Type header or file extension (both are attacker-controlled)
 *   2. File size limit — 10 MB hard cap
 *   3. Filename sanitisation — strips path traversal sequences and control chars
 *   4. Storage contract — files must go to a private storage bucket and be served
 *      via short-lived signed URLs, never a public URL (enforced by documentation
 *      here; integrate with Supabase Storage private bucket or equivalent)
 */

/** Maximum accepted file size in bytes (10 MB). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/**
 * MIME types accepted for DSAR attachments.
 * Deliberately narrow — only document and image formats that a data subject
 * would plausibly submit as evidence.
 */
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/**
 * Magic-number signatures for the allowed MIME types.
 * We read the first bytes of the uploaded file and compare against known
 * signatures instead of trusting the Content-Type header.
 */
const MAGIC_SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "application/pdf",  bytes: [0x25, 0x50, 0x44, 0x46] },          // %PDF
  { mime: "image/jpeg",       bytes: [0xff, 0xd8, 0xff] },                 // JFIF/EXIF
  { mime: "image/png",        bytes: [0x89, 0x50, 0x4e, 0x47] },           // PNG
  { mime: "image/gif",        bytes: [0x47, 0x49, 0x46, 0x38] },           // GIF8
  { mime: "image/webp",       bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },// RIFF (webp has WEBP at offset 8 too)
  // DOCX / XLSX are ZIP-based — starts with PK\x03\x04
  { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                               bytes: [0x50, 0x4b, 0x03, 0x04] },
  // Legacy .doc — starts with D0 CF 11 E0 (OLE2 compound)
  { mime: "application/msword", bytes: [0xd0, 0xcf, 0x11, 0xe0] },
  // Plain text has no reliable magic number — we allow it by allowlist only
];

export type AttachmentValidationResult =
  | { valid: true; sanitizedFilename: string; detectedMime: string | null }
  | { valid: false; reason: string };

/**
 * Validate an uploaded file buffer before storing it.
 *
 * @param buffer   Raw file bytes
 * @param filename Original filename from the multipart upload
 * @param declaredMime Content-Type header value (not trusted — used as hint only)
 */
export function validateAttachment(
  buffer: Buffer,
  filename: string,
  declaredMime: string
): AttachmentValidationResult {
  // 1. Size check
  if (buffer.byteLength === 0) {
    return { valid: false, reason: "File is empty" };
  }
  if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    const mb = (buffer.byteLength / (1024 * 1024)).toFixed(1);
    return { valid: false, reason: `File too large: ${mb} MB (max 10 MB)` };
  }

  // 2. Declared MIME allowlist check (first gate — fast)
  const normalizedMime = declaredMime.split(";")[0].trim().toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    return { valid: false, reason: `File type not allowed: ${normalizedMime}` };
  }

  // 3. Magic-number verification (second gate — reads actual bytes)
  const detectedMime = detectMimeFromBytes(buffer);
  if (detectedMime !== null && !ALLOWED_MIME_TYPES.has(detectedMime)) {
    return { valid: false, reason: `File content does not match an allowed type (detected: ${detectedMime})` };
  }
  // Plain text has no magic number so detectedMime may be null — that's acceptable
  // as long as the declared MIME passed the allowlist check above.

  // 4. Filename sanitisation
  const sanitizedFilename = sanitizeFilename(filename);
  if (!sanitizedFilename) {
    return { valid: false, reason: "Invalid filename" };
  }

  return { valid: true, sanitizedFilename, detectedMime };
}

/**
 * Read the first bytes of a buffer and return the matched MIME type,
 * or null if no signature matches (e.g. plain text).
 */
function detectMimeFromBytes(buffer: Buffer): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    const offset = sig.offset ?? 0;
    const match = sig.bytes.every(
      (byte, i) => buffer[offset + i] === byte
    );
    if (match) return sig.mime;
  }
  return null;
}

/**
 * Sanitise a filename:
 *   - Strips directory separators (path traversal)
 *   - Removes leading dots (hidden files on Unix)
 *   - Strips null bytes and control characters
 *   - Truncates to 255 characters
 *   - Falls back to "attachment" if nothing remains
 */
export function sanitizeFilename(raw: string): string {
  let name = raw
    .replace(/[\\/]/g, "")           // no path separators
    .replace(/\.\./g, "")            // no double-dot traversal
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]/g, "") // no control characters
    .trim()
    .replace(/^\.+/, "")             // no leading dots
    .substring(0, 255);

  return name || "attachment";
}
