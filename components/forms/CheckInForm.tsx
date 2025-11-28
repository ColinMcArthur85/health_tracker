'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInForm({ date, onClose }: { date: string, onClose?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      date,
      weight: formData.get('weight'),
      sleep: formData.get('sleep'),
      mood: formData.get('mood'),
    };

    try {
      await fetch('/api/log/checkin', {
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
        <label className="block text-sm font-medium text-slate-400 mb-1">Weight (lbs)</label>
        <input name="weight" type="number" step="0.1" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Sleep (hours)</label>
        <input name="sleep" type="number" step="0.5" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Mood</label>
        <select name="mood" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
          <option>Great</option>
          <option>Good</option>
          <option>Okay</option>
          <option>Tired</option>
          <option>Anxious</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Check-In'}
      </button>
    </form>
  );
}
