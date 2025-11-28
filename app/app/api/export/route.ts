import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const logs = await db.dailyLog.findMany({
      where: whereClause,
      include: {
        workouts: true,
        nutrition: true,
        checkIn: true,
        reflections: true,
        photos: true,
        measurements: true,
        medications: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (exportFormat === 'json') {
      return NextResponse.json(logs, {
        headers: {
          'Content-Disposition': `attachment; filename="health-journal-${format(new Date(), 'yyyy-MM-dd')}.json"`,
        },
      });
    }

    if (exportFormat === 'csv') {
      const csv = generateCSV(logs);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="health-journal-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
        },
      });
    }

    if (exportFormat === 'markdown') {
      const markdown = generateMarkdown(logs);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="health-journal-${format(new Date(), 'yyyy-MM-dd')}.md"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

function generateCSV(logs: any[]): string {
  const headers = [
    'Date',
    'Workouts',
    'Workout Duration',
    'Calories',
    'Protein',
    'Carbs',
    'Fat',
    'Fiber',
    'Sleep Hours',
    'Weight',
    'Water (ml)',
  ];

  const rows = logs.map(log => {
    const workoutCount = log.workouts.length;
    const totalDuration = log.workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0);

    return [
      format(new Date(log.date), 'yyyy-MM-dd'),
      workoutCount,
      totalDuration,
      log.nutrition?.calories || '',
      log.nutrition?.protein || '',
      log.nutrition?.carbs || '',
      log.nutrition?.fat || '',
      log.nutrition?.fiber || '',
      log.checkIn?.sleepHours || '',
      log.checkIn?.weight || '',
      log.checkIn?.water || '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function generateMarkdown(logs: any[]): string {
  let markdown = '# Health Journal Export\n\n';
  markdown += `Generated: ${format(new Date(), 'MMMM d, yyyy')}\n\n`;
  markdown += `Total Entries: ${logs.length}\n\n`;
  markdown += '---\n\n';

  logs.forEach(log => {
    const date = format(new Date(log.date), 'MMMM d, yyyy (EEEE)');
    markdown += `## ${date}\n\n`;

    // Workouts
    if (log.workouts.length > 0) {
      markdown += '### Workouts\n\n';
      log.workouts.forEach((w: any) => {
        markdown += `- **${w.type || 'Workout'}**`;
        if (w.name) markdown += ` - ${w.name}`;
        markdown += '\n';
        if (w.duration) markdown += `  - Duration: ${w.duration} mins\n`;
        if (w.intensity) markdown += `  - Intensity: ${w.intensity}\n`;
        if (w.focusArea) markdown += `  - Focus: ${w.focusArea}\n`;
        if (w.notes) markdown += `  - Notes: ${w.notes}\n`;
        markdown += '\n';
      });
    }

    // Nutrition
    if (log.nutrition) {
      markdown += '### Nutrition\n\n';
      if (log.nutrition.calories) markdown += `- Calories: ${log.nutrition.calories}\n`;
      if (log.nutrition.protein) markdown += `- Protein: ${log.nutrition.protein}g\n`;
      if (log.nutrition.carbs) markdown += `- Carbs: ${log.nutrition.carbs}g\n`;
      if (log.nutrition.fat) markdown += `- Fat: ${log.nutrition.fat}g\n`;
      if (log.nutrition.fiber) markdown += `- Fiber: ${log.nutrition.fiber}g\n`;
      
      if (log.nutrition.mealsJson) {
        try {
          const meals = JSON.parse(log.nutrition.mealsJson);
          markdown += '\n**Meals:**\n';
          meals.forEach((meal: string) => {
            markdown += `- ${meal}\n`;
          });
        } catch (e) {
          // Skip if JSON parsing fails
        }
      }
      markdown += '\n';
    }

    // Check-in
    if (log.checkIn) {
      markdown += '### Daily Stats\n\n';
      if (log.checkIn.sleepHours) markdown += `- Sleep: ${log.checkIn.sleepHours} hours\n`;
      if (log.checkIn.weight) markdown += `- Weight: ${log.checkIn.weight} lbs\n`;
      if (log.checkIn.water) markdown += `- Water: ${log.checkIn.water} ml\n`;
      if (log.checkIn.caffeine) markdown += `- Caffeine: ${log.checkIn.caffeine}\n`;
      if (log.checkIn.alcohol) markdown += `- Alcohol: ${log.checkIn.alcohol}\n`;
      if (log.checkIn.supplements) markdown += `- Supplements: ${log.checkIn.supplements}\n`;
      markdown += '\n';
    }

    // Reflections
    if (log.reflections.length > 0) {
      markdown += '### Reflections\n\n';
      log.reflections.forEach((r: any) => {
        if (r.mood) markdown += `- Mood: ${r.mood}\n`;
        if (r.energy) markdown += `- Energy: ${r.energy}\n`;
        if (r.notes) markdown += `- Notes: ${r.notes}\n`;
        markdown += '\n';
      });
    }

    markdown += '---\n\n';
  });

  return markdown;
}
