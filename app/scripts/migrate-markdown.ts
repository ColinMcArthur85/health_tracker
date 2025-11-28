import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ParsedEntry {
  date: Date;
  workouts: any[];
  nutrition: any;
  checkIn: any;
  reflections: any[];
}

function parseDate(filename: string): Date | null {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  
  const dateStr = match[1];
  const date = new Date(dateStr + 'T00:00:00.000Z');
  return date;
}

function extractWorkouts(content: string): any[] {
  const workouts: any[] = [];
  
  // Pattern 1: Table format
  const tableMatch = content.match(/\|\s*Date.*?\|\s*Workout.*?\|[\s\S]*?\n((?:\|.*?\|\n)+)/i);
  if (tableMatch) {
    const rows = tableMatch[1].split('\n').filter(row => row.trim() && !row.includes('---'));
    rows.forEach(row => {
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 8) {
        workouts.push({
          name: cells[1] || null,
          instructor: cells[2] || null,
          platform: cells[3] || null,
          duration: cells[4] ? parseInt(cells[4]) : null,
          type: cells[5] || null,
          focusArea: cells[6] || null,
          intensity: cells[7] || null,
          notes: cells[8] || null,
        });
      }
    });
  }
  
  // Pattern 2: Bullet list format
  const bulletMatch = content.match(/##\s*Workout Log\s*\n([\s\S]*?)(?=\n##|\n---|\z)/i);
  if (bulletMatch && workouts.length === 0) {
    const workoutSection = bulletMatch[1];
    
    // Extract type, duration, intensity from various formats
    const typeMatch = workoutSection.match(/\*\*Type:\*\*\s*(.+)/i);
    const durationMatch = workoutSection.match(/\*\*Duration:\*\*\s*~?(\d+)/i);
    const intensityMatch = workoutSection.match(/\*\*Intensity:\*\*\s*(.+)/i);
    const focusMatch = workoutSection.match(/\*\*Focus:\*\*\s*(.+)/i);
    const notesMatch = workoutSection.match(/\*\*Notes:\*\*\s*(.+)/i) || 
                      workoutSection.match(/\*\*Completed:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    
    if (typeMatch || durationMatch) {
      workouts.push({
        name: null,
        instructor: null,
        platform: null,
        duration: durationMatch ? parseInt(durationMatch[1]) : null,
        type: typeMatch ? typeMatch[1].trim() : null,
        focusArea: focusMatch ? focusMatch[1].trim() : null,
        intensity: intensityMatch ? intensityMatch[1].trim() : null,
        notes: notesMatch ? notesMatch[1].trim().replace(/\n/g, ' ').substring(0, 500) : null,
      });
    }
    
    // Check for "Planned: Rest day" format
    if (workoutSection.match(/\*\*Planned\*\*:\s*Rest day/i)) {
      workouts.push({
        name: 'Rest Day',
        type: 'Rest',
        notes: 'Planned rest day',
        duration: null,
        intensity: null,
        focusArea: null,
        instructor: null,
        platform: null,
      });
    }
  }
  
  // Pattern 3: Numbered list format
  const numberedMatch = content.match(/##\s*Workout Log\s*\n\n((?:\d+\.\s+.+?\n(?:\s+•.+?\n)*)+)/i);
  if (numberedMatch && workouts.length === 0) {
    const sections = numberedMatch[1].split(/\n(?=\d+\.)/);
    sections.forEach(section => {
      const lines = section.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        const title = lines[0].replace(/^\d+\.\s*/, '').trim();
        const exercises = lines.slice(1).map(l => l.replace(/^\s*•\s*/, '').trim()).join('; ');
        
        workouts.push({
          name: title,
          type: title,
          notes: exercises.substring(0, 500),
          duration: null,
          intensity: null,
          focusArea: null,
          instructor: null,
          platform: null,
        });
      }
    });
  }
  
  return workouts;
}

function extractNutrition(content: string): any {
  const nutrition: any = {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    fiber: null,
    mealsJson: null,
  };
  
  // Extract daily totals
  const caloriesMatch = content.match(/\*\*Calories:\*\*\s*~?(\d+)/i) ||
                       content.match(/Calories:\s*~?(\d+)/i);
  const proteinMatch = content.match(/\*\*Protein:\*\*\s*~?(\d+)/i) ||
                      content.match(/Protein:\s*~?(\d+)/i);
  const carbsMatch = content.match(/\*\*Carbs:\*\*\s*~?(\d+)/i) ||
                    content.match(/Carbs:\s*~?(\d+)/i);
  const fatMatch = content.match(/\*\*Fat:\*\*\s*~?(\d+)/i) ||
                  content.match(/Fat:\s*~?(\d+)/i);
  const fiberMatch = content.match(/\*\*Fiber:\*\*\s*~?(\d+)/i) ||
                    content.match(/Fiber:\s*~?(\d+)/i);
  
  if (caloriesMatch) nutrition.calories = parseInt(caloriesMatch[1]);
  if (proteinMatch) nutrition.protein = parseInt(proteinMatch[1]);
  if (carbsMatch) nutrition.carbs = parseInt(carbsMatch[1]);
  if (fatMatch) nutrition.fat = parseInt(fatMatch[1]);
  if (fiberMatch) nutrition.fiber = parseInt(fiberMatch[1]);
  
  // Extract meals
  const meals: string[] = [];
  const foodSection = content.match(/\*\*Food & Drink:\*\*\s*([\s\S]*?)(?=\*\*Water:|\*\*Caffeine:|\n##|\z)/i);
  if (foodSection) {
    const mealMatches = foodSection[1].matchAll(/\*\*(\w+).*?:\*\*\s*([\s\S]*?)(?=\*\*\w+.*?:|$)/gi);
    for (const match of mealMatches) {
      const mealName = match[1];
      const items = match[2].split('\n')
        .map(l => l.replace(/^[\s-•]+/, '').trim())
        .filter(l => l && !l.startsWith('→') && !l.startsWith('Micros:'));
      
      if (items.length > 0) {
        meals.push(`${mealName}: ${items.join(', ')}`);
      }
    }
  }
  
  if (meals.length > 0) {
    nutrition.mealsJson = JSON.stringify(meals);
  }
  
  return nutrition;
}

function extractCheckIn(content: string): any {
  const checkIn: any = {
    sleepHours: null,
    weight: null,
    water: null,
    caffeine: null,
    alcohol: null,
    supplements: null,
    pain: null,
    notes: null,
  };
  
  // Sleep
  const sleepMatch = content.match(/\*\*Sleep:\*\*\s*([0-9.]+)\s*h/i);
  if (sleepMatch) {
    checkIn.sleepHours = parseFloat(sleepMatch[1]);
  }
  
  // Water
  const waterMatch = content.match(/\*\*Water:\*\*\s*~?([0-9.]+)\s*L/i) ||
                    content.match(/Water:\s*~?([0-9.]+)\s*L/i);
  if (waterMatch) {
    checkIn.water = Math.round(parseFloat(waterMatch[1]) * 1000); // Convert to ml
  }
  
  // Caffeine
  const caffeineMatch = content.match(/\*\*Caffeine:\*\*\s*(.+?)(?=\n\*\*|\n-|\z)/is);
  if (caffeineMatch) {
    checkIn.caffeine = caffeineMatch[1].trim().replace(/\n/g, ' ').substring(0, 200);
  }
  
  // Alcohol
  const alcoholMatch = content.match(/\*\*Alcohol:\*\*\s*(.+?)(?=\n\*\*|\n####|\z)/is);
  if (alcoholMatch) {
    checkIn.alcohol = alcoholMatch[1].trim().replace(/\n/g, ' ').substring(0, 200);
  }
  
  // Supplements
  const supplementsMatch = content.match(/\*\*Supplements.*?:\*\*\s*([\s\S]*?)(?=\n####|\n\*\*[A-Z]|\z)/i);
  if (supplementsMatch) {
    checkIn.supplements = supplementsMatch[1].trim().replace(/\n/g, ' ').substring(0, 200);
  }
  
  // Pain
  const painMatch = content.match(/\*\*Pain.*?:\*\*\s*(.+?)(?=\n\*\*|\n####|\z)/is);
  if (painMatch) {
    checkIn.pain = painMatch[1].trim().replace(/\n/g, ' ').substring(0, 200);
  }
  
  return checkIn;
}

function extractReflections(content: string): any[] {
  const reflections: any[] = [];
  
  // Extract mood, energy, etc.
  const moodMatch = content.match(/\*\*Mood.*?:\*\*\s*(.+?)(?=\n\*\*|\n-|\z)/is);
  const energyMatch = content.match(/\*\*Energy.*?:\*\*\s*(.+?)(?=\n\*\*|\n-|\z)/is);
  const confidenceMatch = content.match(/\*\*Confidence.*?:\*\*\s*(.+?)(?=\n\*\*|\n-|\z)/is);
  const notesMatch = content.match(/\*\*Notes:\*\*\s*(.+?)(?=\n##|\n---|\z)/is);
  
  if (moodMatch || energyMatch || confidenceMatch) {
    reflections.push({
      type: 'Daily',
      mood: moodMatch ? moodMatch[1].trim().substring(0, 200) : null,
      energy: energyMatch ? energyMatch[1].trim().substring(0, 200) : null,
      confidence: confidenceMatch ? confidenceMatch[1].trim().substring(0, 200) : null,
      notes: notesMatch ? notesMatch[1].trim().substring(0, 500) : null,
      time: null,
    });
  }
  
  return reflections;
}

function parseMarkdownFile(filePath: string): ParsedEntry | null {
  const filename = path.basename(filePath);
  const date = parseDate(filename);
  
  if (!date) {
    console.log(`⚠️  Skipping ${filename}: Could not parse date`);
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const workouts = extractWorkouts(content);
  const nutrition = extractNutrition(content);
  const checkIn = extractCheckIn(content);
  const reflections = extractReflections(content);
  
  return {
    date,
    workouts,
    nutrition,
    checkIn,
    reflections,
  };
}

async function migrateMarkdownFiles() {
  const markdownDir = path.join(__dirname, '../../2025');
  
  if (!fs.existsSync(markdownDir)) {
    console.error(`❌ Directory not found: ${markdownDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(markdownDir)
    .filter(f => f.endsWith('.md') && f.match(/\d{4}-\d{2}-\d{2}/))
    .sort();
  
  console.log(`📁 Found ${files.length} markdown files to process\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const filePath = path.join(markdownDir, file);
    
    try {
      const parsed = parseMarkdownFile(filePath);
      
      if (!parsed) {
        skipCount++;
        continue;
      }
      
      // Check if entry already exists
      const existing = await prisma.dailyLog.findUnique({
        where: { date: parsed.date },
      });
      
      if (existing) {
        console.log(`⏭️  Skipping ${file}: Entry already exists`);
        skipCount++;
        continue;
      }
      
      // Create daily log entry
      const dailyLog = await prisma.dailyLog.create({
        data: {
          date: parsed.date,
        },
      });
      
      // Create workouts
      for (const workout of parsed.workouts) {
        await prisma.workout.create({
          data: {
            dailyLogId: dailyLog.id,
            ...workout,
          },
        });
      }
      
      // Create nutrition if data exists
      if (parsed.nutrition.calories || parsed.nutrition.protein) {
        await prisma.nutrition.create({
          data: {
            dailyLogId: dailyLog.id,
            ...parsed.nutrition,
          },
        });
      }
      
      // Create check-in if data exists
      if (parsed.checkIn.sleepHours || parsed.checkIn.water) {
        await prisma.checkIn.create({
          data: {
            dailyLogId: dailyLog.id,
            ...parsed.checkIn,
          },
        });
      }
      
      // Create reflections
      for (const reflection of parsed.reflections) {
        await prisma.reflection.create({
          data: {
            dailyLogId: dailyLog.id,
            ...reflection,
          },
        });
      }
      
      console.log(`✅ Imported ${file}: ${parsed.workouts.length} workouts, nutrition: ${!!parsed.nutrition.calories}, check-in: ${!!parsed.checkIn.sleepHours}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successfully imported: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total processed: ${files.length}`);
}

migrateMarkdownFiles()
  .then(() => {
    console.log('\n✨ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
