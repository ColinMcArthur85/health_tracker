import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { TestTube, Activity, Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default async function ProtocolsPage() {
  const protocols = await db.protocol.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const activeProtocols = protocols.filter(p => p.status === 'ACTIVE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Health Protocols</h1>
          <p className="text-slate-400">Manage your supplement stacks and health interventions</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TestTube className="w-5 h-5 text-blue-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Total Protocols</h3>
            </div>
            <p className="text-3xl font-bold">{protocols.length}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Active</h3>
            </div>
            <p className="text-3xl font-bold">{activeProtocols}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Completed</h3>
            </div>
            <p className="text-3xl font-bold">{protocols.filter(p => p.status === 'COMPLETED').length}</p>
          </div>
        </div>

        {/* Protocols List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {protocols.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {protocols.map((protocol) => (
                <div key={protocol.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{protocol.name}</h3>
                      <p className="text-sm text-slate-400">
                        {protocol.substance} • {protocol.dosage} • {protocol.frequency}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      protocol.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 
                      protocol.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {protocol.status}
                    </span>
                  </div>
                  {protocol.notes && (
                    <p className="text-sm text-slate-500 mb-2">{protocol.notes}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Started: {protocol.startDate.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TestTube}
              title="No protocols yet"
              description="Create and track systematic health interventions, supplement stacks, and optimization protocols."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
                  Create Your First Protocol
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
