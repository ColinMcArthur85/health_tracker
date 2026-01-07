import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Cloud, Calendar, Brain, Sparkles } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { StatCard } from '@/components/StatCards';

export default async function DreamsPage() {
  const dreams = await db.dream.findMany({
    include: {
      dailyLog: true,
    },
    orderBy: {
      dailyLog: { date: 'desc' },
    },
    take: 30,
  });

  const totalDreams = dreams.length;
  const analyzedDreams = dreams.filter(d => d.analysis).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-purple-400/80 uppercase tracking-widest">Subconscious</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            Dream Journal
          </h1>
          <p className="text-text-secondary text-lg font-medium">Track and analyze your dreams for better self-awareness</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={<Cloud className="w-5 h-5 text-purple-400" />} 
            label="Total Dreams" 
            value={totalDreams} 
          />
          <StatCard 
            icon={<Sparkles className="w-5 h-5 text-warning" />} 
            label="AI Analyzed" 
            value={analyzedDreams} 
          />
          <StatCard 
            icon={<Brain className="w-5 h-5 text-blue-300" />} 
            label="Recall Rate" 
            value={`${totalDreams > 0 ? Math.round((totalDreams / 30) * 100) : 0}%`} 
          />
        </div>

        {/* Dreams List */}
        <div className="glass rounded-[32px] overflow-hidden border border-border-subtle shadow-xl shadow-black/10">
          {dreams.length > 0 ? (
            <div className="divide-y divide-border-subtle/30">
              {dreams.map((dream) => (
                <div key={dream.id} className="p-8 hover:bg-surface/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-text-tertiary" />
                      <span className="text-sm font-bold text-text-primary group-hover:text-purple-400 transition-colors">
                        {dream.dailyLog.date.toLocaleDateString()}
                      </span>
                    </div>
                    {dream.mood && (
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-surface-interactive px-2 py-1 rounded-lg border border-border-subtle">
                        {dream.mood}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-text-secondary leading-relaxed mb-6 group-hover:text-text-primary transition-colors italic">
                    "{dream.content}"
                  </p>
                  
                  {dream.tags && (
                    <div className="flex flex-wrap gap-2">
                      {dream.tags.split(',').map((tag: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Cloud}
              title="No dreams logged yet"
              description="Start recording your dreams to uncover patterns, improve recall, and gain insights into your subconscious mind."
              ActionComponent={
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/10">
                  Log Your First Dream
                </Link>
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

