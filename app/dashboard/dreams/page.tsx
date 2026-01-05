import DashboardLayout from '@/components/dashboard/DashboardLayout';
import db from '@/lib/db';
import { Cloud, Calendar, Brain, Sparkles } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dream Journal</h1>
          <p className="text-slate-400">Track and analyze your dreams for better self-awareness</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Cloud className="w-5 h-5 text-purple-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Total Dreams</h3>
            </div>
            <p className="text-3xl font-bold">{totalDreams}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">AI Analyzed</h3>
            </div>
            <p className="text-3xl font-bold">{analyzedDreams}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <h3 className="text-slate-400 text-sm font-medium uppercase">Recall Rate</h3>
            </div>
            <p className="text-3xl font-bold">{totalDreams > 0 ? Math.round((totalDreams / 30) * 100) : 0}%</p>
          </div>
        </div>

        {/* Dreams List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {dreams.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {dreams.map((dream) => (
                <div key={dream.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-400">
                        {dream.dailyLog.date.toLocaleDateString()}
                      </span>
                      {dream.tags && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          {dream.tags}
                        </span>
                      )}
                    </div>
                    {dream.mood && (
                      <span className="text-xs text-slate-500">{dream.mood}</span>
                    )}
                  </div>
                  
                  <p className="text-slate-200 leading-relaxed mb-3">{dream.content}</p>
                  
                  {dream.tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {dream.tags.split(',').map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
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
                <Link href={`/dashboard/journal/${new Date().toISOString().split('T')[0]}`} className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5">
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
