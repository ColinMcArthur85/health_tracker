import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import db from '@/lib/db';
import { Moon, TrendingUp, Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { MiniStatCard } from '@/components/StatCards';

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
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-purple-400/80 uppercase tracking-widest">Recovery</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Sleep Tracking
          </h1>
          <p className="text-text-secondary text-lg font-medium">Monitor your sleep patterns and quality</p>
        </div>

        {/* Sleep Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MiniStatCard
            label="Avg Sleep (30d)"
            value={`${avgSleep}h`}
            icon={<Moon className="w-5 h-5 text-purple-400" />}
          />
          <MiniStatCard
            label="Best Night"
            value={`${bestSleep}h`}
            icon={<TrendingUp className="w-5 h-5 text-success" />}
          />
          <MiniStatCard
            label="Total Nights"
            value={checkIns.length}
            icon={<Calendar className="w-5 h-5 text-blue-300" />}
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Sleep Log */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface/50 border-b border-border-subtle">
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Sleep Hours
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Quality
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {checkIns.map((checkIn) => {
                  const sleepHours = checkIn.sleepHours || 0;
                  const quality = sleepHours >= 8 ? 'Excellent' : sleepHours >= 7 ? 'Good' : sleepHours >= 6 ? 'Fair' : 'Poor';
                  const qualityColor = sleepHours >= 8 ? 'bg-emerald-500/10 text-success border border-emerald-500/20' : 
                                     sleepHours >= 7 ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 
                                     sleepHours >= 6 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                     'bg-red-500/10 text-red-400 border border-red-500/20';
                  
                  return (
                    <tr key={checkIn.id} className="hover:bg-surface/30 transition-all duration-200 group">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-purple-400 transition-colors">
                        {checkIn.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                        {sleepHours.toFixed(1)}h
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${qualityColor}`}>
                          {quality}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors line-clamp-1 max-w-xs">
                        {checkIn.notes || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {checkIns.length === 0 && (
            <EmptyState
              icon={Moon}
              title="No sleep data yet"
              description="Start tracking your sleep patterns to improve rest quality and overall health. Consistent sleep tracking reveals powerful insights."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/10">
                  Log Your First Night
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

