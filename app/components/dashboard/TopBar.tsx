'use client';

import Link from 'next/link';
import { User, Settings, Bell } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 
                       bg-(--color-background-raised)/90 
                       backdrop-blur-lg
                       border-b border-border-subtle 
                       z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25"></div>
          <h1 className="text-xl font-bold text-gradient-primary">
            Health Journal
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 hover:bg-surface rounded-xl transition-all duration-200">
            <Bell className="w-5 h-5 text-(--color-text-secondary)" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-(--color-background-raised)"></span>
          </button>

          {/* Settings */}
          <Link 
            href="/dashboard/settings"
            className="p-2.5 hover:bg-surface rounded-xl transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-(--color-text-secondary)" />
          </Link>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-4 ml-2 border-l border-border-subtle">
            <div className="text-right">
              <p className="text-sm font-semibold text-(--color-text-primary)">Colin</p>
              <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Premium</p>
            </div>
            <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
