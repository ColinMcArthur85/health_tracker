/**
 * @file StatCards.tsx
 * @description Collection of small, reusable stat card components
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface MiniStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export function MiniStatCard({ icon, label, value }: MiniStatCardProps) {
  return (
    <div className="flex items-center space-x-4 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 transition-all hover:bg-slate-900/50 hover:border-slate-700">
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-[32px] p-8 hover:border-slate-700 transition-all">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          {icon}
        </div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[2px]">{label}</h3>
      </div>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}

interface OverviewCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  metrics: Array<{ label: string; value: string | number }>;
  LinkComponent?: React.ComponentType<{ 
    href: string; 
    className?: string; 
    children: React.ReactNode 
  }>;
}

export function OverviewCard({ title, description, icon, gradient, href, metrics, LinkComponent = Link }: OverviewCardProps) {
  return (
    <LinkComponent href={href} className="group block h-full">
      <div className="relative h-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-4">
            <div className={`inline-flex p-3 rounded-2xl bg-linear-to-br ${gradient} shadow-lg shadow-black/20`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-400 group-hover:bg-clip-text transition-all">
                {title}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="p-2 rounded-full border border-slate-800 group-hover:bg-slate-800 group-hover:translate-x-1 transition-all">
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{metric.label}</p>
              <p className="text-xl font-bold text-slate-100">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </LinkComponent>
  );
}
