/**
 * @jest-environment node
 */

/**
 * @file workout.test.ts
 * @description API tests for /api/log/workout route
 * 
 * BDD Scenarios:
 * - Given valid workout data, When POST, Then create workout entry
 * - Given workout with all fields, When POST, Then save all workout details
 * - Given missing date, When POST, Then return 500 error
 */

// Mock db before importing route
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    dailyLog: {
      upsert: jest.fn(),
    },
    workout: {
      create: jest.fn(),
    },
  },
}));

import { POST } from '@/api/log/workout/route';
import db from '@/lib/db';

describe('POST /api/log/workout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Creation', () => {
    it('should create a new workout entry with basic data', async () => {
      const mockDailyLog = { id: 'log-123' };
      const mockWorkout = { id: 'workout-123', type: 'Strength' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.workout.create as jest.Mock).mockResolvedValue(mockWorkout);

      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          type: 'Strength',
          duration: 45,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.dailyLog.upsert).toHaveBeenCalled();
      expect(db.workout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dailyLogId: 'log-123',
          type: 'Strength',
          duration: 45,
        }),
      });
    });

    it('should create workout with all fields', async () => {
      const mockDailyLog = { id: 'log-456' };
      const mockWorkout = { id: 'workout-456' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.workout.create as jest.Mock).mockResolvedValue(mockWorkout);

      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          type: 'HIIT',
          duration: 30,
          intensity: 'Very High',
          notes: 'Great session, hit all targets',
          name: 'Morning HIIT',
          instructor: 'Coach Mike',
          platform: 'Peloton',
          focusArea: 'Full Body',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.workout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dailyLogId: 'log-456',
          type: 'HIIT',
          duration: 30,
          intensity: 'Very High',
          notes: 'Great session, hit all targets',
          name: 'Morning HIIT',
          instructor: 'Coach Mike',
          platform: 'Peloton',
          focusArea: 'Full Body',
        }),
      });
    });

    it('should create workout with minimal data (just date)', async () => {
      const mockDailyLog = { id: 'log-789' };
      const mockWorkout = { id: 'workout-789' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.workout.create as jest.Mock).mockResolvedValue(mockWorkout);

      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.workout.create).toHaveBeenCalledWith({
        data: {
          dailyLogId: 'log-789',
        },
      });
    });
  });

  describe('Date Handling', () => {
    it('should create daily log if it does not exist', async () => {
      const mockDailyLog = { id: 'new-log-123' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.workout.create as jest.Mock).mockResolvedValue({ id: 'workout-new' });

      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-02-15',
          type: 'Yoga',
        }),
      });

      await POST(request);

      expect(db.dailyLog.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.any(Date),
          }),
          update: {},
          create: expect.objectContaining({
            date: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database operation fails', async () => {
      (db.dailyLog.upsert as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          type: 'Running',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
    });

    it('should return 500 when workout creation fails', async () => {
      const mockDailyLog = { id: 'log-error' };

      (db.dailyLog.upsert as jest.Mock).mockResolvedValue(mockDailyLog);
      (db.workout.create as jest.Mock).mockRejectedValue(new Error('Workout creation failed'));

      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: JSON.stringify({
          date: '2026-01-06',
          type: 'Swimming',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
    });

    it('should handle invalid JSON body', async () => {
      const request = new Request('http://localhost/api/log/workout', {
        method: 'POST',
        body: 'not valid json',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });
});
