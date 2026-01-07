import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import db from '@/lib/db';
import { Droplets, Coffee, Wine } from 'lucide-react';
import { MiniStatCard } from '@/components/StatCards';

export default async function HydrationPage() {
  const checkIns = await db.checkIn.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const waterLogs = checkIns.filter((c: any) => c.water !== null && c.water !== undefined);
  const avgWater = waterLogs.length > 0 
    ? Math.round(waterLogs.reduce((sum: number, c: any) => sum + ((c.water as number) || 0), 0) / waterLogs.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-300/80 uppercase tracking-widest">Fluid Intake</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Hydration
          </h1>
          <p className="text-text-secondary text-lg font-medium">Track water, caffeine, and alcohol intake</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MiniStatCard
            label="Avg Water (30d)"
            value={avgWater > 0 ? `${avgWater}ml` : '--'}
            icon={<Droplets className="w-5 h-5 text-blue-300" />}
          />
          <MiniStatCard
            label="Caffeine Logs"
            value={checkIns.filter((c: any) => c.caffeine).length}
            icon={<Coffee className="w-5 h-5 text-warning" />}
          />
          <MiniStatCard
            label="Alcohol Logs"
            value={checkIns.filter((c: any) => c.alcohol).length}
            icon={<Wine className="w-5 h-5 text-purple-400" />}
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Hydration Table */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface/50 border-b border-border-subtle">
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Water
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Caffeine
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Alcohol
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Supplements
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {checkIns.map((checkIn: any) => (
                  <tr key={checkIn.id} className="hover:bg-surface/30 transition-all duration-200 group">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-blue-300 transition-colors">
                      {checkIn.dailyLog.date.toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {checkIn.water ? `${checkIn.water as number} ml` : '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {checkIn.caffeine || '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {checkIn.alcohol || '--'}
                    </td>
                    <td className="px-8 py-6 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors max-w-xs truncate font-medium">
                      {checkIn.supplements || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {checkIns.length === 0 && (
            <div className="text-center py-24 text-text-tertiary">
              <Droplets className="w-20 h-20 mx-auto mb-6 opacity-20" />
              <p className="text-lg font-medium">No hydration data logged yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

