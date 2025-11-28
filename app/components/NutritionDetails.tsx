'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import EditNutritionModal from './EditNutritionModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface Nutrition {
  id: string;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  mealsJson?: string | null;
}

export default function NutritionDetails({ nutrition }: { nutrition?: Nutrition | null }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const meals = (() => {
    if (!nutrition?.mealsJson) return [];
    try {
      const parsed = JSON.parse(nutrition.mealsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  })();

  const handleDelete = async () => {
    if (!nutrition) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/log/nutrition/${nutrition.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting nutrition:', error);
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (!nutrition) {
    return <p className="text-slate-500 italic text-sm">No nutrition logged.</p>;
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-emerald-400">Nutrition</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit nutrition"
          >
            <Edit2 size={16} className="text-blue-400" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete nutrition"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MacroCard label="Calories" value={nutrition.calories ?? '-'} />
        <MacroCard label="Protein" value={nutrition.protein ? `${nutrition.protein}g` : '-'} highlight />
        <MacroCard label="Carbs" value={nutrition.carbs ? `${nutrition.carbs}g` : '-'} />
        <MacroCard label="Fat" value={nutrition.fat ? `${nutrition.fat}g` : '-'} />
        <MacroCard label="Fiber" value={nutrition.fiber ? `${nutrition.fiber}g` : '-'} />
      </div>

      {meals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">Meals Logged:</p>
          {meals.map((meal, i) => (
            <div key={i} className="text-sm bg-slate-950 p-2 rounded border border-slate-800">
              {typeof meal === 'string' ? meal : JSON.stringify(meal)}
            </div>
          ))}
        </div>
      )}

      {isEditing && nutrition && (
        <EditNutritionModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          nutrition={nutrition}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Nutrition"
        message="This will remove the nutrition entry for this day."
        isDeleting={isDeleting}
      />
    </div>
  );
}

function MacroCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`bg-slate-950 p-3 rounded-lg text-center border border-slate-800 ${highlight ? 'border-emerald-700/60' : ''}`}>
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-emerald-400' : ''}`}>{value}</p>
    </div>
  );
}
