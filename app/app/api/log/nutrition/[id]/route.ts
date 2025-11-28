import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await req.json();

    const nutrition = await db.nutrition.update({
      where: { id },
      data: {
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        mealsJson: data.mealsJson,
        microsJson: data.microsJson,
      },
    });

    return NextResponse.json({ success: true, nutrition });
  } catch (error) {
    console.error('Error updating nutrition:', error);
    return NextResponse.json({ error: 'Failed to update nutrition' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await db.nutrition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting nutrition:', error);
    return NextResponse.json({ error: 'Failed to delete nutrition' }, { status: 500 });
  }
}
