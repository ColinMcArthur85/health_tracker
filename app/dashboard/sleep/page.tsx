import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import MetricCard from '@/components/dashboard/MetricCard';
import db from '@/lib/db';
import { Moon, TrendingUp } from 'lucide-react';

export default async function SleepPage() {
  const checkIns = await db.checkIn.findMany({
    where: {
      sleepHours: { not: null },
    },
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const totalSleep = checkIns.reduce((sum, c) => sum + (c.sleepHours || 0), 0);
  const avgSleep = checkIns.length > 0 ? (totalSleep / checkIns.length).toFixed(1) : 0;
  const bestSleep = checkIns.length > 0 ? Math.max(...checkIns.map(c => c.sleepHours || 0)) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sleep Tracking</h1>
          <p className="text-slate-400">Monitor your sleep patterns and quality</p>
        </div>

        {/* Sleep Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Avg Sleep (30d)"
            value={`${avgSleep}h`}
            icon={<Moon className="w-5 h-5 text-white" />}
            color="purple"
          />
          <MetricCard
            title="Best Night"
            value={`${bestSleep}h`}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="emerald"
          />
          <MetricCard
            title="Total Nights"
            value={checkIns.length}
            icon={<Moon className="w-5 h-5 text-white" />}
            color="blue"
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Sleep Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Sleep Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {checkIns.map((checkIn) => {
                  const sleepHours = checkIn.sleepHours || 0;
                  const quality = sleepHours >= 8 ? 'Excellent' : sleepHours >= 7 ? 'Good' : sleepHours >= 6 ? 'Fair' : 'Poor';
                  const qualityColor = sleepHours >= 8 ? 'text-emerald-400' : sleepHours >= 7 ? 'text-blue-400' : sleepHours >= 6 ? 'text-yellow-400' : 'text-red-400';
                  
                  return (
                    <tr key={checkIn.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {checkIn.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {sleepHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={qualityColor}>{quality}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {checkIn.notes || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {checkIns.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Moon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sleep data logged yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
