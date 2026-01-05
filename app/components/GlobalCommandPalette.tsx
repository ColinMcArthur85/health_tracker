'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Dumbbell, 
  Camera, 
  Utensils, 
  Moon, 
  Smile, 
  Calendar,
  TrendingUp,
  Settings,
  X
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export default function GlobalCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'log-workout',
      label: 'Log Workout',
      description: 'Record your training session',
      icon: <Dumbbell className="w-4 h-4" />,
      action: () => router.push(`/dashboard/journal/${new Date().toISOString().split('T')[0]}`),
      keywords: ['workout', 'exercise', 'training', 'gym', 'log'],
    },
    {
      id: 'upload-photo',
      label: 'Upload Progress Photo',
      description: 'Add a new progress photo',
      icon: <Camera className="w-4 h-4" />,
      action: () => router.push('/dashboard/photos'),
      keywords: ['photo', 'picture', 'progress', 'upload', 'image'],
    },
    {
      id: 'log-nutrition',
      label: 'Log Nutrition',
      description: 'Track your meals',
      icon: <Utensils className="w-4 h-4" />,
      action: () => router.push(`/dashboard/journal/${new Date().toISOString().split('T')[0]}`),
      keywords: ['nutrition', 'food', 'meal', 'eat', 'calories'],
    },
    {
      id: 'log-sleep',
      label: 'Log Sleep',
      description: 'Record sleep hours',
      icon: <Moon className="w-4 h-4" />,
      action: () => router.push('/dashboard/sleep'),
      keywords: ['sleep', 'rest', 'hours', 'bed'],
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      description: 'See your progress trends',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => router.push('/dashboard/analytics'),
      keywords: ['analytics', 'trends', 'progress', 'stats', 'charts'],
    },
    {
      id: 'check-mood',
      label: 'Log Mood',
      description: 'Track emotional state',
      icon: <Smile className="w-4 h-4" />,
      action: () => router.push('/dashboard/mood'),
      keywords: ['mood', 'emotion', 'feeling', 'mental'],
    },
    {
      id: 'view-photos',
      label: 'Progress Photos',
      description: 'View photo gallery',
      icon: <Camera className="w-4 h-4" />,
      action: () => router.push('/dashboard/photos'),
      keywords: ['photos', 'gallery', 'pictures', 'progress'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'App preferences',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/dashboard/settings'),
      keywords: ['settings', 'preferences', 'config'],
    },
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(kw => kw.includes(searchLower))
    );
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      setSearch('');
      setSelectedIndex(0);
    }

    if (!isOpen) return;

    // Escape to close
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }

    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }

    // Enter to execute
    if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
      setSearch('');
    }
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input */}
        <div className="flex items-center space-x-3 p-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search actions..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No results found for "{search}"</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    idx === selectedIndex
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-950/50">
                    {cmd.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{cmd.label}</p>
                    {cmd.description && (
                      <p className={`text-sm ${idx === selectedIndex ? 'text-blue-200' : 'text-slate-500'}`}>
                        {cmd.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-slate-800 rounded">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-slate-800 rounded">Enter</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-slate-800 rounded">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="text-slate-600">Press ⌘K to open anytime</span>
        </div>
      </div>
    </div>
  );
}
