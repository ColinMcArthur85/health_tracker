import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Pill, Calendar, CheckCircle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default async function MedicationsPage() {
  const medications = await (db as any).medication.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const totalMeds = medications.length;
 const takenCount = medications.filter((m: any) => m.taken).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Medications</h1>
          <p className="text-slate-400">Track your medication adherence and dosages</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Pill className="w-5 h-5 text-blue-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Total Logs</h3>
            </div>
            <p className="text-3xl font-bold">{totalMeds}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Taken</h3>
            </div>
            <p className="text-3xl font-bold">{takenCount}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Adherence</h3>
            </div>
            <p className="text-3xl font-bold">{totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0}%</p>
          </div>
        </div>

        {/* Medications Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Medication</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dosage</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {medications.map((med: any) => (
                    <tr key={med.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {med.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{med.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{med.dosage || '--'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          med.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {med.taken ? 'Taken' : 'Skipped'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{med.notes || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Pill}
              title="No medications logged yet"
              description="Track your medication adherence to ensure consistent treatment and better health outcomes."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                  Log Your First Medication
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
