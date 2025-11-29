'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Dumbbell, Apple, Heart, Calendar } from 'lucide-react';
import FoodSearch, { SelectedFood } from './FoodSearch';

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTab?: TabType;
}

type TabType = 'workout' | 'nutrition' | 'checkin';

export default function LogEntryModal({ isOpen, onClose, initialDate, initialTab = 'workout' }: LogEntryModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Workout state
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutIntensity, setWorkoutIntensity] = useState('');
  
  // Nutrition state
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  
  // Check-in state
  const [weight, setWeight] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [water, setWater] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (activeTab === 'workout') {
        await handleWorkoutSubmit();
      } else if (activeTab === 'nutrition') {
        await handleNutritionSubmit();
      } else if (activeTab === 'checkin') {
        await handleCheckInSubmit();
      }
      
      router.refresh();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkoutSubmit = async () => {
    const response = await fetch('/api/log/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        type: workoutType,
        duration: workoutDuration ? parseInt(workoutDuration) : null,
        intensity: workoutIntensity || null,
      }),
    });

    if (!response.ok) throw new Error('Failed to save workout');
  };

  const handleNutritionSubmit = async () => {
    const totals = selectedFoods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0) * food.quantity,
      protein: acc.protein + (food.protein || 0) * food.quantity,
      carbs: acc.carbs + (food.carbs || 0) * food.quantity,
      fat: acc.fat + (food.fat || 0) * food.quantity,
      fiber: acc.fiber + (food.fiber || 0) * food.quantity,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    const response = await fetch('/api/log/nutrition', {
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

    if (!response.ok) throw new Error('Failed to save nutrition');
  };

  const handleCheckInSubmit = async () => {
    const response = await fetch('/api/log/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        weight: weight ? parseFloat(weight) : null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        water: water ? parseInt(water) : null,
      }),
    });

    if (!response.ok) throw new Error('Failed to save check-in');
  };

  const resetForm = () => {
    setWorkoutType('');
    setWorkoutDuration('');
    setWorkoutIntensity('');
    setSelectedFoods([]);
    setWeight('');
    setSleepHours('');
    setWater('');
  };

  const tabs = [
    { id: 'workout' as TabType, label: 'Workout', icon: Dumbbell, color: 'blue' },
    { id: 'nutrition' as TabType, label: 'Nutrition', icon: Apple, color: 'emerald' },
    { id: 'checkin' as TabType, label: 'Check-In', icon: Heart, color: 'purple' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Log Entry</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? `bg-${tab.color}-600 text-white`
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'workout' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Workout Type *</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Running">Running</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Stretching">Stretching</option>
                  <option value="Walking">Walking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    placeholder="30"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Intensity</label>
                  <select
                    value={workoutIntensity}
                    onChange={(e) => setWorkoutIntensity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <FoodSearch onFoodsChange={setSelectedFoods} initialFoods={selectedFoods} />
            </div>
          )}

          {activeTab === 'checkin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    step="0.1"
                    placeholder="150"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Sleep (hrs)</label>
                  <input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    step="0.5"
                    placeholder="8"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Water (ml)</label>
                  <input
                    type="number"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    placeholder="2000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-slate-800">
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
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
