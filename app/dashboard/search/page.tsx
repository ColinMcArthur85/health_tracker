import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Search } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export default async function SearchPage() {
  // Placeholder for search functionality
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-text-secondary">Search across all your health data</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <EmptyState
            icon={Search}
            title="Search coming soon"
            description="Global search across workouts, nutrition, photos, and all your health data will be available here."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
