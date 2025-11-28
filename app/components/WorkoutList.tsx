'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import EditWorkoutModal from './EditWorkoutModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface Workout {
  id: string;
  type?: string | null;
  duration?: number | null;
  intensity?: string | null;
  notes?: string | null;
  name?: string | null;
  instructor?: string | null;
  platform?: string | null;
  focusArea?: string | null;
}

interface WorkoutListProps {
  workouts: Workout[];
}

export default function WorkoutList({ workouts }: WorkoutListProps) {
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

  if (!workouts || workouts.length === 0) {
    return <p className="text-slate-500 italic text-sm">No workouts yet.</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {workouts.map((w) => (
          <div
            key={w.id}
            className="flex justify-between items-start border-b border-slate-800 pb-3 last:border-0 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{w.type || 'Workout'}</p>
                {w.name && <span className="text-xs text-slate-500">• {w.name}</span>}
              </div>
              <p className="text-sm text-slate-400">
                {w.duration ? `${w.duration} mins` : ''} 
                {w.duration && w.intensity ? ' • ' : ''}
                {w.intensity || ''}
              </p>
              {w.notes && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{w.notes}</p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingWorkout(w)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit workout"
              >
                <Edit2 size={16} className="text-blue-400" />
              </button>
              <button
                onClick={() => setDeletingWorkout(w)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete workout"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
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
    </>
  );
}
