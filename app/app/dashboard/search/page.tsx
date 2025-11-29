'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import { Search as SearchIcon } from 'lucide-react';

interface Workout {
  id: string;
  type?: string | null;
  name?: string | null;
  instructor?: string | null;
  platform?: string | null;
  duration?: number | null;
  intensity?: string | null;
  focusArea?: string | null;
  notes?: string | null;
  dailyLog: {
    id: string;
    date: Date;
  };
}

interface SearchResponse {
  filters: SearchFilters;
  summary: {
    count: number;
    totalDuration: number;
  };
  workouts: Workout[];
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.set('q', filters.keyword);
      if (filters.startDate) params.set('start', filters.startDate);
      if (filters.endDate) params.set('end', filters.endDate);
      if (filters.type) params.set('type', filters.type);
      if (filters.intensity) params.set('intensity', filters.intensity);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <header>
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon className="text-blue-400" size={32} />
            <h1 className="text-3xl font-bold">Search Workouts</h1>
          </div>
          <p className="text-slate-400">
            Find and filter your workout history with advanced search
          </p>
        </header>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
            <p className="text-slate-400 mt-4">Searching...</p>
          </div>
        )}

        {!isLoading && hasSearched && results && (
          <SearchResults workouts={results.workouts} summary={results.summary} />
        )}

        {!isLoading && !hasSearched && (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
            <SearchIcon className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Start searching your workouts
            </h3>
            <p className="text-slate-500">
              Use the search bar above to find workouts by keyword or apply filters
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
