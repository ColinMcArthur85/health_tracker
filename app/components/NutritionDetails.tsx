'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import EditNutritionModal from './EditNutritionModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface FoodItem {
  id: string;
  name: string;
  fdcId?: string | null;
  servingSize?: number | null;
  servingUnit?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
}

interface Nutrition {
  id: string;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  mealsJson?: string | null;
  foodItems?: FoodItem[];
}

export default function NutritionDetails({ nutrition }: { nutrition?: Nutrition | null }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleDeleteFoodItem = async (foodItemId: string) => {
    try {
      await fetch(`/api/log/nutrition/food/${foodItemId}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting food item:', error);
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

      {/* Individual Food Items */}
      {nutrition.foodItems && nutrition.foodItems.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-slate-400">Food Items:</p>
          {nutrition.foodItems.map((item) => (
            <div key={item.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.servingSize} {item.servingUnit}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{item.calories || 0} cal</span>
                    <span>{item.protein || 0}g protein</span>
                    <span>{item.carbs || 0}g carbs</span>
                    <span>{item.fat || 0}g fat</span>
                    {item.fiber && <span>{item.fiber}g fiber</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFoodItem(item.id)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors ml-2"
                  title="Remove this item"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
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
