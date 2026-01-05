/**
 * @file sanitize.test.ts
 * @description Tests for sanitization utilities and XSS prevention
 */

import {
  escapeHtml,
  stripTags,
  removeControlChars,
  sanitizeText,
  sanitizeForDisplay,
  sanitizeFileName,
  sanitizeUrl,
  normalizeEmail,
  sanitizeSearchQuery,
  containsXssVectors,
  sanitizeJsonString,
  slugify,
  truncate,
} from '@/lib/sanitize';

describe('Sanitization Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = escapeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape all dangerous characters', () => {
      const input = '<div class="test" data-attr=\'value\'>&</div>';
      const result = escapeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
      expect(escapeHtml(123 as unknown as string)).toBe('');
    });

    it('should escape backticks and equals', () => {
      const input = '`onload=alert(1)`';
      const result = escapeHtml(input);
      expect(result).toContain('&#x60;');
      expect(result).toContain('&#x3D;');
    });
  });

  describe('stripTags', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      expect(stripTags(input)).toBe('Hello World');
    });

    it('should handle malformed HTML', () => {
      const input = '<div>Unclosed<span>Tags';
      expect(stripTags(input)).toBe('UnclosedTags');
    });

    it('should preserve text content', () => {
      const input = '<div class="test">Keep this text</div>';
      expect(stripTags(input)).toBe('Keep this text');
    });

    it('should handle empty string', () => {
      expect(stripTags('')).toBe('');
    });
  });

  describe('removeControlChars', () => {
    it('should remove ASCII control characters', () => {
      const input = 'Hello\x00World\x1F';
      expect(removeControlChars(input)).toBe('HelloWorld');
    });

    it('should preserve tabs and newlines', () => {
      const input = 'Hello\tWorld\n';
      expect(removeControlChars(input)).toBe('Hello\tWorld\n');
    });

    it('should remove null bytes', () => {
      const input = 'Hello\x00World';
      const result = removeControlChars(input);
      expect(result).not.toContain('\x00');
    });
  });

  describe('sanitizeText', () => {
    it('should remove control characters and trim', () => {
      const input = '  Hello\x00World  ';
      expect(sanitizeText(input)).toBe('HelloWorld');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(100);
      expect(sanitizeText(input, 50)).toHaveLength(50);
    });

    it('should handle empty string', () => {
      expect(sanitizeText('')).toBe('');
    });
  });

  describe('sanitizeForDisplay', () => {
    it('should escape HTML and remove control chars', () => {
      const input = '<script>\x00alert("xss")</script>';
      const result = sanitizeForDisplay(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('\x00');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove special characters', () => {
      const input = 'my file (copy).jpg';
      expect(sanitizeFileName(input)).toBe('my_file__copy_.jpg');
    });

    it('should limit length to 255 characters', () => {
      const input = 'a'.repeat(300) + '.jpg';
      expect(sanitizeFileName(input).length).toBeLessThanOrEqual(255);
    });

    it('should remove path separators', () => {
      const input = '../../../etc/passwd';
      expect(sanitizeFileName(input)).not.toContain('/');
      expect(sanitizeFileName(input)).not.toContain('..');
    });

    it('should remove leading and trailing dots', () => {
      const input = '..hidden.file..';
      const result = sanitizeFileName(input);
      expect(result).not.toMatch(/^\./);
      expect(result).not.toMatch(/\.$/);
    });

    it('should handle empty string', () => {
      expect(sanitizeFileName('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid https URLs', () => {
      const url = 'https://example.com/path';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should accept valid http URLs', () => {
      const url = 'http://example.com/path';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should reject javascript: URLs', () => {
      const url = 'javascript:alert(1)';
      expect(sanitizeUrl(url)).toBeNull();
    });

    it('should reject javascript: URLs with encoding', () => {
      const url = 'JAVASCRIPT:alert(1)';
      expect(sanitizeUrl(url)).toBeNull();
    });

    it('should reject data: URLs', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      expect(sanitizeUrl(url)).toBeNull();
    });

    it('should reject relative URLs', () => {
      const url = '/path/to/page';
      expect(sanitizeUrl(url)).toBeNull();
    });

    it('should trim whitespace', () => {
      const url = '  https://example.com  ';
      expect(sanitizeUrl(url)).toBe('https://example.com');
    });
  });

  describe('normalizeEmail', () => {
    it('should lowercase email', () => {
      expect(normalizeEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('should handle empty string', () => {
      expect(normalizeEmail('')).toBe('');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should normalize whitespace', () => {
      const input = 'hello    world';
      expect(sanitizeSearchQuery(input)).toBe('hello world');
    });

    it('should limit length', () => {
      const input = 'a'.repeat(300);
      expect(sanitizeSearchQuery(input)).toHaveLength(200);
    });

    it('should remove control characters', () => {
      const input = 'search\x00term';
      expect(sanitizeSearchQuery(input)).toBe('searchterm');
    });
  });

  describe('containsXssVectors', () => {
    const xssVectors = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><script>alert(1)</script>',
      "javascript:alert('XSS')",
      '<svg onload=alert(1)>',
      '<iframe src="evil.com">',
      '<embed src="evil.swf">',
      '<object data="evil.swf">',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
    ];

    xssVectors.forEach((vector, index) => {
      it(`should detect XSS vector ${index + 1}`, () => {
        expect(containsXssVectors(vector)).toBe(true);
      });
    });

    it('should not flag normal text', () => {
      expect(containsXssVectors('Hello World')).toBe(false);
      expect(containsXssVectors('script')).toBe(false);
      expect(containsXssVectors('onclick')).toBe(false); // Just the word
    });

    it('should detect onclick=', () => {
      expect(containsXssVectors('onclick=alert(1)')).toBe(true);
      expect(containsXssVectors('ONCLICK = alert(1)')).toBe(true);
    });
  });

  describe('sanitizeJsonString', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World';
      const result = sanitizeJsonString(input);
      expect(result).not.toContain('\x00');
    });

    it('should preserve valid whitespace', () => {
      const input = 'Hello\nWorld\tTest';
      expect(sanitizeJsonString(input)).toBe('Hello\nWorld\tTest');
    });
  });

  describe('slugify', () => {
    it('should create URL-safe slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify("Hello! What's up?")).toBe('hello-whats-up');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(slugify('--Hello World--')).toBe('hello-world');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const input = 'This is a very long string';
      const result = truncate(input, 10);
      expect(result).toBe('This is...');
      expect(result.length).toBe(10);
    });

    it('should not truncate short strings', () => {
      const input = 'Short';
      expect(truncate(input, 10)).toBe('Short');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });
  });
});

describe('XSS Prevention Integration', () => {
  const xssAttacks = [
    { name: 'Basic script tag', payload: '<script>alert("xss")</script>' },
    { name: 'Event handler', payload: '<img src=x onerror=alert(1)>' },
    { name: 'SVG attack', payload: '<svg onload=alert(1)>' },
    { name: 'JavaScript URL', payload: '<a href="javascript:alert(1)">' },
    { name: 'Data URL', payload: '<img src="data:text/html,<script>alert(1)</script>">' },
    { name: 'Template injection', payload: '{{constructor.constructor("alert(1)")()}}' },
    { name: 'Unicode escape', payload: '<script>alert\u0028"XSS"\u0029</script>' },
    { name: 'Base64 script', payload: '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">' },
  ];

  xssAttacks.forEach(({ name, payload }) => {
    it(`should neutralize ${name}`, () => {
      const escaped = escapeHtml(payload);
      const stripped = stripTags(payload);
      
      // Escaped version should not contain executable code
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toMatch(/<img[^>]*onerror/);
      
      // Stripped version should not contain any tags
      expect(stripped).not.toMatch(/<[^>]*>/);
    });
  });
});
