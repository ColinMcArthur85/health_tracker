'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'pink';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
};

export default function MetricCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon,
  color = 'blue' 
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
          {title}
        </h3>
        {icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{value}</p>
        
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-slate-400'
          }`}>
            <TrendIcon className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
