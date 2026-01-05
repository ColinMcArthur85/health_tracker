# TDD Strategy for Health Journal

**Document Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Planning Phase

---

## 1. Current State Audit

### 1.1 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | App Router framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.22.0 | Database ORM |
| React | 19.2.0 | UI library |
| Tailwind CSS | 4.x | Styling |
| OpenAI | 6.9.1 | AI integration |

### 1.2 Current Test Status

| Item | Status | Notes |
|------|--------|-------|
| Test framework | ❌ Not installed | No Jest/Vitest configured |
| Unit tests | ❌ None | No test files found |
| Integration tests | ❌ None | No test files found |
| API tests | ❌ None | No test files found |
| E2E tests | ❌ None | No Playwright/Cypress |

### 1.3 Files Requiring Tests

| Category | Files | Priority |
|----------|-------|----------|
| API Routes | `/app/api/**/*.ts` | High |
| Utilities | `/lib/*.ts`, `/app/lib/*.ts` | High |
| Components | `/app/components/**/*.tsx` | Medium |
| Pages | `/app/dashboard/**/*.tsx` | Low |

---

## 2. Target State Configuration

### 2.1 Jest Configuration

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const customJestConfig = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/*.test.[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  
  // Performance
  verbose: true,
  maxWorkers: '50%',
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};

module.exports = createJestConfig(customJestConfig);
```

### 2.2 Jest Setup File

Create `jest.setup.ts`:

```typescript
/**
 * Jest Global Setup
 * Runs before each test file
 */
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    dailyLog: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    photo: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    workout: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    nutrition: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    checkIn: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    protocol: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    dream: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Custom matchers
expect.extend({
  toBeValidApiResponse(received) {
    const hasStatus = typeof received.status === 'number';
    const hasBody = received.body !== undefined;
    
    return {
      pass: hasStatus && hasBody,
      message: () => `expected valid API response with status and body, got ${JSON.stringify(received)}`,
    };
  },
});
```

### 2.3 Mock Files

Create `__mocks__/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
```

---

## 3. Test Directory Structure

```
health_journal/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── validation.test.ts
│   │   │   ├── sanitize.test.ts
│   │   │   └── prisma.test.ts
│   │   └── components/
│   │       ├── EmptyState.test.tsx
│   │       ├── StatCard.test.tsx
│   │       └── PhotoGallery.test.tsx
│   ├── api/
│   │   ├── log.test.ts
│   │   ├── photos.test.ts
│   │   ├── upload.test.ts
│   │   ├── protocols.test.ts
│   │   └── chat.test.ts
│   ├── integration/
│   │   ├── daily-log-flow.test.ts
│   │   ├── photo-upload-flow.test.ts
│   │   ├── nutrition-tracking.test.ts
│   │   └── demo-mode.test.ts
│   └── security/
│       ├── xss-prevention.test.ts
│       ├── auth-protection.test.ts
│       └── input-validation.test.ts
├── jest.config.js
├── jest.setup.ts
└── __mocks__/
    └── prisma.ts
```

---

## 4. Test Templates

### 4.1 Unit Test Template (TypeScript)

```typescript
/**
 * @file utility-name.test.ts
 * @description Unit tests for UtilityName
 *
 * TDD Cycle: RED → GREEN → REFACTOR
 */

import { functionUnderTest } from '@/lib/utility-name';

