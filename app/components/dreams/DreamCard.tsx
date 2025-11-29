'use client';

import { Calendar, Tag, Smile } from 'lucide-react';

interface Dream {
  id: string;
  content: string;
  mood?: string | null;
  tags?: string | null;
  analysis?: string | null;
  createdAt: string;
  dailyLog?: {
    date: string;
  };
}

interface DreamCardProps {
  dream: Dream;
}

export default function DreamCard({ dream }: DreamCardProps) {
  const date = dream.dailyLog?.date 
    ? new Date(dream.dailyLog.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : new Date(dream.createdAt).toLocaleDateString();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        {dream.mood && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-blue-400 border border-slate-700">
            <Smile className="w-3 h-3" />
            {dream.mood}
          </div>
        )}
      </div>

      <p className="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
        {dream.content}
      </p>

      {dream.analysis && (
        <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-800">
          <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">AI Analysis</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            {dream.analysis}
          </p>
        </div>
      )}

      {dream.tags && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          {dream.tags.split(',').map((tag, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
              <Tag className="w-3 h-3" />
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
