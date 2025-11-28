import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUTCMidnight } from '@/lib/dateUtils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('q')?.trim() || '';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const type = searchParams.get('type');
    const intensity = searchParams.get('intensity');

    const startDate = start ? getUTCMidnight(start) : undefined;
    const endDate = end ? getUTCMidnight(end) : undefined;
    if (endDate) endDate.setUTCHours(23, 59, 59, 999);

    const workouts = await db.workout.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(intensity ? { intensity } : {}),
        ...(keyword
          ? {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { type: { contains: keyword, mode: 'insensitive' } },
                { instructor: { contains: keyword, mode: 'insensitive' } },
                { platform: { contains: keyword, mode: 'insensitive' } },
                { focusArea: { contains: keyword, mode: 'insensitive' } },
                { notes: { contains: keyword, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(startDate || endDate
          ? {
              dailyLog: {
                date: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              },
            }
          : {}),
      },
      include: {
        dailyLog: true,
      },
      orderBy: {
        dailyLog: { date: 'desc' },
      },
      take: 100,
    });

    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    return NextResponse.json({
      filters: { keyword, start, end, type, intensity },
      summary: {
        count: workouts.length,
        totalDuration,
      },
      workouts,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to run search' }, { status: 500 });
  }
}
