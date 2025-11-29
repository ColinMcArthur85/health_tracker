'use client';

import { useState } from 'react';
import { Dumbbell, Apple, Moon, Scale, Droplets, Heart, Activity } from 'lucide-react';
import LogEntryModal from './LogEntryModal';

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'checkin'>('workout');

  const openModal = (tab: 'workout' | 'nutrition' | 'checkin') => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  const actions = [
    {
      id: 'workout' as const,
      label: 'Workout',
      icon: Dumbbell,
      color: 'blue',
      bgColor: 'bg-blue-600/10',
      hoverColor: 'hover:bg-blue-600/20',
      borderColor: 'border-blue-600/30',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-100',
    },
    {
      id: 'nutrition' as const,
      label: 'Nutrition',
      icon: Apple,
      color: 'emerald',
      bgColor: 'bg-emerald-600/10',
      hoverColor: 'hover:bg-emerald-600/20',
      borderColor: 'border-emerald-600/30',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-100',
    },
    {
      id: 'checkin' as const,
      label: 'Check-In',
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-600/10',
      hoverColor: 'hover:bg-purple-600/20',
      borderColor: 'border-purple-600/30',
      iconColor: 'text-purple-400',
      textColor: 'text-purple-100',
      description: 'Sleep, Weight, Hydration',
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => openModal(action.id)}
                className={`${action.bgColor} ${action.hoverColor} border ${action.borderColor} p-4 rounded-xl flex flex-col items-center gap-2 transition-all group`}
              >
                <Icon className={`${action.iconColor} group-hover:scale-110 transition-transform`} size={28} />
                <span className={`text-sm font-medium ${action.textColor}`}>{action.label}</span>
                {action.description && (
                  <span className="text-xs text-slate-500">{action.description}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <LogEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={activeTab}
      />
    </>
  );
}
