# Security Hardening Plan for Health Journal

**Document Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Planning Phase  
**Classification:** DevSecOps

---

## 1. Executive Summary

This document outlines a comprehensive security hardening strategy for the Health Journal application, implementing OWASP best practices for Next.js applications with API routes and database access.

### Threat Model Overview

| Threat | Risk Level | Current Status | Mitigation |
|--------|------------|----------------|------------|
| Unauthorized Access | 🔴 High | ⚠️ No Auth | Implement NextAuth.js |
| XSS (Cross-Site Scripting) | 🟡 Medium | ✅ React escapes by default | Add CSP headers |
| SQL Injection | 🟢 Low | ✅ Prisma ORM | Parameterized queries |
| File Upload Abuse | 🟠 Medium | ⚠️ No validation | Add type/size validation |
| API Key Exposure | 🟢 Low | ✅ Server-side only | Verified in audit |
| CSRF | 🟠 Medium | ⚠️ No protection | Add NextAuth CSRF |
| Rate Limit Abuse | 🟠 Medium | ⚠️ No limiting | Add rate limiting |
| Data Exposure | 🔴 High | ⚠️ No API auth | Add auth middleware |

### Current Security Assessment

From existing audit `performance-security-audit.md`:
- ✅ `npm audit`: 0 vulnerabilities
- ✅ Environment variables properly stored
- ✅ No hardcoded API keys
- ✅ Using Prisma (SQL injection protected)
- ✅ React escapes user input
- ⚠️ API routes lack authentication
- ⚠️ No file upload validation
- ⚠️ No rate limiting

---

## 2. Authentication Implementation

### 2.1 NextAuth.js Setup

> **Priority:** 🔴 CRITICAL

Install dependencies:
```bash
npm install next-auth @auth/prisma-adapter
```

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Demo mode - allows read-only guest access
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Mode',
      credentials: {},
      async authorize() {
        return {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          isDemo: true,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.isDemo) {
        session.user.isDemo = true;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.isDemo) {
        token.isDemo = true;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 2.2 Auth Middleware

Create `middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isDemo = token?.isDemo;
    const pathname = req.nextUrl.pathname;

    // Demo users can't modify data
    if (isDemo && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return NextResponse.json(
        { error: 'Demo mode is read-only' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/log/:path*',
    '/api/photos/:path*',
    '/api/upload/:path*',
    '/api/protocols/:path*',
    '/api/chat/:path*',
  ],
};
```

### 2.3 Demo Mode Implementation

> **Purpose:** Allow recruiters to explore the app without seeing real data

Create `lib/demo-data.ts`:

```typescript
/**
 * Synthetic demo data for guest users
 * This data is read-only and resets daily
 */

export const DEMO_USER_ID = 'demo-user';

export const getDemoData = async () => {
  // Return pre-populated synthetic health data
  return {
    dailyLogs: generateDemoLogs(),
    photos: getDemoPhotos(),
    workouts: getDemoWorkouts(),
    nutrition: getDemoNutrition(),
  };
};

function generateDemoLogs() {
  // Generate 30 days of sample data
  const logs = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    logs.push({
      id: `demo-log-${i}`,
      date,
      rating: Math.random() * 2 + 3, // 3-5 range
    });
  }
  return logs;
}

// ... other demo data generators
```

---

## 3. HTTP Security Headers

### 3.1 Next.js Headers Configuration

Update `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.openai.com https://*.blob.vercel-storage.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        // API routes - stricter
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 4. Input Validation & Sanitization

### 4.1 Zod Validation Schemas

Create `lib/validation.ts`:

```typescript
import { z } from 'zod';

/**
 * Input validation schemas using Zod
 * All API inputs should be validated before processing
 */

// Common schemas
export const uuidSchema = z.string().uuid('Invalid ID format');

export const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
});

// Daily Log
export const createDailyLogSchema = z.object({
  date: dateSchema,
  rating: z.number().min(1).max(5).optional(),
});

// Workout
export const createWorkoutSchema = z.object({
  dailyLogId: uuidSchema,
  name: z.string().min(1).max(200).optional(),
  instructor: z.string().max(100).optional(),
  platform: z.string().max(100).optional(),
  duration: z.number().int().min(1).max(600).optional(), // Max 10 hours
  type: z.enum(['Mobility', 'Strength', 'Cardio', 'Yoga', 'Other']).optional(),
  focusArea: z.string().max(100).optional(),
  intensity: z.enum(['Low', 'Moderate', 'High']).optional(),
  notes: z.string().max(2000).optional(),
});

