import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics & Trends</h1>
          <p className="text-slate-400">Advanced insights and correlations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h2 className="text-2xl font-semibold mb-2 text-slate-300">Coming Soon</h2>
          <p className="text-slate-400">
            Advanced analytics, trend predictions, and correlation analysis will be available here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
