import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import { BarChart3 } from 'lucide-react';

export default async function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-purple-400" size={32} />
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <p className="text-slate-400">Track your progress and trends over time</p>
        </header>

        <AnalyticsCharts />
      </div>
    </DashboardLayout>
  );
}
