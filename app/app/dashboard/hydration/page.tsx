import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import MetricCard from '@/components/dashboard/MetricCard';
import db from '@/lib/db';
import { Droplets, Coffee, Wine } from 'lucide-react';

export default async function HydrationPage() {
  const checkIns = await db.checkIn.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  }) as any;

  const waterLogs = checkIns.filter((c: any) => c.water !== null && c.water !== undefined);
  const avgWater = waterLogs.length > 0 
    ? Math.round(waterLogs.reduce((sum: number, c: any) => sum + ((c.water as number) || 0), 0) / waterLogs.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hydration</h1>
          <p className="text-slate-400">Track water, caffeine, and alcohol intake</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Avg Water (30d)"
            value={avgWater > 0 ? `${avgWater}ml` : '--'}
            icon={<Droplets className="w-5 h-5 text-white" />}
            color="blue"
          />
          <MetricCard
            title="Caffeine Logs"
            value={checkIns.filter((c: any) => c.caffeine).length}
            icon={<Coffee className="w-5 h-5 text-white" />}
            color="orange"
          />
          <MetricCard
            title="Alcohol Logs"
            value={checkIns.filter((c: any) => c.alcohol).length}
            icon={<Wine className="w-5 h-5 text-white" />}
            color="purple"
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Hydration Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Water
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Caffeine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Alcohol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Supplements
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {checkIns.map((checkIn: any) => (
                  <tr key={checkIn.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {checkIn.dailyLog.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {checkIn.water ? `${checkIn.water as number} ml` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {checkIn.caffeine || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {checkIn.alcohol || '--'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                      {checkIn.supplements || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {checkIns.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Droplets className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hydration data logged yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
