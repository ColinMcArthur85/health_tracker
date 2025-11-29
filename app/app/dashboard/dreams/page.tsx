'use client';

import { useState, useEffect } from 'react';
import { Plus, CloudRain, Loader2 } from 'lucide-react';
import DreamEntryModal from '@/components/dreams/DreamEntryModal';
import DreamCard from '@/components/dreams/DreamCard';

export default function DreamLogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreams, setDreams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const response = await fetch('/api/dreams');
      if (response.ok) {
        const data = await response.json();
        setDreams(data);
      }
    } catch (error) {
      console.error('Failed to fetch dreams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDream = (newDream: any) => {
    setDreams([newDream, ...dreams]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CloudRain className="w-8 h-8 text-blue-500" />
            Dream Log
          </h1>
          <p className="text-slate-400 mt-1">Record and analyze your dreams to uncover hidden patterns.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Dream
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : dreams.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
          <CloudRain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No dreams recorded yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Start logging your dreams to see AI-powered insights and track your subconscious themes over time.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Log your first dream &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      )}

      <DreamEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDream}
      />
    </div>
  );
}
