import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUTCMidnight } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { date, mode, meal, calories, protein, carbs, fat, fiber, foodItems } = data;

    const dailyLog = await db.dailyLog.upsert({
      where: { date: getUTCMidnight(date) },
      update: {},
      create: { date: getUTCMidnight(date) },
    });

    if (mode === 'quick') {
      // Append to mealsJson (legacy quick-add mode)
      const existing = await db.nutrition.findUnique({
        where: { dailyLogId: dailyLog.id },
      });

      let meals = [];
      if (existing?.mealsJson) {
        try {
          meals = JSON.parse(existing.mealsJson);
          if (!Array.isArray(meals)) meals = [existing.mealsJson];
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
      // Get existing nutrition to accumulate values
      const existing = await db.nutrition.findUnique({
        where: { dailyLogId: dailyLog.id },
      });

      // Calculate new totals by adding to existing values
      const newCalories = (existing?.calories || 0) + (calories ? parseInt(calories) : 0);
      const newProtein = (existing?.protein || 0) + (protein ? parseInt(protein) : 0);
      const newCarbs = (existing?.carbs || 0) + (carbs ? parseInt(carbs) : 0);
      const newFat = (existing?.fat || 0) + (fat ? parseInt(fat) : 0);
      const newFiber = (existing?.fiber || 0) + (fiber ? parseInt(fiber) : 0);

      // Update macros with accumulated values
      const nutrition = await db.nutrition.upsert({
        where: { dailyLogId: dailyLog.id },
        update: { 
          calories: newCalories,
          protein: newProtein,
          carbs: newCarbs,
          fat: newFat,
          fiber: newFiber,
        },
        create: { 
          dailyLogId: dailyLog.id, 
          calories: newCalories,
          protein: newProtein,
          carbs: newCarbs,
          fat: newFat,
          fiber: newFiber,
        },
      });

      // Create food items if provided (from USDA API)
      if (foodItems && Array.isArray(foodItems) && foodItems.length > 0) {
        await db.foodItem.createMany({
          data: foodItems.map((item: any) => ({
            nutritionId: nutrition.id,
            name: item.name,
            fdcId: item.fdcId,
            servingSize: item.servingSize,
            servingUnit: item.servingUnit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
