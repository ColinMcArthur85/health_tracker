import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/lib/db';
import { format } from 'date-fns';



const SYSTEM_PROMPT = `
You are a helpful Health Coach and Logger. You have access to a database of the user's health logs.
Your goal is to help the user log their workouts, nutrition, and reflections, and to answer questions about their history.

Current Date: ${new Date().toISOString()}

You can perform the following actions by returning a JSON object:

1. **Log Data**:
   {
     "action": "log",
     "date": "YYYY-MM-DD", // default to today if not specified
     "data": {
       "workout": { ... }, // see schema
       "nutrition": { 
         "calories": 2000, 
         "protein": 150, 
         "carbs": 200, 
         "fat": 80, 
         "fiber": 30, 
         "water": 2000,
         // Any other meal details like "breakfast", "lunch", "snacks" should be objects here.
         // The system will automatically store them as JSON.
         "breakfast": { "items": ["..."] } 
       },
       "reflection": { ... }, // see schema
       "checkIn": { ... } // see schema
     }
   }

2. **Query Data**:
   {
     "action": "query",
     "query": "SELECT ...", // Describe what you want to know in natural language, the system will handle the DB query.
     // Actually, for simplicity, just ask the system to fetch data for a date range.
     "startDate": "YYYY-MM-DD",
     "endDate": "YYYY-MM-DD"
   }

3. **Chat**:
   {
     "action": "chat",
     "response": "Your text response here..."
   }

If the user wants to log something, try to extract as much structured data as possible.
If the user asks a question, try to find the relevant data or answer from general knowledge if it's advice.

Example User: "I just ran 5k in 25 mins, felt great."
Example Response:
{
  "action": "log",
  "date": "2025-11-27",
  "data": {
    "workout": {
      "type": "Running",
      "duration": 25,
      "notes": "5k run",
      "intensity": "High"
    },
    "reflection": {
      "mood": "Great"
    }
  }
}
`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error("No response from AI");

    const result = JSON.parse(responseContent);

    if (result.action === 'log') {
      const date = new Date(result.date || new Date());
      
      // Upsert DailyLog
      const dailyLog = await db.dailyLog.upsert({
        where: { date: date },
        update: {},
        create: { date: date },
      });

      let responseText = "Logged: ";

      if (result.data.workout) {
        await db.workout.create({
          data: {
            dailyLogId: dailyLog.id,
            ...result.data.workout
          }
        });
        responseText += "Workout. ";
      }

      if (result.data.nutrition) {
        // Extract known fields, put the rest in mealsJson
        const { calories, protein, carbs, fat, fiber, water, ...rest } = result.data.nutrition;
        
        const nutritionData = {
          calories: typeof calories === 'number' ? calories : undefined,
          protein: typeof protein === 'number' ? protein : undefined,
          carbs: typeof carbs === 'number' ? carbs : undefined,
          fat: typeof fat === 'number' ? fat : undefined,
          fiber: typeof fiber === 'number' ? fiber : undefined,
          water: typeof water === 'number' ? water : undefined,
          mealsJson: Object.keys(rest).length > 0 ? JSON.stringify(rest) : undefined,
        };

        await db.nutrition.upsert({
          where: { dailyLogId: dailyLog.id },
          update: nutritionData,
          create: { dailyLogId: dailyLog.id, ...nutritionData }
        });
        responseText += "Nutrition. ";
      }

      if (result.data.reflection) {
        await db.reflection.create({
          data: {
            dailyLogId: dailyLog.id,
            ...result.data.reflection
          }
        });
        responseText += "Reflection. ";
      }
      
      return NextResponse.json({ response: responseText });
    }

    if (result.action === 'chat') {
      return NextResponse.json({ response: result.response });
    }

    return NextResponse.json({ response: "I'm not sure how to handle that yet, but I understood it." });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
