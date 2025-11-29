import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const dreams = await prisma.dream.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        dailyLog: {
          select: {
            date: true,
          }
        }
      }
    });

    return NextResponse.json(dreams);
  } catch (error) {
    console.error('Error fetching dreams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dreams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, mood, tags, date } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // First find or create the DailyLog for the given date
    // Date should be in YYYY-MM-DD format
    const logDate = date ? new Date(date) : new Date();
    // Normalize to start of day UTC to match other logs if needed, 
    // but for now let's assume the client sends a valid ISO string or we use current time.
    // Actually, DailyLog expects a unique date. Let's try to find one for "today" or the passed date.
    
    // For simplicity in this v1, let's assume we attach to "today's" log or create it.
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);

    let dailyLog = await prisma.dailyLog.findUnique({
      where: {
        date: startOfDay,
      },
    });

    if (!dailyLog) {
      dailyLog = await prisma.dailyLog.create({
        data: {
          date: startOfDay,
        },
      });
    }

    const dream = await prisma.dream.create({
      data: {
        dailyLogId: dailyLog.id,
        content,
        mood,
        tags,
      },
    });

    return NextResponse.json(dream);
  } catch (error) {
    console.error('Error creating dream:', error);
    return NextResponse.json(
      { error: 'Failed to create dream' },
      { status: 500 }
    );
  }
}
