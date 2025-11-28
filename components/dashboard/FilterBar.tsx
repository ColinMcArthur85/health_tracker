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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Start date"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="End date"
            />
          </div>
          
          {children}
        </div>
        
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
