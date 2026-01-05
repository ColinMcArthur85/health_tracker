import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Scale, TrendingDown, Calendar, Ruler } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Body Measurements</h1>
          <p className="text-slate-400">Track body circumferences and composition metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Scale className="w-5 h-5 text-blue-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Current Weight</h3>
            </div>
            <p className="text-3xl font-bold">{latestWeight ? `${latestWeight} lbs` : '--'}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Ruler className="w-5 h-5 text-emerald-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Measurements</h3>
            </div>
            <p className="text-3xl font-bold">{totalMeasurements}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingDown className="w-5 h-5 text-purple-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Trend</h3>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>

        {/* Measurements Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {measurements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Chest</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Waist</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Hips</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Arms</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {measurements.map((measurement) => (
                    <tr key={measurement.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {measurement.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {measurement.chest ? `${measurement.chest} cm` : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {measurement.waist ? `${measurement.waist} cm` : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {measurement.hips ? `${measurement.hips} cm` : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {measurement.leftArm && measurement.rightArm 
                          ? `${measurement.leftArm}/${measurement.rightArm} cm` 
                          : '--'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
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
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
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
