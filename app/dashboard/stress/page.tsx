import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Brain, Activity, Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default async function StressPage() {
  const reflections = await db.reflection.findMany({
    where: {
      mood: { not: null },
    },
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  // Use mood as proxy for stress tracking
  const moodCounts = reflections.reduce((acc: any, r) => {
    const mood = r.mood || '';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stress & Mind Health</h1>
          <p className="text-text-secondary">Track emotional state and identify stress patterns</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-5 h-5 text-blue-300" />
              <h3 className="text-text-secondary text-sm font-medium uppercase">Total Check-Ins</h3>
            </div>
            <p className="text-3xl font-bold">{reflections.length}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="w-5 h-5 text-success" />
              <h3 className="text-text-secondary text-sm font-medium uppercase">Recent Mood</h3>
            </div>
            <p className="text-3xl font-bold">{reflections[0]?.mood || '--'}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-text-secondary text-sm font-medium uppercase">Streak</h3>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>

        {/* Reflections Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {reflections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Mood
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Energy
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reflections.map((reflection) => (
                    <tr key={reflection.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {reflection.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          {reflection.mood || '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {reflection.energy || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {reflection.confidence || '--'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {reflection.notes || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Brain}
              title="No stress data yet"
              description="Start tracking your daily mood and energy levels to identify stress triggers and patterns."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                  Log Your First Check-In
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
