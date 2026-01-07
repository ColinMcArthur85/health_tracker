/**
 * @jest-environment node
 */

/**
 * @file nutrition.test.ts
 * @description API tests for /api/log/nutrition route
 * 
 * BDD Scenarios:
 * - Given valid quick mode data, When POST, Then create nutrition entry with meal
 * - Given valid macros mode data, When POST, Then update calories and protein
 * - Given missing date, When POST, Then return 500 error
 */

// Mock db before importing route
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    dailyLog: {
      upsert: jest.fn(),
    },
    nutrition: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { POST } from '@/api/log/nutrition/route';
import db from '@/lib/db';

describe('POST /api/log/nutrition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quick Mode', () => {
    it('should create a new nutrition entry with meal in quick mode', async () => {
      const mockDailyLog = { id: 'log-123' };
      const mockNutrition = null; // No existing nutrition

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.nutrition.findUnique as jest.Mock).mockResolvedValue(mockNutrition);
      (db.nutrition.upsert as jest.Mock).mockResolvedValue({ id: 'nutrition-123' });

      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          mode: 'quick',
          meal: 'Grilled chicken with vegetables',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.dailyLog.upsert).toHaveBeenCalled();
      expect(db.nutrition.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dailyLogId: 'log-123' },
          update: expect.objectContaining({
            mealsJson: expect.stringContaining('Grilled chicken with vegetables'),
          }),
        })
      );
    });

    it('should append to existing meals in quick mode', async () => {
      const mockDailyLog = { id: 'log-123' };
      const existingMeals = [{ item: 'Breakfast oats', time: '2026-01-06T08:00:00Z' }];
      const mockNutrition = { mealsJson: JSON.stringify(existingMeals) };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.nutrition.findUnique as jest.Mock).mockResolvedValue(mockNutrition);
      (db.nutrition.upsert as jest.Mock).mockResolvedValue({ id: 'nutrition-123' });

      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          mode: 'quick',
          meal: 'Lunch sandwich',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify the meals array was appended to
      const upsertCall = (db.nutrition.upsert as jest.Mock).mock.calls[0][0];
      const updatedMeals = JSON.parse(upsertCall.update.mealsJson);
      expect(updatedMeals).toHaveLength(2);
      expect(updatedMeals[0].item).toBe('Breakfast oats');
      expect(updatedMeals[1].item).toBe('Lunch sandwich');
    });
  });

  describe('Macros Mode', () => {
    it('should update calories and protein in macros mode', async () => {
      const mockDailyLog = { id: 'log-456' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.nutrition.upsert as jest.Mock).mockResolvedValue({ id: 'nutrition-456' });

      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          mode: 'macros',
          calories: '2000',
          protein: '150',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.nutrition.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dailyLogId: 'log-456' },
          update: {
            calories: 2000,
            protein: 150,
          },
        })
      );
    });

    it('should handle partial macros (only calories)', async () => {
      const mockDailyLog = { id: 'log-789' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.nutrition.upsert as jest.Mock).mockResolvedValue({ id: 'nutrition-789' });

      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          mode: 'macros',
          calories: '1500',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.nutrition.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            calories: 1500,
            protein: undefined,
          },
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database operation fails', async () => {
      (db.dailyLog.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          mode: 'quick',
          meal: 'Test meal',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
    });

    it('should handle invalid JSON body', async () => {
      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should handle malformed existing mealsJson gracefully', async () => {
      const mockDailyLog = { id: 'log-999' };
      const mockNutrition = { mealsJson: 'not valid json{' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.nutrition.findUnique as jest.Mock).mockResolvedValue(mockNutrition);
      (db.nutrition.upsert as jest.Mock).mockResolvedValue({ id: 'nutrition-999' });

      const request = new Request('http://localhost/api/log/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          mode: 'quick',
          meal: 'New meal',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should start fresh with empty array when parsing fails
      const upsertCall = (db.nutrition.upsert as jest.Mock).mock.calls[0][0];
      const updatedMeals = JSON.parse(upsertCall.update.mealsJson);
      expect(updatedMeals).toHaveLength(1);
      expect(updatedMeals[0].item).toBe('New meal');
    });
  });
});
