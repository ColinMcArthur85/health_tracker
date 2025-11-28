'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface Nutrition {
  id: string;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  mealsJson?: string | null;
  microsJson?: string | null;
}

interface EditNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nutrition: Nutrition;
}

export default function EditNutritionModal({ isOpen, onClose, nutrition }: EditNutritionModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const initialMeals = useMemo(() => {
    if (!nutrition.mealsJson) return '';
    try {
      const parsed = JSON.parse(nutrition.mealsJson);
      if (Array.isArray(parsed)) {
        return parsed.map((m) => (typeof m === 'string' ? m : m?.item || '')).filter(Boolean).join('\n');
      }
    } catch (e) {
      return '';
    }
    return '';
  }, [nutrition.mealsJson]);

  const [meals, setMeals] = useState(initialMeals);

  if (!isOpen) return null;

  const toNumber = (value: FormDataEntryValue | null) => {
    if (value === null) return null;
    const num = parseFloat(String(value));
    return Number.isFinite(num) ? num : null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const mealsArray = meals
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      calories: toNumber(formData.get('calories')),
      protein: toNumber(formData.get('protein')),
      carbs: toNumber(formData.get('carbs')),
      fat: toNumber(formData.get('fat')),
      fiber: toNumber(formData.get('fiber')),
      mealsJson: mealsArray.length > 0 ? JSON.stringify(mealsArray) : null,
    };

    try {
      await fetch(`/api/log/nutrition/${nutrition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating nutrition:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit Nutrition</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close edit nutrition modal"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField label="Calories" name="calories" defaultValue={nutrition.calories ?? ''} />
            <FormField label="Protein (g)" name="protein" defaultValue={nutrition.protein ?? ''} />
            <FormField label="Carbs (g)" name="carbs" defaultValue={nutrition.carbs ?? ''} />
            <FormField label="Fat (g)" name="fat" defaultValue={nutrition.fat ?? ''} />
            <FormField label="Fiber (g)" name="fiber" defaultValue={nutrition.fiber ?? ''} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Meals (one per line)</label>
            <textarea
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white h-28"
              placeholder="Breakfast: oats&#10;Lunch: salad"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? ''}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
      />
    </div>
  );
}
