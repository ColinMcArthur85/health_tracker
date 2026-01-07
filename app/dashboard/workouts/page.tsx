import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import db from '@/lib/db';
import { formatUTCDateLong } from '@/lib/dateUtils';
import { Dumbbell, Clock, Flame } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

import { StatCard } from '@/components/StatCards';

export default async function WorkoutsPage() {
  const workouts = await db.workout.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
  });

  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm font-bold text-success uppercase tracking-widest">Physical Activity</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
              Workouts
            </h1>
            <p className="text-text-secondary text-lg font-medium">Track and analyze your training sessions</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<Dumbbell className="w-5 h-5 text-blue-300" />} 
            label="Total Workouts" 
            value={totalWorkouts} 
          />
          <StatCard 
            icon={<Clock className="w-5 h-5 text-success" />} 
            label="Total Time" 
            value={`${Math.round(totalMinutes / 60)}h`} 
          />
          <StatCard 
            icon={<Flame className="w-5 h-5 text-warning" />} 
            label="Avg Duration" 
            value={`${avgDuration}m`} 
          />
        </div>

        {/* Filters */}
        <FilterBar>
          <select className="bg-background-raised border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-secondary focus:outline-none focus:border-emerald-500/50 transition-all">
            <option>All Types</option>
            <option>Strength</option>
            <option>Cardio</option>
            <option>Mobility</option>
          </select>
          
          <select className="bg-background-raised border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-secondary focus:outline-none focus:border-emerald-500/50 transition-all">
            <option>All Intensity</option>
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
          </select>
        </FilterBar>

        {/* Workouts List */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface/50 border-b border-border-subtle">
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Workout
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Duration
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Intensity
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Instructor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {workouts.map((workout) => (
                  <tr key={workout.id} className="hover:bg-surface/30 transition-all duration-200 group">
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {formatUTCDateLong(workout.dailyLog.date)}
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-text-primary group-hover:text-success transition-colors">
                      {workout.name || 'Untitled Workout'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        workout.type === 'Strength' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30' :
                        workout.type === 'Cardio' ? 'bg-orange-500/10 text-orange-300 border border-orange-500/30' :
                        workout.type === 'Mobility' ? 'bg-emerald-500/10 text-success border border-emerald-500/30' :
                        'bg-surface-interactive text-text-secondary border border-border-strong'
                      }`}>
                        {workout.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-text-secondary">
                      {workout.duration ? `${workout.duration} min` : '--'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        workout.intensity === 'High' ? 'bg-red-500/15 text-red-300 border border-red-400/30' :
                        workout.intensity === 'Moderate' ? 'bg-yellow-500/15 text-warning border border-yellow-400/30' :
                        workout.intensity === 'Low' ? 'bg-green-500/15 text-success border border-green-400/30' :
                        'bg-surface-interactive text-text-secondary border border-border-strong'
                      }`}>
                        {workout.intensity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-text-tertiary font-medium">
                      {workout.instructor || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {workouts.length === 0 && (
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              description="Start tracking your training sessions to see your progress over time. Every workout counts!"
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                  Log Your First Workout
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
