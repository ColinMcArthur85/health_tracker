import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Fetch all daily logs with related data
    const logs = await db.dailyLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        workouts: true,
        nutrition: true,
        checkIn: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate analytics
    const analytics = {
      dailyStats: logs.map(log => ({
        date: log.date,
        workoutCount: log.workouts.length,
        totalDuration: log.workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        calories: log.nutrition?.calories || null,
        protein: log.nutrition?.protein || null,
        carbs: log.nutrition?.carbs || null,
        fat: log.nutrition?.fat || null,
        weight: log.checkIn?.weight || null,
        sleep: log.checkIn?.sleepHours || null,
        water: log.checkIn?.water || null,
      })),
      
      workoutTypes: logs.reduce((acc, log) => {
        log.workouts.forEach(w => {
          const type = w.type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),

      totalWorkouts: logs.reduce((sum, log) => sum + log.workouts.length, 0),
      
      averages: {
        calories: calculateAverage(logs.map(l => l.nutrition?.calories).filter(Boolean)),
        protein: calculateAverage(logs.map(l => l.nutrition?.protein).filter(Boolean)),
        weight: calculateAverage(logs.map(l => l.checkIn?.weight).filter(Boolean)),
        sleep: calculateAverage(logs.map(l => l.checkIn?.sleepHours).filter(Boolean)),
        workoutsPerWeek: (logs.reduce((sum, log) => sum + log.workouts.length, 0) / days) * 7,
      },

      streak: calculateStreak(logs),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function calculateAverage(values: (number | null | undefined)[]): number | null {
  const validValues = values.filter((v): v is number => typeof v === 'number');
  if (validValues.length === 0) return null;
  return Math.round((validValues.reduce((sum, v) => sum + v, 0) / validValues.length) * 10) / 10;
}

function calculateStreak(logs: any[]): number {
  if (logs.length === 0) return 0;
  
  let streak = 0;
  const today = startOfDay(new Date());
  
  // Start from most recent and go backwards
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    const logDate = startOfDay(new Date(log.date));
    const expectedDate = subDays(today, streak);
    
    // Check if this log is for the expected date and has workouts
    if (logDate.getTime() === expectedDate.getTime() && log.workouts.length > 0) {
      streak++;
    } else if (logDate.getTime() < expectedDate.getTime()) {
      // We've gone past the expected date without finding a workout
      break;
    }
  }
  
  return streak;
}
