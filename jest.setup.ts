/**
 * Jest Global Setup
 * Runs before each test file
 */
import '@testing-library/jest-dom';
// React is used implicitly by JSX in some mocks, but if lint complains about unused import, we can remove it
// if it's already available globally or imported inside mock factories.

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: function MockImage(props: { src: string; alt: string; [key: string]: unknown }) {
    // Return a simple object that React Testing Library can handle
    return { type: 'img', props };
  },
}));

// Mock Prisma client (exported as 'db' from lib/db.ts)
// Will be overridden in specific tests as needed
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    dailyLog: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    photo: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    workout: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    nutrition: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    foodItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    checkIn: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    protocol: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    protocolLog: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    dream: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    reflection: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    measurement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    medication: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn({
      // Provide mocked client for transactions
    })),
  },
}));

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock environment variables (safe test values)
process.env.OPENAI_API_KEY = 'test-openai-key-not-real';
process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token-not-real';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Reset fetch mock before each test
beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

// Custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidApiResponse(): R;
    }
  }
}

expect.extend({
  toBeValidApiResponse(received: { status?: number; body?: unknown }) {
    const hasStatus = typeof received?.status === 'number';
    const hasBody = received?.body !== undefined;
    
    return {
      pass: hasStatus,
      message: () => 
        hasStatus 
          ? `expected response not to have a valid status, but got ${received.status}`
          : `expected response to have a numeric status, but got ${typeof received?.status}`,
    };
  },
});
