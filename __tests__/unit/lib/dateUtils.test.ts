/**
 * @file dateUtils.test.ts
 * @description Tests for UTC date utility functions
 */

import { getUTCMidnight, formatUTCDate, formatUTCDateLong } from '@/lib/dateUtils';

describe('Date Utilities', () => {
  describe('getUTCMidnight', () => {
    it('should convert YYYY-MM-DD string to UTC midnight Date object', () => {
      const dateString = '2025-11-27';
      const result = getUTCMidnight(dateString);
      
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(10); // November is 10 (0-indexed)
      expect(result.getUTCDate()).toBe(27);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('should handle different dates correctly', () => {
      const result = getUTCMidnight('2024-02-29'); // Leap year
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(1); // February
      expect(result.getUTCDate()).toBe(29);
    });
  });

  describe('formatUTCDate', () => {
    it('should format Date object to YYYY-MM-DD string', () => {
      const date = new Date(Date.UTC(2025, 10, 27));
      expect(formatUTCDate(date)).toBe('2025-11-27');
    });

    it('should pad single digit days and months', () => {
      const date = new Date(Date.UTC(2025, 0, 5)); // January 5th
      expect(formatUTCDate(date)).toBe('2025-01-05');
    });
  });

  describe('formatUTCDateLong', () => {
    it('should format Date object to long readable string', () => {
      const date = new Date(Date.UTC(2025, 10, 26)); // Nov 26 is Wednesday
      expect(formatUTCDateLong(date)).toBe('Wednesday, November 26th, 2025');
    });

    it('should handle 1st, 2nd, 3rd suffixes correctly', () => {
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 1)))).toContain('January 1st');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 2)))).toContain('January 2nd');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 3)))).toContain('January 3rd');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 4)))).toContain('January 4th');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 11)))).toContain('January 11th');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 21)))).toContain('January 21st');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 22)))).toContain('January 22nd');
      expect(formatUTCDateLong(new Date(Date.UTC(2025, 0, 23)))).toContain('January 23rd');
    });
  });
});
