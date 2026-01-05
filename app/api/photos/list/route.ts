import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const photos = (await db.photo.findMany({
      include: {
        dailyLog: true,
      },
      orderBy: [
        { dailyLog: { date: 'desc' } },
        { view: 'asc' } as any
      ],
    })) as any[];

    return NextResponse.json(photos);
  } catch (error) {
    console.error('List photos error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
