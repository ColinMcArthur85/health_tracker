import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const { photoId, view, caption } = await req.json();

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const updatedPhoto = await (db.photo as any).update({
      where: { id: photoId },
      data: {
        ...(view && { view }),
        ...(caption !== undefined && { caption }),
      },
    });

    return NextResponse.json({ success: true, photo: updatedPhoto });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
