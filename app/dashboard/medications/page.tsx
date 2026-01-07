import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Pill, Calendar, CheckCircle } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { StatCard } from '@/components/StatCards';

export default async function MedicationsPage() {
  const medications = await db.medication.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const totalMeds = medications.length;
  const takenCount = medications.filter((m) => m.taken).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-success/80 uppercase tracking-widest">Medical</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Medications
          </h1>
          <p className="text-text-secondary text-lg font-medium">Track your medication adherence and dosages</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<Pill className="w-5 h-5 text-blue-300" />} 
            label="Total Logs" 
            value={totalMeds} 
          />
          <StatCard 
            icon={<CheckCircle className="w-5 h-5 text-success" />} 
            label="Taken" 
            value={takenCount} 
          />
          <StatCard 
            icon={<Calendar className="w-5 h-5 text-purple-400" />} 
            label="Adherence" 
            value={`${totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0}%`} 
          />
        </div>

        {/* Medications Table */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          {medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface/50 border-b border-border-subtle">
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Medication</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Dosage</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/30">
                  {medications.map((med) => (
                    <tr key={med.id} className="hover:bg-surface/30 transition-all duration-200 group">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-success transition-colors">
                        {med.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-sm text-text-primary transition-colors">{med.name}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">{med.dosage || '--'}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          med.taken ? 'bg-emerald-500/10 text-success border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {med.taken ? 'Taken' : 'Skipped'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors max-w-xs truncate">
                        {med.notes || '--'}
                      </td>
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
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/10">
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