// Photo
export const createPhotoSchema = z.object({
  dailyLogId: uuidSchema,
  url: z.string().url(),
  view: z.enum(['FRONT', 'SIDE', 'BACK']).default('FRONT'),
  caption: z.string().max(500).optional(),
});

// Nutrition
export const createNutritionSchema = z.object({
  dailyLogId: uuidSchema,
  calories: z.number().int().min(0).max(10000).optional(),
  protein: z.number().int().min(0).max(500).optional(),
  carbs: z.number().int().min(0).max(1000).optional(),
  fat: z.number().int().min(0).max(500).optional(),
  fiber: z.number().int().min(0).max(100).optional(),
});

// Check-in
export const createCheckInSchema = z.object({
  dailyLogId: uuidSchema,
  sleepHours: z.number().min(0).max(24).optional(),
  weight: z.number().min(50).max(500).optional(), // lbs reasonable range
  water: z.number().int().min(0).max(10000).optional(), // ml
  caffeine: z.string().max(200).optional(),
  alcohol: z.string().max(200).optional(),
  supplements: z.string().max(500).optional(),
  pain: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

// Dream
export const createDreamSchema = z.object({
  dailyLogId: uuidSchema,
  content: z.string().min(1).max(5000),
  mood: z.string().max(50).optional(),
  tags: z.string().max(200).optional(),
});

// Chat message
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.string().max(10000).optional(),
});

// File upload
export const fileUploadSchema = z.object({
  filename: z.string().max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  size: z.number().int().max(10 * 1024 * 1024), // 10MB max
});

// Helper to validate and return parsed data or error response
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
```

### 4.2 Sanitization Utility

Create `lib/sanitize.ts`:

```typescript
/**
 * Input sanitization utilities
 * Use for additional safety beyond Prisma's parameterized queries
 */

/**
 * Escape HTML special characters
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

  return str.replace(/[&<>"'`=\/]/g, (char) => escapeMap[char]);
}

/**
 * Strip HTML tags from string
 */
export function stripTags(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Remove control characters
 */
export function removeControlChars(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitize user text input (for storage)
 */
export function sanitizeText(str: string): string {
  if (typeof str !== 'string') return '';
  return removeControlChars(str.trim());
}

/**
 * Sanitize for display (escapes HTML)
 */
export function sanitizeForDisplay(str: string): string {
  return escapeHtml(sanitizeText(str));
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}
```

### 4.3 API Route with Validation

Example: Update `/app/api/log/workout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { createWorkoutSchema, validateInput } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitize';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check demo mode
    if (session.user?.isDemo) {
      return NextResponse.json(
        { error: 'Demo mode is read-only' },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    const validation = validateInput(createWorkoutSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // 4. Sanitize text fields
    const data = {
      ...validation.data,
      name: validation.data.name ? sanitizeText(validation.data.name) : undefined,
      notes: validation.data.notes ? sanitizeText(validation.data.notes) : undefined,
    };

    // 5. Create record
    const workout = await prisma.workout.create({ data });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 5. File Upload Security

### 5.1 Upload Validation

Update `/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sanitizeFileName } from '@/lib/sanitize';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// Magic bytes for file type verification
const FILE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'image/heic': [0x00, 0x00, 0x00], // ftyp follows
};

async function verifyFileType(buffer: ArrayBuffer, declaredType: string): Promise<boolean> {
  const uint8 = new Uint8Array(buffer);
  const signature = FILE_SIGNATURES[declaredType];
  
  if (!signature) return false;
  
  for (let i = 0; i < signature.length; i++) {
    if (uint8[i] !== signature[i]) return false;
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.isDemo) {
      return NextResponse.json(
        { error: 'Demo mode cannot upload files' },
        { status: 403 }
      );
    }

    // 2. Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 4. Validate file type (declared)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC' },
        { status: 400 }
      );
    }

    // 5. Verify file type by magic bytes
    const buffer = await file.arrayBuffer();
    const isValidType = await verifyFileType(buffer, file.type);
    
    if (!isValidType) {
      return NextResponse.json(
        { error: 'File content does not match declared type' },
        { status: 400 }
      );
    }

    // 6. Sanitize filename
    const sanitizedName = sanitizeFileName(file.name);
    const uniqueName = `${Date.now()}-${sanitizedName}`;

    // 7. Upload to Vercel Blob
    const blob = await put(uniqueName, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

---

## 6. Rate Limiting

### 6.1 Upstash Redis Rate Limiting

Install:
```bash
npm install @upstash/ratelimit @upstash/redis
```

Create `lib/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a rate limiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// Stricter limit for AI endpoints (expensive)
const aiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 per minute
  prefix: 'ratelimit:ai',
});

export async function checkRateLimit(
  identifier: string,
  type: 'default' | 'ai' = 'default'
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = type === 'ai' ? aiRatelimit : ratelimit;
  const { success, remaining, reset } = await limiter.limit(identifier);
  
  return { success, remaining, reset };
}
```

Usage in API route:

```typescript
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Get identifier (IP or user ID)
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  // Check rate limit
  const { success, remaining } = await checkRateLimit(ip, 'ai');
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() }
      }
    );
  }
  
  // Continue with request...
}
```

---

## 7. Security Testing

### 7.1 Security Test Suite

Create `__tests__/security/xss-prevention.test.ts`:

```typescript
import { escapeHtml, stripTags, sanitizeText } from '@/lib/sanitize';

