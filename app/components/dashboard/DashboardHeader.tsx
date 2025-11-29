'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ExportButton from '@/components/ExportButton';
import LogEntryModal from '@/components/LogEntryModal';

export default function DashboardHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, Colin 💪</h1>
        <p className="text-slate-400">Here's your health overview</p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Log Entry
        </button>
        <ExportButton />
      </div>

      <LogEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
