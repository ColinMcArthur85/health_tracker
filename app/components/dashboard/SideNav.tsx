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
  CloudRain,
  Brain,
  Pill,
  TestTube,
  Smile,
  Image
} from 'lucide-react';

const navSections = [
  {
    title: null,
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' }
    ]
  },
  {
    title: 'Body Health',
    items: [
      { href: '/dashboard/workouts', icon: Dumbbell, label: 'Workouts' },
      { href: '/dashboard/body', icon: Scale, label: 'Measurements' },
      { href: '/dashboard/photos', icon: Image, label: 'Progress Photos' },
      { href: '/dashboard/hydration', icon: Droplets, label: 'Hydration' },
    ]
  },
  {
    title: 'Mind Health',
    items: [
      { href: '/dashboard/sleep', icon: Moon, label: 'Sleep' },
      { href: '/dashboard/dreams', icon: Brain, label: 'Dreams' },
      { href: '/dashboard/stress', icon: CloudRain, label: 'Stress' },
    ]
  },
  {
    title: 'Internal Health',
    items: [
      { href: '/dashboard/nutrition', icon: Apple, label: 'Nutrition' },
      { href: '/dashboard/medications', icon: Pill, label: 'Medications' },
      { href: '/dashboard/protocols', icon: TestTube, label: 'Protocols' },
      { href: '/dashboard/bloodwork', icon: Heart, label: 'Bloodwork' },
      { href: '/dashboard/hormones', icon: Droplets, label: 'Hormones' },
    ]
  },
  {
    title: 'Mood Tracker',
    items: [
      { href: '/dashboard/mood', icon: Smile, label: 'Daily Mood' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
      { href: '/dashboard/search', icon: Search, label: 'Search' },
      { href: '/dashboard/journal', icon: BookOpen, label: 'Daily Journal' },
    ]
  }
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 
                      bg-(--color-background-raised)/80 
                      backdrop-blur-md
                      border-r border-border-subtle 
                      overflow-y-auto">
      <nav className="p-4 space-y-6">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && (
              <h3 className="px-4 mb-3 text-[10px] font-semibold text-(--color-text-tertiary) uppercase tracking-widest">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30 shadow-(--shadow-glow-primary)' 
                        : 'text-(--color-text-secondary) hover:bg-surface hover:text-(--color-text-primary)'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
