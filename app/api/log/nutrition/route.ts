import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUTCMidnight } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { date, mode, meal, calories, protein } = data;

    const dailyLog = await db.dailyLog.upsert({
      where: { date: getUTCMidnight(date) },
      update: {},
      create: { date: getUTCMidnight(date) },
    });

    if (mode === 'quick') {
      // Append to mealsJson
      const existing = await db.nutrition.findUnique({
        where: { dailyLogId: dailyLog.id },
      });

      let meals = [];
      if (existing?.mealsJson) {
        try {
          meals = JSON.parse(existing.mealsJson);
          if (!Array.isArray(meals)) meals = [existing.mealsJson]; // Handle legacy string format if any
        } catch (e) {
          meals = [];
        }
      }
      
      meals.push({ item: meal, time: new Date().toISOString() });

      await db.nutrition.upsert({
        where: { dailyLogId: dailyLog.id },
        update: { mealsJson: JSON.stringify(meals) },
        create: { dailyLogId: dailyLog.id, mealsJson: JSON.stringify(meals) },
      });
    } else {
      // Update macros
      await db.nutrition.upsert({
        where: { dailyLogId: dailyLog.id },
        update: { 
          calories: calories ? parseInt(calories) : undefined,
          protein: protein ? parseInt(protein) : undefined,
        },
        create: { 
          dailyLogId: dailyLog.id, 
          calories: calories ? parseInt(calories) : undefined,
          protein: protein ? parseInt(protein) : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
