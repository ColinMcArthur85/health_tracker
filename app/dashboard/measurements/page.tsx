import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Scale, TrendingDown, Calendar, Ruler } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { StatCard } from '@/components/StatCards';

export default async function MeasurementsPage() {
  const measurements = await db.measurement.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const checkIns = await db.checkIn.findMany({
    where: {
      weight: { not: null },
    },
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 1,
  });

  const latestWeight = checkIns[0]?.weight;
  const totalMeasurements = measurements.length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-300/80 uppercase tracking-widest">Biometrics</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Body Measurements
          </h1>
          <p className="text-text-secondary text-lg font-medium">Track body circumferences and composition metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<Scale className="w-5 h-5 text-blue-300" />} 
            label="Current Weight" 
            value={latestWeight ? `${latestWeight} lbs` : '--'} 
          />
          <StatCard 
            icon={<Ruler className="w-5 h-5 text-success" />} 
            label="Measurements" 
            value={totalMeasurements} 
          />
          <StatCard 
            icon={<TrendingDown className="w-5 h-5 text-purple-400" />} 
            label="Trend" 
            value="--" 
          />
        </div>

        {/* Measurements Table */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          {measurements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface/50 border-b border-border-subtle">
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Chest</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Waist</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Hips</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Arms</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/30">
                  {measurements.map((measurement) => (
                    <tr key={measurement.id} className="hover:bg-surface/30 transition-all duration-200 group">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-blue-300 transition-colors">
                        {measurement.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                        {measurement.chest ? `${measurement.chest} cm` : '--'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                        {measurement.waist ? `${measurement.waist} cm` : '--'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                        {measurement.hips ? `${measurement.hips} cm` : '--'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                        {measurement.leftArm && measurement.rightArm 
                          ? `${measurement.leftArm}/${measurement.rightArm} cm` 
                          : '--'}
                      </td>
                      <td className="px-8 py-6 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors max-w-xs truncate">
                        {measurement.notes || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Ruler}
              title="No measurements yet"
              description="Start tracking your body measurements to monitor progress and identify trends in your physical transformation journey."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/10">
                  Log Your First Measurement
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

