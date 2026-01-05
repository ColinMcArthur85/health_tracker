import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Droplets, TrendingUp, Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default async function HormonesPage() {
  // Placeholder for future hormone tracking
  const hormoneData: any[] = [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hormone Tracking</h1>
          <p className="text-slate-400">Monitor hormonal health and endocrine optimization</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Total Tests</h3>
            </div>
            <p className="text-3xl font-bold">{hormoneData.length}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Latest Test</h3>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Next Due</h3>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>

        {/* Hormones List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <EmptyState
            icon={Droplets}
            title="No hormone data yet"
            description="Track testosterone, cortisol, thyroid, and other hormonal markers to optimize your endocrine health and performance."
            ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                  Add Hormone Results
                </Link>
              }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
