import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import MetricCard from '@/components/dashboard/MetricCard';
import db from '@/lib/db';
import { Scale, TrendingDown, TrendingUp, Ruler } from 'lucide-react';

export default async function BodyPage() {
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
  });

  const measurements = await (db as any).measurement.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
  });

  const currentWeight = checkIns.length > 0 ? checkIns[0].weight : null;
  const startWeight = checkIns.length > 0 ? checkIns[checkIns.length - 1].weight : null;
  const weightChange = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Body Metrics</h1>
          <p className="text-slate-400">Track weight and body measurements</p>
        </div>

        {/* Weight Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Current Weight"
            value={currentWeight ? `${currentWeight} lbs` : '--'}
            icon={<Scale className="w-5 h-5 text-white" />}
            color="emerald"
          />
          <MetricCard
            title="Weight Change"
            value={weightChange ? `${parseFloat(weightChange) > 0 ? '+' : ''}${weightChange} lbs` : '--'}
            trend={weightChange ? (parseFloat(weightChange) < 0 ? 'down' : 'up') : undefined}
            icon={weightChange && parseFloat(weightChange) < 0 ? <TrendingDown className="w-5 h-5 text-white" /> : <TrendingUp className="w-5 h-5 text-white" />}
            color="blue"
          />
          <MetricCard
            title="Measurements"
            value={measurements.length}
            icon={<Ruler className="w-5 h-5 text-white" />}
            color="purple"
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Weight History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Weight History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {checkIns.map((checkIn, index) => {
                  const prevWeight = index < checkIns.length - 1 ? checkIns[index + 1].weight : null;
                  const change = prevWeight && checkIn.weight ? (checkIn.weight - prevWeight).toFixed(1) : null;
                  
                  return (
                    <tr key={checkIn.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {checkIn.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {checkIn.weight} lbs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {change ? (
                          <span className={parseFloat(change) < 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {parseFloat(change) > 0 ? '+' : ''}{change} lbs
                          </span>
                        ) : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {checkIns.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No weight data logged yet</p>
            </div>
          )}
        </div>

        {/* Measurements */}
        {measurements.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Body Measurements</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Chest</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Waist</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Hips</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Arms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {measurements.map((m: typeof measurements[0]) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {m.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{m.chest ? `${m.chest} cm` : '--'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{m.waist ? `${m.waist} cm` : '--'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{m.hips ? `${m.hips} cm` : '--'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {m.leftArm || m.rightArm ? `${m.leftArm || m.rightArm} cm` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
