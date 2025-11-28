'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NutritionForm({ date, onClose }: { date: string, onClose?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'quick' | 'macros'>('quick');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Logic to handle quick add vs macros
    const data = {
      date,
      mode,
      meal: formData.get('meal'),
      calories: formData.get('calories'),
      protein: formData.get('protein'),
    };

    try {
      await fetch('/api/log/nutrition', {
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
      <div className="flex gap-2 mb-4">
        <button 
          type="button"
          onClick={() => setMode('quick')}
          className={`flex-1 p-2 rounded-lg text-sm ${mode === 'quick' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          Quick Add
        </button>
        <button 
          type="button"
          onClick={() => setMode('macros')}
          className={`flex-1 p-2 rounded-lg text-sm ${mode === 'macros' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          Macros
        </button>
      </div>

      {mode === 'quick' ? (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">What did you eat?</label>
          <textarea 
            name="meal" 
            placeholder="e.g. 2 eggs and toast"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white h-24" 
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Calories</label>
            <input name="calories" type="number" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Protein (g)</label>
            <input name="protein" type="number" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
          </div>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Nutrition'}
      </button>
    </form>
  );
}
