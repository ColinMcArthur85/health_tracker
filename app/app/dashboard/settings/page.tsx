import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BackupManager from '@/components/BackupManager';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-slate-400">Manage backups and configuration.</p>
        </div>

        <BackupManager />

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-400">
          <p className="font-semibold text-slate-200 mb-1">Automation tip</p>
          <p>Run <code className="text-slate-100">npm run backup:auto</code> via cron to keep rolling backups.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
