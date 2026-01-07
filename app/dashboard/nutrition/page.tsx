import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import db from '@/lib/db';
import { Apple, Beef, Wheat, Droplet } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { MiniStatCard } from '@/components/StatCards';

export default async function NutritionPage() {
  const nutritionLogs = await db.nutrition.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const totalCalories = nutritionLogs.reduce((sum, n) => sum + (n.calories || 0), 0);
  const avgCalories = nutritionLogs.length > 0 ? Math.round(totalCalories / nutritionLogs.length) : 0;
  const avgProtein = nutritionLogs.length > 0 
    ? Math.round(nutritionLogs.reduce((sum, n) => sum + (n.protein || 0), 0) / nutritionLogs.length)
    : 0;
  const avgCarbs = nutritionLogs.length > 0 
    ? Math.round(nutritionLogs.reduce((sum, n) => sum + (n.carbs || 0), 0) / nutritionLogs.length)
    : 0;
  const avgFat = nutritionLogs.length > 0 
    ? Math.round(nutritionLogs.reduce((sum, n) => sum + (n.fat || 0), 0) / nutritionLogs.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-success/80 uppercase tracking-widest">Internal Health</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Nutrition
          </h1>
          <p className="text-text-secondary text-lg font-medium">Track your macros and calorie intake</p>
        </div>

        {/* Macro Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniStatCard
            label="Avg Calories"
            value={avgCalories}
            icon={<Apple className="w-5 h-5 text-warning" />}
          />
          <MiniStatCard
            label="Avg Protein"
            value={`${avgProtein}g`}
            icon={<Beef className="w-5 h-5 text-blue-300" />}
          />
          <MiniStatCard
            label="Avg Carbs"
            value={`${avgCarbs}g`}
            icon={<Wheat className="w-5 h-5 text-success" />}
          />
          <MiniStatCard
            label="Avg Fat"
            value={`${avgFat}g`}
            icon={<Droplet className="w-5 h-5 text-purple-400" />}
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Nutrition Table */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface/50 border-b border-border-subtle">
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Calories
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Protein
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Carbs
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Fat
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Fiber
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {nutritionLogs.map((nutrition) => (
                  <tr key={nutrition.id} className="hover:bg-surface/30 transition-all duration-200 group">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-success transition-colors">
                      {nutrition.dailyLog.date.toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {nutrition.calories || '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {nutrition.protein ? `${nutrition.protein}g` : '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {nutrition.carbs ? `${nutrition.carbs}g` : '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {nutrition.fat ? `${nutrition.fat}g` : '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {nutrition.fiber ? `${nutrition.fiber}g` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {nutritionLogs.length === 0 && (
            <EmptyState
              icon={Apple}
              title="No nutrition data yet"
              description="Start tracking your meals and macros to optimize your nutrition. Small daily adjustments lead to major long-term results."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/10">
                  Log Your First Meal
                </Link>
              }
            />  
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

