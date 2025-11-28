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

    const workout = await db.workout.update({
      where: { id },
      data: {
        name: data.name,
        instructor: data.instructor,
        platform: data.platform,
        duration: data.duration,
        type: data.type,
        focusArea: data.focusArea,
        intensity: data.intensity,
        notes: data.notes,
      },
    });

    return NextResponse.json({ success: true, workout });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await db.workout.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
