'use client';

import { useState } from 'react';
import { Plus, X, Dumbbell, Camera, Utensils, Moon, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const todayDate = new Date().toISOString().split('T')[0];

  const actions = [
    {
      id: 'workout',
      label: 'Log Workout',
      icon: <Dumbbell className="w-5 h-5" />,
      color: 'blue',
      action: () => router.push(`/dashboard/journal/${todayDate}`),
      shortcut: '⌘W',
    },
    {
      id: 'photo',
      label: 'Upload Photo',
      icon: <Camera className="w-5 h-5" />,
      color: 'rose',
      action: () => router.push('/dashboard/photos'),
      shortcut: '⌘P',
    },
    {
      id: 'nutrition',
      label: 'Log Meal',
      icon: <Utensils className="w-5 h-5" />,
      color: 'emerald',
      action: () => router.push(`/dashboard/journal/${todayDate}`),
      shortcut: '⌘N',
    },
    {
      id: 'sleep',
      label: 'Log Sleep',
      icon: <Moon className="w-5 h-5" />,
      color: 'purple',
      action: () => router.push('/dashboard/sleep'),
      shortcut: '⌘S',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-500',
    rose: 'bg-rose-600 hover:bg-rose-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    purple: 'bg-purple-600 hover:bg-purple-500',
  };

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Action Items */}
      <div
        className={`mb-4 space-y-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              action.action();
              setIsOpen(false);
            }}
            className={`${
              colorClasses[action.color as keyof typeof colorClasses]
            } text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 font-medium transition-all hover:scale-105 w-full`}
          >
            {action.icon}
            <span>{action.label}</span>
            <span className="text-xs opacity-75 ml-auto">{action.shortcut}</span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-700 rotate-45'
            : 'bg-white hover:bg-slate-100 text-slate-950'
        }`}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <Plus className="w-7 h-7" />}
      </button>
    </div>
  );
}
