import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ foodId: string }> }
) {
  try {
    const { foodId } = await params;
    
    // Get the food item to find its nutrition record
    const foodItem = await db.foodItem.findUnique({
      where: { id: foodId },
      include: {
        nutrition: true,
      },
    });

    if (!foodItem) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }

    // Get all food items for this nutrition record to recalculate totals
    const allFoodItems = await db.foodItem.findMany({
      where: { nutritionId: foodItem.nutritionId },
    });

    // Calculate new totals excluding the item being deleted
    const newTotals = allFoodItems
      .filter(item => item.id !== foodId)
      .reduce(
        (acc, item) => ({
          calories: acc.calories + (item.calories || 0),
          protein: acc.protein + (item.protein || 0),
          carbs: acc.carbs + (item.carbs || 0),
          fat: acc.fat + (item.fat || 0),
          fiber: acc.fiber + (item.fiber || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

    // Delete the food item
    await db.foodItem.delete({
      where: { id: foodId },
    });

    // Update the nutrition totals
    await db.nutrition.update({
      where: { id: foodItem.nutritionId },
      data: {
        calories: newTotals.calories,
        protein: newTotals.protein,
        carbs: newTotals.carbs,
        fat: newTotals.fat,
        fiber: newTotals.fiber,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
