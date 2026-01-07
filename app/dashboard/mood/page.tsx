import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import db from '@/lib/db';
import { Heart, Smile, Zap, Pill } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { MiniStatCard } from '@/components/StatCards';

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

  const medications = await db.medication.findMany({
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
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-300/80 uppercase tracking-widest">Internal State</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Mood Tracker
          </h1>
          <p className="text-text-secondary text-lg font-medium">Track emotional state, energy levels, and mental clarity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniStatCard
            label="Mood Logs"
            value={reflections.filter(r => r.mood).length}
            icon={<Smile className="w-5 h-5 text-red-300" />}
          />
          <MiniStatCard
            label="Energy Logs"
            value={reflections.filter(r => r.energy).length}
            icon={<Zap className="w-5 h-5 text-warning" />}
          />
          <MiniStatCard
            label="Supplements"
            value={checkIns.filter(c => c.supplements).length}
            icon={<Pill className="w-5 h-5 text-success" />}
          />
          <MiniStatCard
            label="Medications"
            value={medications.length}
            icon={<Heart className="w-5 h-5 text-blue-300" />}
          />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Mood & Energy */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          <div className="bg-surface/50 px-8 py-6 border-b border-border-subtle">
            <h2 className="text-xl font-bold text-text-primary">Mood & Energy Tracking</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface/30 border-b border-border-subtle">
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Mood</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Energy</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Confidence</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {reflections.map((reflection) => (
                  <tr key={reflection.id} className="hover:bg-surface/30 transition-all duration-200 group">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-red-300 transition-colors">
                      {reflection.dailyLog.date.toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">{reflection.mood || '--'}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">{reflection.energy || '--'}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">{reflection.confidence || '--'}</td>
                    <td className="px-8 py-6 text-sm text-text-tertiary group-hover:text-text-secondary transition-colors max-w-xs truncate">
                      {reflection.notes || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reflections.length === 0 && (
            <EmptyState
              icon={Smile}
              title="No mood data yet"
              description="Track your emotional patterns, energy levels, and mental clarity. Understanding your mood cycles helps optimize your daily routines."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-pink-500/10">
                  Log Your First Mood
                </Link>
              }
            />
          )}
        </div>

        {/* Medications */}
        {medications.length > 0 && (
          <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
            <div className="bg-surface/50 px-8 py-6 border-b border-border-subtle">
              <h2 className="text-xl font-bold text-text-primary">Medications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface/30 border-b border-border-subtle">
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Medication</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Dosage</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Taken</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/30">
                  {medications.map((med) => (
                    <tr key={med.id} className="hover:bg-surface/30 transition-all duration-200 group">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-text-primary group-hover:text-blue-300 transition-colors">
                        {med.dailyLog.date.toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">{med.name}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">{med.dosage || '--'}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          med.taken ? 'bg-emerald-500/10 text-success border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {med.taken ? 'Yes' : 'No'}
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

