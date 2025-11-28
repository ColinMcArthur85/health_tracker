import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import MetricCard from '@/components/dashboard/MetricCard';
import db from '@/lib/db';
import { Heart, Smile, Zap, Pill } from 'lucide-react';

export default async function WellnessPage() {
  const reflections = await db.reflection.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const checkIns = await db.checkIn.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const medications = await (db as any).medication.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wellness</h1>
          <p className="text-slate-400">Track mood, energy, supplements, and medications</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Mood Logs"
            value={reflections.filter(r => r.mood).length}
            icon={<Smile className="w-5 h-5 text-white" />}
            color="pink"
          />
          <MetricCard
            title="Energy Logs"
            value={reflections.filter(r => r.energy).length}
            icon={<Zap className="w-5 h-5 text-white" />}
            color="orange"
          />
          <MetricCard
            title="Supplements"
            value={checkIns.filter(c => c.supplements).length}
            icon={<Pill className="w-5 h-5 text-white" />}
            color="emerald"
          />
          <MetricCard
            title="Medications"
            value={medications.length}
            icon={<Heart className="w-5 h-5 text-white" />}
            color="blue"
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Mood & Energy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Mood & Energy Tracking</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Mood</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Energy</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reflections.map((reflection) => (
                  <tr key={reflection.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {reflection.dailyLog.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{reflection.mood || '--'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{reflection.energy || '--'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{reflection.confidence || '--'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                      {reflection.notes || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reflections.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No wellness data logged yet</p>
            </div>
          )}
        </div>

        {/* Medications */}
        {medications.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Medications</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Medication</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dosage</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Taken</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {medications.map((med: typeof medications[0]) => (
                    <tr key={med.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {med.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{med.dosage || '--'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          med.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {med.taken ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{med.notes || '--'}</td>
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
