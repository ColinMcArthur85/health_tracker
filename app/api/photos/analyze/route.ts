import { NextResponse } from 'next/server';
import db from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { dailyLogId } = await req.json();

    const photos = (await db.photo.findMany({
      where: { dailyLogId },
      orderBy: { view: 'asc' } as any,
    })) as any[];

    if (photos.length === 0) {
      return NextResponse.json({ error: "No photos found for this log." }, { status: 404 });
    }

    const imageUrls = photos.map(p => p.url);
    
    // Prepare the message for OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert fitness coach and postural specialist. Your task is to analyze progress photos (Front, Side, Back) and provide a detailed analysis of muscle imbalances, postural issues, areas of weakness, and overall physical development. Be professional, encouraging, and specific."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze these progress photos. Focus on: 1. Areas of weakness 2. Muscle imbalances (left vs right, anterior vs posterior) 3. Postural issues (rounded shoulders, anterior pelvic tilt, etc.) 4. Suggestions for improvement." },
            ...imageUrls.map(url => ({
              type: "image_url" as const,
              image_url: { 
                url: url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${url}`,
                detail: 'high' as const
              }
            }))
          ]
        }
      ],
      max_tokens: 1000,
    });

    const analysis = response.choices[0].message.content;

    // Update all photos in this set with the same analysis
    await (db.photo as any).updateMany({
      where: { dailyLogId },
      data: { analysis }
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: "Failed to analyze photos." }, { status: 500 });
  }
}
