'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FoodSearch, { SelectedFood } from '../FoodSearch';

export default function NutritionFormWithAPI({ date, onClose }: { date: string, onClose?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedFoods.length === 0) {
      alert('Please add at least one food item');
      return;
    }

    setIsLoading(true);

    try {
      const totals = selectedFoods.reduce((acc, food) => ({
        calories: acc.calories + (food.calories || 0) * food.quantity,
        protein: acc.protein + (food.protein || 0) * food.quantity,
        carbs: acc.carbs + (food.carbs || 0) * food.quantity,
        fat: acc.fat + (food.fat || 0) * food.quantity,
        fiber: acc.fiber + (food.fiber || 0) * food.quantity,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

      await fetch('/api/log/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein),
          carbs: Math.round(totals.carbs),
          fat: Math.round(totals.fat),
          fiber: Math.round(totals.fiber),
          foodItems: selectedFoods.map(food => ({
            name: food.name,
            fdcId: food.fdcId,
            servingSize: (food.servingSize || 100) * food.quantity,
            servingUnit: food.servingUnit || 'g',
            calories: Math.round((food.calories || 0) * food.quantity),
            protein: Math.round((food.protein || 0) * food.quantity),
            carbs: Math.round((food.carbs || 0) * food.quantity),
            fat: Math.round((food.fat || 0) * food.quantity),
            fiber: Math.round((food.fiber || 0) * food.quantity),
          })),
        }),
      });

      router.refresh();
      onClose?.();
    } catch (error) {
      console.error(error);
      alert('Failed to save nutrition. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FoodSearch onFoodsChange={setSelectedFoods} initialFoods={selectedFoods} />

      <button 
        type="submit" 
        disabled={isLoading || selectedFoods.length === 0}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Nutrition'}
      </button>
    </form>
  );
}
