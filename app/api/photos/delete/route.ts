import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import db from '@/lib/db';

export async function DELETE(req: Request) {
  try {
    const { photoId } = await req.json();

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    // Get photo details before deleting
    const photo = await db.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from Blob Storage if it's a blob URL
    if (photo.url.includes('blob.vercel-storage.com')) {
      try {
        await del(photo.url);
      } catch (blobError) {
        console.error('Blob deletion error:', blobError);
        // Continue even if blob deletion fails
      }
    }

    // Delete from database
    await db.photo.delete({
      where: { id: photoId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
