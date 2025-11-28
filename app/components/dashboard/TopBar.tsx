'use client';

import Link from 'next/link';
import { User, Settings, Bell } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg"></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Health Dashboard
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <Link 
            href="/dashboard/settings"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-400" />
          </Link>

          {/* Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <p className="text-sm font-medium">Colin</p>
              <p className="text-xs text-slate-400">Premium</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
