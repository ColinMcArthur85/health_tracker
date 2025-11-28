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

    const checkIn = await db.checkIn.update({
      where: { id },
      data: {
        sleepHours: data.sleepHours,
        weight: data.weight,
        water: data.water,
        caffeine: data.caffeine,
        alcohol: data.alcohol,
        supplements: data.supplements,
        pain: data.pain,
        notes: data.notes,
      },
    });

    return NextResponse.json({ success: true, checkIn });
  } catch (error) {
    console.error('Error updating check-in:', error);
    return NextResponse.json({ error: 'Failed to update check-in' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await db.checkIn.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting check-in:', error);
    return NextResponse.json({ error: 'Failed to delete check-in' }, { status: 500 });
  }
}
