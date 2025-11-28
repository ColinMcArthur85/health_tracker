'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Calendar, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface FilterBarProps {
  initialKeyword?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialType?: string;
  initialIntensity?: string;
  showSearch?: boolean;
  showType?: boolean;
  showIntensity?: boolean;
  typeOptions?: string[];
  intensityOptions?: string[];
  children?: ReactNode;
}

export default function FilterBar({
  initialKeyword = '',
  initialStartDate = '',
  initialEndDate = '',
  initialType = '',
  initialIntensity = '',
  showSearch = false,
  showType = false,
  showIntensity = false,
  typeOptions = [],
  intensityOptions = [],
  children,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [keyword, setKeyword] = useState(initialKeyword);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [type, setType] = useState(initialType);
  const [intensity, setIntensity] = useState(initialIntensity);

  const hasFilters = useMemo(
    () => Boolean(keyword || startDate || endDate || type || intensity),
    [keyword, startDate, endDate, type, intensity]
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (type) params.set('type', type);
    if (intensity) params.set('intensity', intensity);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setType('');
    setIntensity('');
    router.push(pathname);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Start date"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="End date"
            />
          </div>

          {showType && (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}

          {showIntensity && (
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">All Intensity</option>
              {intensityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}

          {children}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {showSearch && (
            <div className="flex-1 md:flex-none md:w-64 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
              />
            </div>
          )}

          <button
            onClick={applyFilters}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <span>Apply</span>
          </button>

          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
