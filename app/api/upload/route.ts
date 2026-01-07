import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { rateLimiters, applyRateLimit } from '@/lib/rateLimit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
  // Apply rate limiting (20 uploads per minute)
  const rateLimitResponse = applyRateLimit(req, rateLimiters.upload);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const date = formData.get('date') as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Security Hardening: Validate file size and type
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and WebP allowed." }, { status: 400 });
    }

    // Generate unique filename
    const filename = `progress-photos/${date}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