describe('XSS Prevention', () => {
  const xssVectors = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    "javascript:alert('XSS')",
    '<svg onload=alert(1)>',
    '{{constructor.constructor("alert(1)")()}}',
    '<div onmouseover="alert(1)">hover me</div>',
    '<a href="javascript:alert(1)">click</a>',
  ];

  describe('escapeHtml', () => {
    xssVectors.forEach((vector, index) => {
      it(`should neutralize XSS vector ${index + 1}`, () => {
        const result = escapeHtml(vector);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror=');
        expect(result).not.toContain('onload=');
        expect(result).not.toContain('onmouseover=');
      });
    });

    it('should escape all HTML special characters', () => {
      const input = '<div class="test" data-attr=\'value\'>&</div>';
      const result = escapeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
      expect(result).toContain('&amp;');
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
  });

  describe('sanitizeText', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F';
      expect(sanitizeText(input)).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      expect(sanitizeText('  test  ')).toBe('test');
    });
  });
});
```

### 7.2 Authentication Tests

Create `__tests__/security/auth-protection.test.ts`:

```typescript
import { testApiRoute } from '../utils/test-helpers';

describe('Authentication Protection', () => {
  const protectedRoutes = [
    { method: 'GET', path: '/api/log/daily' },
    { method: 'POST', path: '/api/log/workout' },
    { method: 'POST', path: '/api/upload' },
    { method: 'DELETE', path: '/api/photos/delete' },
    { method: 'POST', path: '/api/chat' },
  ];

  protectedRoutes.forEach(({ method, path }) => {
    it(`should return 401 for unauthenticated ${method} ${path}`, async () => {
      const response = await testApiRoute(path, {
        method,
        headers: {}, // No auth header
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Demo Mode Restrictions', () => {
    const writeRoutes = [
      { method: 'POST', path: '/api/log/workout' },
      { method: 'DELETE', path: '/api/photos/delete' },
      { method: 'POST', path: '/api/upload' },
    ];

    writeRoutes.forEach(({ method, path }) => {
      it(`should return 403 for demo user on ${method} ${path}`, async () => {
        const response = await testApiRoute(path, {
          method,
          headers: { 'x-demo-mode': 'true' },
        });

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toContain('read-only');
      });
    });
  });
});
```

---

## 8. Dependency Audit Strategy

### 8.1 NPM Audit Workflow

Current status from audit: ✅ 0 vulnerabilities

Add to `package.json`:
```json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "audit:ci": "npm audit --audit-level=high",
    "preinstall": "npm audit --audit-level=critical"
  }
}
```

### 8.2 GitHub Actions Security Workflow

Create `.github/workflows/security.yml`:

```yaml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 9 * * 1' # Weekly on Mondays

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Upload audit results
        uses: actions/upload-artifact@v4
        with:
          name: npm-audit-results
          path: audit-results.json
          retention-days: 30

  dependency-review:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - uses: actions/checkout@v4

      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        with:
          fail-on-severity: high
```

---

## 9. Implementation Checklist

### 🔴 Critical (Week 1)

- [ ] Install NextAuth.js
- [ ] Create auth configuration
- [ ] Create middleware for protected routes
- [ ] Implement demo mode
- [ ] Add security headers to next.config.ts

### 🟠 High Priority (Week 2)

- [ ] Install Zod for validation
- [ ] Create validation schemas
- [ ] Create sanitization utilities
- [ ] Update all API routes with validation
- [ ] Add file upload validation

### 🟡 Medium Priority (Week 3)

- [ ] Implement rate limiting
- [ ] Create security test suite
- [ ] Add GitHub Actions workflow
- [ ] Create Dependabot configuration

### 🟢 Ongoing

- [ ] Regular npm audit checks
- [ ] Monitor security advisories
- [ ] Update dependencies monthly

---

## Next Steps

1. → Proceed to `03_BDD_FEATURES.md` for feature specifications
2. → Install NextAuth.js and create auth configuration
3. → Add security headers to next.config.ts
4. → Create validation and sanitization utilities
