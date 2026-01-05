import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUTCMidnight } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { date, url, caption } = data;

    const dailyLog = await db.dailyLog.upsert({
      where: { date: getUTCMidnight(date) },
      update: {},
      create: { date: getUTCMidnight(date) },
    });

    await db.photo.create({
      data: {
        dailyLogId: dailyLog.id,
        url,
        view: data.view || 'FRONT',
        caption,
      } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
