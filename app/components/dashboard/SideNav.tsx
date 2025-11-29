'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  Moon, 
  Scale, 
  Heart, 
  Droplets, 
  TrendingUp,
  BookOpen,
  Search,
  CloudRain
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/workouts', icon: Dumbbell, label: 'Workouts' },
  { href: '/dashboard/nutrition', icon: Apple, label: 'Nutrition' },
  { href: '/dashboard/sleep', icon: Moon, label: 'Sleep' },
  { href: '/dashboard/dreams', icon: CloudRain, label: 'Dream Log' },
  { href: '/dashboard/body', icon: Scale, label: 'Body Metrics' },
  { href: '/dashboard/wellness', icon: Heart, label: 'Wellness' },
  { href: '/dashboard/hydration', icon: Droplets, label: 'Hydration' },
  { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
  { href: '/dashboard/search', icon: Search, label: 'Search' },
  { href: '/dashboard/journal', icon: BookOpen, label: 'Daily Journal' },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
