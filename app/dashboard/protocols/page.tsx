import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { TestTube, Activity, Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { StatCard } from '@/components/StatCards';

export default async function ProtocolsPage() {
  const protocols = await db.protocol.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const activeProtocols = protocols.filter(p => p.status === 'ACTIVE').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-300/80 uppercase tracking-widest">Optimisation</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Health Protocols
          </h1>
          <p className="text-text-secondary text-lg font-medium">Manage your supplement stacks and health interventions</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<TestTube className="w-5 h-5 text-blue-300" />} 
            label="Total Protocols" 
            value={protocols.length} 
          />
          <StatCard 
            icon={<Activity className="w-5 h-5 text-success" />} 
            label="Active" 
            value={activeProtocols} 
          />
          <StatCard 
            icon={<Calendar className="w-5 h-5 text-purple-400" />} 
            label="Completed" 
            value={protocols.filter(p => p.status === 'COMPLETED').length} 
          />
        </div>

        {/* Protocols List */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          {protocols.length > 0 ? (
            <div className="divide-y divide-border-subtle/30">
              {protocols.map((protocol) => (
                <div key={protocol.id} className="p-8 hover:bg-surface/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-blue-300 transition-colors">
                        {protocol.name}
                      </h3>
                      <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">
                        {protocol.substance} • <span className="text-text-tertiary">{protocol.dosage}</span> • <span className="text-text-tertiary">{protocol.frequency}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                      protocol.status === 'ACTIVE' ? 'bg-emerald-500/10 text-success border-emerald-500/20' : 
                      protocol.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                      'bg-surface-interactive text-text-tertiary border-border-subtle'
                    }`}>
                      {protocol.status}
                    </span>
                  </div>
                  {protocol.notes && (
                    <p className="text-text-tertiary text-sm leading-relaxed mb-4 group-hover:text-text-secondary transition-colors">
                      {protocol.notes}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
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
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/10">
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

