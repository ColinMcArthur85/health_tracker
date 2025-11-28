import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUTCMidnight } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { date, weight, sleep, mood } = data;

    const dailyLog = await db.dailyLog.upsert({
      where: { date: getUTCMidnight(date) },
      update: {},
      create: { date: getUTCMidnight(date) },
    });

    await db.checkIn.upsert({
      where: { dailyLogId: dailyLog.id },
      update: {
        weight: weight ? parseFloat(weight) : undefined,
        sleepHours: sleep ? parseFloat(sleep) : undefined,
      },
      create: {
        dailyLogId: dailyLog.id,
        weight: weight ? parseFloat(weight) : undefined,
        sleepHours: sleep ? parseFloat(sleep) : undefined,
      },
    });

    if (mood) {
      await db.reflection.create({
        data: {
          dailyLogId: dailyLog.id,
          mood: mood,
          type: 'Check-In',
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
