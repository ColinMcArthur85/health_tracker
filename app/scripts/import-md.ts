import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logsDir = path.join(process.cwd(), '../2025');
  
  if (!fs.existsSync(logsDir)) {
    console.error(`Directory not found: ${logsDir}`);
    return;
  }

  const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown files.`);

  for (const file of files) {
    const dateStr = file.replace('.md', '');
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.log(`Skipping non-date file: ${file}`);
      continue;
    }

    const date = new Date(dateStr);
    const content = fs.readFileSync(path.join(logsDir, file), 'utf-8');

    console.log(`Processing ${dateStr}...`);

    // Create or update DailyLog
    const dailyLog = await prisma.dailyLog.upsert({
      where: { date: date },
      update: {},
      create: {
        date: date,
      },
    });

    // 1. Parse Workout Log
    // Table format: | Date | Workout | ...
    const workoutSection = content.match(/## Workout Log([\s\S]*?)---/);
    if (workoutSection) {
      const lines = workoutSection[1].trim().split('\n');
      // Skip header and separator
      const dataLines = lines.filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Date'));
      
      for (const line of dataLines) {
        const cols = line.split('|').map(c => c.trim());
        // | Date | Workout | Instructor | Platform | Duration | Type | Focus Area | Intensity | Notes |
        // cols[0] is empty, cols[1] is Date
        if (cols.length >= 10) {
           await prisma.workout.create({
             data: {
               dailyLogId: dailyLog.id,
               name: cols[2],
               instructor: cols[3],
               platform: cols[4],
               duration: parseInt(cols[5]) || 0, // simplistic parsing
               type: cols[6],
               focusArea: cols[7],
               intensity: cols[8],
               notes: cols[9],
             }
           });
        }
      }
    }

    // 2. Parse Reflection Log
    // **YYYY-MM-DD (Post-Workout)**
    // - **Mood before:** ...
    const reflectionSection = content.match(/## Reflection Log([\s\S]*?)---/);
    if (reflectionSection) {
      const text = reflectionSection[1];
      // Split by bold headers like **YYYY-MM-DD...**
      const blocks = text.split(/\*\*\d{4}-\d{2}-\d{2}/).slice(1); // skip first empty
      
      for (const block of blocks) {
        // Determine type (Post-Workout, Later in the day)
        // The split removed the date part, but we can infer or just parse the block content
        // Actually, let's just look for lines starting with - **Key:** Value
        
        const mood = block.match(/- \*\*Mood( before|):\*\* (.*)/)?.[2] || block.match(/- \*\*Mood:\*\* (.*)/)?.[1];
        const energy = block.match(/- \*\*Energy:\*\* (.*)/)?.[1];
        const confidence = block.match(/- \*\*Confidence:\*\* (.*)/)?.[1];
        const notes = block.match(/- \*\*Notes:\*\* (.*)/)?.[1];
        
        if (mood || energy || notes) {
           await prisma.reflection.create({
             data: {
               dailyLogId: dailyLog.id,
               mood,
               energy,
               confidence,
               notes,
               type: block.includes('Post-Workout') ? 'Post-Workout' : 'General', // Heuristic
             }
           });
        }
      }
    }

    // 3. Parse Daily Check-Ins & Nutrition
    const checkInSection = content.match(/## Daily Check-Ins([\s\S]*?)($|### Nutrition Summary)/);
    if (checkInSection) {
      const text = checkInSection[1];
      
      const sleep = text.match(/- \*\*Sleep:\*\* (.*)/)?.[1];
      // Parse sleep hours roughly
      let sleepHours = 0;
      if (sleep) {
         const match = sleep.match(/(\d+(\.\d+)?) hrs/);
         if (match) sleepHours = parseFloat(match[1]);
      }

      const caffeine = text.match(/- \*\*Caffeine:\*\* (.*)/)?.[1];
      const alcohol = text.match(/- \*\*Alcohol:\*\* (.*)/)?.[1];
      const supplements = text.match(/- \*\*Supplements \/ Medications:\*\*([\s\S]*?)- \*\*Mood waves:\*\*/)?.[1];
      const pain = text.match(/- \*\*Pain \/ Aches:\*\* (.*)/)?.[1];
      
      await prisma.checkIn.upsert({
        where: { dailyLogId: dailyLog.id },
        update: {
           sleepHours,
           caffeine,
           alcohol,
           supplements: supplements ? supplements.replace(/\n\s+/g, '\n').trim() : undefined,
           pain,
        },
        create: {
           dailyLogId: dailyLog.id,
           sleepHours,
           caffeine,
           alcohol,
           supplements: supplements ? supplements.replace(/\n\s+/g, '\n').trim() : undefined,
           pain,
        }
      });
    }

    // 4. Nutrition Summary
    const nutritionSection = content.match(/### Nutrition Summary([\s\S]*?)$/);
    if (nutritionSection) {
      const text = nutritionSection[1];
      
      const calories = parseInt(text.match(/- \*\*Calories:\*\*.*?(\d{1,3}(,\d{3})*)/)?.[1].replace(/,/g, '') || '0');
      const protein = parseInt(text.match(/- \*\*Protein:\*\*.*?(\d+) g/)?.[1] || '0');
      const carbs = parseInt(text.match(/- \*\*Carbs:\*\*.*?(\d+) g/)?.[1] || '0');
      const fat = parseInt(text.match(/- \*\*Fat:\*\*.*?(\d+) g/)?.[1] || '0');
      const fiber = parseInt(text.match(/- \*\*Fiber:\*\*.*?(\d+) g/)?.[1] || '0');
      
      await prisma.nutrition.upsert({
        where: { dailyLogId: dailyLog.id },
        update: {
          calories,
          protein,
          carbs,
          fat,
          fiber,
        },
        create: {
          dailyLogId: dailyLog.id,
          calories,
          protein,
          carbs,
          fat,
          fiber,
        }
      });
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
