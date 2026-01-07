import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default async function BloodworkPage() {
  // Placeholder for future bloodwork tracking
  const bloodworkResults: any[] = [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bloodwork & Biomarkers</h1>
          <p className="text-text-secondary">Track lab results and biomarker trends over time</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <h3 className="text-text-secondary text-sm font-medium uppercase">Total Tests</h3>
            </div>
            <p className="text-3xl font-bold">{bloodworkResults.length}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="text-text-secondary text-sm font-medium uppercase">Latest Test</h3>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-300" />
              <h3 className="text-text-secondary text-sm font-medium uppercase">Next Due</h3>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>

        {/* Bloodwork List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <EmptyState
            icon={Heart}
            title="No bloodwork data yet"
            description="Track lab results, biomarkers, and health metrics to optimize your longevity protocols with data-driven insights."
            ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                  Add Bloodwork Results
                </Link>
              }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