describe('UtilityName', () => {
  // Setup & Teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Group by feature/behavior
  describe('featureName', () => {
    // Happy path
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = { /* test data */ };
      const expected = { /* expected result */ };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toEqual(expected);
    });

    // Edge cases
    it('should handle empty input gracefully', () => {
      expect(() => functionUnderTest(null)).not.toThrow();
    });

    // Error cases
    it('should throw [ErrorType] when [invalid condition]', () => {
      expect(() => functionUnderTest(invalidInput)).toThrow(ExpectedError);
    });
  });

  // Security tests (mandatory for input handling)
  describe('security', () => {
    it('should sanitize HTML in user input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const result = functionUnderTest(maliciousInput);
      expect(result).not.toContain('<script>');
    });
  });
});
```

### 4.2 API Route Test Template

```typescript
/**
 * @file api-route.test.ts
 * @description Tests for API Route
 */

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/resource/route';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('API: /api/resource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/resource', () => {
    it('should return 200 with data', async () => {
      // Arrange
      const mockData = [{ id: '1', name: 'Test' }];
      mockPrisma.resource.findMany.mockResolvedValue(mockData);

      const request = new NextRequest('http://localhost/api/resource');

      // Act
      const response = await GET(request);
      const json = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(json).toEqual(mockData);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.resource.findMany.mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest('http://localhost/api/resource');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/resource', () => {
    it('should return 400 when required fields missing', async () => {
      const request = new NextRequest('http://localhost/api/resource', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 201 on successful creation', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockPrisma.resource.create.mockResolvedValue(mockData);

      const request = new NextRequest('http://localhost/api/resource', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Security', () => {
    it('should sanitize input to prevent XSS', async () => {
      const maliciousInput = { name: '<script>alert(1)</script>' };
      
      const request = new NextRequest('http://localhost/api/resource', {
        method: 'POST',
        body: JSON.stringify(maliciousInput),
      });

      await POST(request);

      // Verify sanitized input was passed to database
      expect(mockPrisma.resource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ name: maliciousInput.name }),
        })
      );
    });

    it('should validate input types', async () => {
      const invalidInput = { name: 12345 }; // Should be string
      
      const request = new NextRequest('http://localhost/api/resource', {
        method: 'POST',
        body: JSON.stringify(invalidInput),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

### 4.3 React Component Test Template

```typescript
/**
 * @file Component.test.tsx
 * @description Tests for React Component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '@/app/components/ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    title: 'Test Title',
    onAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with required props', () => {
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <ComponentName {...defaultProps}>
          <span>Child content</span>
        </ComponentName>
      );
      
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onAction when button clicked', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(defaultProps.onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have accessible button labels', () => {
      render(<ComponentName {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      
      await user.tab();
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onAction).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty title gracefully', () => {
      render(<ComponentName {...defaultProps} title="" />);
      
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should handle loading state', () => {
      render(<ComponentName {...defaultProps} isLoading />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
```

---

## 5. Coverage Goals Roadmap

### Phase 1: Foundation (Week 1-2)

| Target | Current | Goal | Priority |
|--------|---------|------|----------|
| `lib/prisma.ts` | 0% | 80% | High |
| `lib/validation.ts` | 0% | 90% | High |
| `lib/sanitize.ts` | 0% | 100% | High |

### Phase 2: API Routes (Week 3-4)

| Target | Current | Goal | Priority |
|--------|---------|------|----------|
| `/api/log/*` | 0% | 80% | High |
| `/api/photos/*` | 0% | 80% | High |
| `/api/upload/*` | 0% | 80% | High |
| `/api/chat/*` | 0% | 70% | Medium |
| `/api/protocols/*` | 0% | 70% | Medium |

### Phase 3: Components (Week 5-6)

| Target | Current | Goal | Priority |
|--------|---------|------|----------|
| `EmptyState` | 0% | 80% | Medium |
| `StatCard` | 0% | 80% | Medium |
| `PhotoGallery` | 0% | 70% | Medium |
| Form components | 0% | 70% | Medium |

### Phase 4: Security & Integration (Ongoing)

| Target | Current | Goal | Priority |
|--------|---------|------|----------|
| XSS prevention | 0% | 100% | Critical |
| Input validation | 0% | 100% | Critical |
| Auth protection | 0% | 100% | Critical |
| Error handling | 0% | 80% | High |

---

## 6. NPM Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default",
    "test:unit": "jest --testPathPattern='__tests__/unit'",
    "test:api": "jest --testPathPattern='__tests__/api'",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:security": "jest --testPathPattern='__tests__/security'"
  }
}
```

---

## 7. TDD Workflow Checklist

For each new feature or bug fix:

- [ ] **1. Write the failing test first** (RED)
  - Define expected behavior
  - Run `npm test` — confirm test fails

- [ ] **2. Write minimal implementation** (GREEN)
  - Only enough code to pass
  - Run `npm test` — confirm test passes

- [ ] **3. Refactor** (REFACTOR)
  - Improve code quality
  - Run `npm test` — confirm tests still pass

- [ ] **4. Add edge cases**
  - Empty input
  - Invalid types
  - Boundary values

- [ ] **5. Add security tests**
  - XSS vectors
  - Injection attempts
  - Auth bypass attempts

- [ ] **6. Run coverage report**
  - `npm run test:coverage`
  - Ensure thresholds met

---

## 8. Required Dependencies

```bash
# Core testing
npm install --save-dev jest @types/jest jest-environment-jsdom

# React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# TypeScript support
npm install --save-dev ts-jest

# Prisma mocking
npm install --save-dev jest-mock-extended

# API testing utilities
npm install --save-dev node-mocks-http
```

---

## Next Steps

1. → Proceed to `02_SECURITY_HARDENING.md` for security implementation plan
2. → Install testing dependencies
3. → Create Jest configuration files
4. → Create first unit tests for validation utilities
