'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface EditWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: {
    id: string;
    type?: string | null;
    duration?: number | null;
    intensity?: string | null;
    notes?: string | null;
    name?: string | null;
    instructor?: string | null;
    platform?: string | null;
    focusArea?: string | null;
  };
}

export default function EditWorkoutModal({ isOpen, onClose, workout }: EditWorkoutModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      type: formData.get('type'),
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : null,
      intensity: formData.get('intensity'),
      notes: formData.get('notes'),
      name: formData.get('name'),
      instructor: formData.get('instructor'),
      platform: formData.get('platform'),
      focusArea: formData.get('focusArea'),
    };

    try {
      await fetch(`/api/log/workout/${workout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Workout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
              <select
                name="type"
                defaultValue={workout.type || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="">Select type</option>
                <option>Strength</option>
                <option>Cardio</option>
                <option>Mobility</option>
                <option>Yoga</option>
                <option>Rest</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Duration (mins)</label>
              <input
                name="duration"
                type="number"
                defaultValue={workout.duration || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Intensity</label>
              <select
                name="intensity"
                defaultValue={workout.intensity || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="">Select intensity</option>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Focus Area</label>
              <input
                name="focusArea"
                type="text"
                defaultValue={workout.focusArea || ''}
                placeholder="e.g., Upper body, Legs"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Workout Name</label>
            <input
              name="name"
              type="text"
              defaultValue={workout.name || ''}
              placeholder="e.g., Morning HIIT"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Instructor</label>
              <input
                name="instructor"
                type="text"
                defaultValue={workout.instructor || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Platform</label>
              <input
                name="platform"
                type="text"
                defaultValue={workout.platform || ''}
                placeholder="e.g., AloMoves, Peloton"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
            <textarea
              name="notes"
              defaultValue={workout.notes || ''}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white h-24"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

