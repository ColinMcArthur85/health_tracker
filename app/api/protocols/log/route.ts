import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { protocolId, date, taken, headache, anxiety, sleepQuality, mood, notes } = body;

    // Find or create the daily log for today to link the protocol log
    const logDate = new Date(date);
    logDate.setUTCHours(0, 0, 0, 0);

    let dailyLog = await db.dailyLog.findUnique({
      where: { date: logDate },
    });

    if (!dailyLog) {
      dailyLog = await db.dailyLog.create({
        data: { date: logDate },
      });
    }

    const protocolLog = await db.protocolLog.create({
      data: {
        protocolId,
        dailyLogId: dailyLog.id,
        date: new Date(date),
        taken,
        headache,
        anxiety,
        sleepQuality,
        mood,
        notes,
      },
      include: {
        protocol: true,
      }
    });

    return NextResponse.json(protocolLog);
  } catch (error) {
    console.error('Error logging protocol dose:', error);
    return NextResponse.json({ error: 'Failed to log dose' }, { status: 500 });
  }
}
