/**
 * Input Sanitization Utilities
 * 
 * Use for additional safety beyond Prisma's parameterized queries.
 * React already escapes output, but these help with storage sanitization.
 */

/**
 * Escape HTML special characters to prevent XSS
 * Use when you need to render user input in non-React contexts
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=/]/g, (char) => escapeMap[char]);
}

/**
 * Strip HTML tags from string
 * Use for cleaning up pasted content
 */
export function stripTags(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Remove control characters (non-printable)
 * Helps prevent text manipulation attacks
 */
export function removeControlChars(str: string): string {
  if (typeof str !== 'string') return '';
  // Remove ASCII control characters (0x00-0x1F and 0x7F)
  // But keep common whitespace: tab (0x09), newline (0x0A), carriage return (0x0D)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize user text input for storage
 * - Removes control characters
 * - Trims whitespace
 * - Limits length
 */
export function sanitizeText(str: string, maxLength: number = 10000): string {
  if (typeof str !== 'string') return '';
  return removeControlChars(str).trim().slice(0, maxLength);
}

/**
 * Sanitize for display (escapes HTML)
 * Use when you need to display in raw HTML contexts
 */
export function sanitizeForDisplay(str: string): string {
  return escapeHtml(sanitizeText(str));
}

/**
 * Sanitize file name for safe storage
 * - Removes path separators
 * - Removes special characters
 * - Limits length
 */
export function sanitizeFileName(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .slice(0, 255); // Limit length
}

/**
 * Sanitize URL for safe redirection
 * - Only allows http/https protocols
 * - Prevents javascript: and data: URLs
 */
export function sanitizeUrl(str: string): string | null {
  if (typeof str !== 'string') return null;
  
  const trimmed = str.trim();
  
  // Only allow http and https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }
  
  // Block javascript: in any encoding
  if (trimmed.toLowerCase().includes('javascript:')) {
    return null;
  }
  
  // Block data: URLs
  if (trimmed.toLowerCase().includes('data:')) {
    return null;
  }
  
  return trimmed;
}

/**
 * Normalize email address
 * - Lowercase
 * - Trim whitespace
 * - Remove dots from Gmail local part (optional)
 */
export function normalizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}

/**
 * Sanitize search query
 * - Remove control characters
 * - Trim whitespace
 * - Limit length
 */
export function sanitizeSearchQuery(str: string, maxLength: number = 200): string {
  if (typeof str !== 'string') return '';
  return removeControlChars(str)
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, maxLength);
}

/**
 * Check if string contains potential XSS vectors
 * Returns true if suspicious patterns found
 */
export function containsXssVectors(str: string): boolean {
  if (typeof str !== 'string') return false;
  
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /data:/i,
    /vbscript:/i,
  ];
  
  return xssPatterns.some((pattern) => pattern.test(str));
}

/**
 * Sanitize JSON string for safe parsing
 * Removes control characters that could break JSON.parse
 */
export function sanitizeJsonString(str: string): string {
  if (typeof str !== 'string') return '';
  
  // Remove Unicode control characters that break JSON
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, (char) => {
    // Keep valid whitespace
    if (char === '\n' || char === '\r' || char === '\t') {
      return char;
    }
    return '';
  });
}

/**
 * Create a slug from a string (for URLs)
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters
 */
export function slugify(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
