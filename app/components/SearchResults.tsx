'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Calendar, Clock, Zap, Edit2, Trash2 } from 'lucide-react';
import { formatUTCDateLong } from '@/lib/dateUtils';
import EditWorkoutModal from './EditWorkoutModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface Workout {
  id: string;
  type?: string | null;
  name?: string | null;
  instructor?: string | null;
  platform?: string | null;
  duration?: number | null;
  intensity?: string | null;
  focusArea?: string | null;
  notes?: string | null;
  dailyLog: {
    id: string;
    date: string | Date;
  };
}

interface SearchResultsProps {
  workouts: Workout[];
  summary: {
    count: number;
    totalDuration: number;
  };
}

export default function SearchResults({ workouts, summary }: SearchResultsProps) {
  const router = useRouter();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingWorkout) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/log/workout/${deletingWorkout.id}`, {
        method: 'DELETE',
      });
      router.refresh();
      setDeletingWorkout(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
        <Dumbbell className="mx-auto text-slate-600 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No workouts found</h3>
        <p className="text-slate-500">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Dumbbell className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Workouts Found</p>
              <p className="text-2xl font-bold">{summary.count}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/20 rounded-lg">
              <Clock className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Duration</p>
              <p className="text-2xl font-bold">{summary.totalDuration} mins</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Zap className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Duration</p>
              <p className="text-2xl font-bold">
                {summary.count > 0 ? Math.round(summary.totalDuration / summary.count) : 0} mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Dumbbell className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {workout.name || workout.type || 'Workout'}
                    </h3>
                    {workout.name && workout.type && (
                      <p className="text-sm text-slate-400">{workout.type}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={16} className="text-slate-500" />
                    <span>{formatUTCDateLong(typeof workout.dailyLog.date === 'string' ? new Date(workout.dailyLog.date) : workout.dailyLog.date)}</span>
                  </div>
                  {workout.duration && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock size={16} className="text-slate-500" />
                      <span>{workout.duration} mins</span>
                    </div>
                  )}
                  {workout.intensity && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Zap size={16} className="text-slate-500" />
                      <span>{workout.intensity}</span>
                    </div>
                  )}
                  {workout.focusArea && (
                    <div className="text-slate-300">
                      <span className="text-slate-500">Focus: </span>
                      {workout.focusArea}
                    </div>
                  )}
                </div>

                {(workout.instructor || workout.platform) && (
                  <div className="flex gap-4 text-sm text-slate-400 mb-2">
                    {workout.instructor && <span>Instructor: {workout.instructor}</span>}
                    {workout.platform && <span>Platform: {workout.platform}</span>}
                  </div>
                )}

                {workout.notes && (
                  <p className="text-sm text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {workout.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingWorkout(workout)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit workout"
                >
                  <Edit2 size={16} className="text-blue-400" />
                </button>
                <button
                  onClick={() => setDeletingWorkout(workout)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Delete workout"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingWorkout && (
        <EditWorkoutModal
          isOpen={!!editingWorkout}
          onClose={() => setEditingWorkout(null)}
          workout={editingWorkout}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deletingWorkout}
        onClose={() => setDeletingWorkout(null)}
        onConfirm={handleDelete}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}
