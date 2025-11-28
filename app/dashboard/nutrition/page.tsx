import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import MetricCard from '@/components/dashboard/MetricCard';
import db from '@/lib/db';
import { Apple, Beef, Wheat, Droplet } from 'lucide-react';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
          <p className="text-slate-400">Track your macros and calorie intake</p>
        </div>

        {/* Macro Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Avg Calories"
            value={avgCalories}
            icon={<Apple className="w-5 h-5 text-white" />}
            color="orange"
          />
          <MetricCard
            title="Avg Protein"
            value={`${avgProtein}g`}
            icon={<Beef className="w-5 h-5 text-white" />}
            color="blue"
          />
          <MetricCard
            title="Avg Carbs"
            value={`${avgCarbs}g`}
            icon={<Wheat className="w-5 h-5 text-white" />}
            color="emerald"
          />
          <MetricCard
            title="Avg Fat"
            value={`${avgFat}g`}
            icon={<Droplet className="w-5 h-5 text-white" />}
            color="purple"
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Nutrition Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Calories
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Protein
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Carbs
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Fat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Fiber
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {nutritionLogs.map((nutrition) => (
                  <tr key={nutrition.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {nutrition.dailyLog.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {nutrition.calories || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {nutrition.protein ? `${nutrition.protein}g` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {nutrition.carbs ? `${nutrition.carbs}g` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {nutrition.fat ? `${nutrition.fat}g` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {nutrition.fiber ? `${nutrition.fiber}g` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {nutritionLogs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No nutrition data logged yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
