'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkoutForm({ date, onClose }: { date: string, onClose?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      type: formData.get('type'),
      duration: parseInt(formData.get('duration') as string),
      intensity: formData.get('intensity'),
      notes: formData.get('notes'),
      date: date, // Pass date to associate
    };

    try {
      // We'll reuse the chat API for now or create a dedicated one. 
      // For simplicity, let's just use a direct server action or a new API route.
      // Let's assume we'll create /api/log/workout
      await fetch('/api/log/workout', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.refresh();
      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
        <select name="type" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
          <option>Strength</option>
          <option>Cardio</option>
          <option>Mobility</option>
          <option>Yoga</option>
          <option>Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Duration (mins)</label>
        <input name="duration" type="number" required className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Intensity</label>
        <select name="intensity" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
        <textarea name="notes" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white h-24" />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Workout'}
      </button>
    </form>
  );
}
