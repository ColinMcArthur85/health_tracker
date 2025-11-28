import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import db from '@/lib/db';
import { formatUTCDateLong, getUTCMidnight } from '@/lib/dateUtils';
import { Dumbbell, Clock, Flame } from 'lucide-react';
import { Prisma } from '@prisma/client';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WorkoutsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const keyword = typeof params.q === 'string' ? params.q : '';
  const start = typeof params.start === 'string' ? params.start : '';
  const end = typeof params.end === 'string' ? params.end : '';
  const typeFilter = typeof params.type === 'string' ? params.type : '';
  const intensityFilter = typeof params.intensity === 'string' ? params.intensity : '';

  const dateFilter: Prisma.WorkoutWhereInput['dailyLog'] = {};
  if (start) {
    dateFilter.date = { ...(dateFilter.date || {}), gte: getUTCMidnight(start) };
  }
  if (end) {
    const endDate = getUTCMidnight(end);
    endDate.setUTCHours(23, 59, 59, 999);
    dateFilter.date = { ...(dateFilter.date || {}), lte: endDate };
  }

  const where: Prisma.WorkoutWhereInput = {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(intensityFilter ? { intensity: intensityFilter } : {}),
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { type: { contains: keyword, mode: 'insensitive' } },
            { instructor: { contains: keyword, mode: 'insensitive' } },
            { platform: { contains: keyword, mode: 'insensitive' } },
            { focusArea: { contains: keyword, mode: 'insensitive' } },
            { notes: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(start || end ? { dailyLog: dateFilter } : {}),
  };

  const workouts = await db.workout.findMany({
    where,
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
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workouts</h1>
            <p className="text-slate-400">Track and analyze your training sessions</p>
          </div>
          {keyword || start || end || typeFilter || intensityFilter ? (
            <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
              Filters active
            </div>
          ) : null}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Dumbbell className="w-5 h-5 text-blue-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Total Workouts</h3>
            </div>
            <p className="text-3xl font-bold">{totalWorkouts}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Total Time</h3>
            </div>
            <p className="text-3xl font-bold">{Math.round(totalMinutes / 60)}h</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Avg Duration</h3>
            </div>
            <p className="text-3xl font-bold">{avgDuration}min</p>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          showSearch
          showType
          showIntensity
          typeOptions={['Strength', 'Cardio', 'Mobility', 'Yoga', 'Rest', 'Other']}
          intensityOptions={['Low', 'Moderate', 'High']}
          initialKeyword={keyword}
          initialStartDate={start}
          initialEndDate={end}
          initialType={typeFilter}
          initialIntensity={intensityFilter}
        />

        {/* Workouts List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Workout
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Intensity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Instructor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {workouts.map((workout) => (
                  <tr key={workout.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatUTCDateLong(workout.dailyLog.date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {workout.name || 'Untitled Workout'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workout.type === 'Strength' ? 'bg-blue-500/20 text-blue-400' :
                        workout.type === 'Cardio' ? 'bg-orange-500/20 text-orange-400' :
                        workout.type === 'Mobility' ? 'bg-emerald-500/20 text-emerald-400' :
                        workout.type === 'Yoga' ? 'bg-purple-500/20 text-purple-400' :
                        workout.type === 'Rest' ? 'bg-slate-600/20 text-slate-200' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {workout.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {workout.duration ? `${workout.duration} min` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workout.intensity === 'High' ? 'bg-red-500/20 text-red-400' :
                        workout.intensity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                        workout.intensity === 'Low' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {workout.intensity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {workout.instructor || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {workouts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No workouts found for these filters</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
