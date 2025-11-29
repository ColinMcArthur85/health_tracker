'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  keyword: string;
  startDate: string;
  endDate: string;
  type: string;
  intensity: string;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [intensity, setIntensity] = useState('');

  const handleSearch = () => {
    onSearch({
      keyword,
      startDate,
      endDate,
      type,
      intensity,
    });
  };

  const handleClear = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setType('');
    setIntensity('');
    onSearch({
      keyword: '',
      startDate: '',
      endDate: '',
      type: '',
      intensity: '',
    });
  };

  const hasActiveFilters = startDate || endDate || type || intensity;

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search workouts by name, type, instructor, platform..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          <Filter size={20} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {[startDate, endDate, type, intensity].filter(Boolean).length}
            </span>
          )}
        </button>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X size={16} />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Workout Type */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Workout Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
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

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Intensities</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
