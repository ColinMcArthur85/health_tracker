'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Scale,
  Image,
  Droplets,
  Moon, 
  Brain,
  CloudRain,
  Apple, 
  Pill,
  TestTube,
  Heart,
  Smile
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
      { href: '/dashboard/measurements', icon: Scale, label: 'Measurements' },
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
  }
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
      <nav className="p-4 space-y-6">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && (
              <h3 className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                      flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
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
