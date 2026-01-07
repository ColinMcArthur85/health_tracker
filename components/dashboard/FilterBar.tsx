'use client';

import { ReactNode } from 'react';
import { Calendar, Filter, X } from 'lucide-react';

interface FilterBarProps {
  onDateRangeChange?: (start: string, end: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onClearFilters?: () => void;
  children?: ReactNode;
}

export default function FilterBar({ 
  onDateRangeChange, 
  onFilterChange, 
  onClearFilters,
  children 
}: FilterBarProps) {
  return (
    <div className="glass rounded-2xl p-5 mb-8 border border-border-subtle shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-text-secondary" />
            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="bg-background-raised border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-primary font-medium focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer hover:bg-surface-interactive/50"
                placeholder="Start date"
              />
              <span className="text-text-tertiary font-bold text-xs uppercase tracking-widest px-1">to</span>
              <input
                type="date"
                className="bg-background-raised border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-primary font-medium focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer hover:bg-surface-interactive/50"
                placeholder="End date"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {children}
          </div>
        </div>
        
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-surface-interactive rounded-xl transition-all border border-border-subtle hover:border-border"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}

