/**
 * @file StatCards.tsx
 * @description Collection of small, reusable stat card components in the Antigravity Design System
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface MiniStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

/**
 * Small stat card for quick insights row
 */
export function MiniStatCard({ icon, label, value }: MiniStatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-4 
                   bg-surface/50 
                   border border-border-subtle/50
                   hover:border-border
                   transition-all duration-200">
      <div className="p-2.5 rounded-xl bg-background border border-border-subtle">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">
          {label}
        </p>
        <p className="text-lg font-bold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

/**
 * Large stat card with prominent value
 */
export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="glass rounded-[32px] p-8 border border-border-subtle hover:border-border transition-all duration-300">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-background-raised rounded-2xl border border-border-subtle shadow-inner">
          {icon}
        </div>
        <h3 className="text-text-secondary text-xs font-black uppercase tracking-[2px]">{label}</h3>
      </div>
      <p className="text-4xl font-black text-text-primary">{value}</p>
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
  LinkComponent?: React.ComponentType<any>;
}

/**
 * Large overview card with background glow and hover effects (matches Dashboard)
 */
export function OverviewCard({ title, description, icon, gradient, href, metrics, LinkComponent = Link }: OverviewCardProps) {
  return (
    <LinkComponent href={href} className="group block animate-slide-up">
      <div className="relative h-full glass rounded-3xl p-8 
                      border border-border-subtle 
                      hover:border-border 
                      hover:bg-surface-elevated
                      transition-all duration-300 ease-out
                      hover:shadow-lg
                      hover:-translate-y-1">
        
        {/* Gradient glow effect on hover */}
        <div className={`absolute inset-0 rounded-3xl bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
        
        <div className="relative flex items-start justify-between mb-8">
          <div className="space-y-4">
            {/* Icon with gradient and glow */}
            <div className={`inline-flex p-3.5 rounded-2xl bg-linear-to-br ${gradient} 
                            shadow-lg shadow-black/30
                            group-hover:shadow-xl group-hover:shadow-black/40
                            transition-all duration-300`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-text-primary 
                           group-hover:text-gradient transition-all duration-300">
                {title}
              </h2>
              <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-[280px]">
                {description}
              </p>
            </div>
          </div>
          
          {/* Arrow indicator */}
          <div className="p-2.5 rounded-full bg-background-raised 
                         border border-border-subtle
                         group-hover:bg-surface-interactive
                         group-hover:border-border
                         group-hover:translate-x-1 
                         transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="relative grid grid-cols-3 gap-6 pt-6 border-t border-border-subtle/50">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary">
                {metric.label}
              </p>
              <p className="text-xl font-bold text-text-primary">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </LinkComponent>
  );
}

