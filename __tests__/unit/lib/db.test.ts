/**
 * @file db.test.ts
 * @description Tests for database client singleton
 */

// Use requireActual to get the real singleton, not the mock from jest.setup.ts
const db = jest.requireActual('@/lib/db').default;

describe('Database Client', () => {
  it('should export a valid Prisma client', () => {
    expect(db).toBeDefined();
    expect(typeof db.$connect).toBe('function');
    expect(typeof db.$disconnect).toBe('function');
  });

  it('should be a singleton', () => {
    // Import again to check if it's the same instance
    const db2 = jest.requireActual('@/lib/db').default;
    expect(db).toBe(db2);
  });
});
