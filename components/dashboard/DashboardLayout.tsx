'use client';

import { ReactNode } from 'react';
import TopBar from './TopBar';
import SideNav from './SideNav';
import GlobalCommandPalette from '@/components/GlobalCommandPalette';
import { ToastProvider } from '@/components/Toast';
import QuickActionsMenu from '@/components/QuickActionsMenu';
import ErrorBoundary from '@/components/ErrorBoundary';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <TopBar />
        <div className="flex">
          <SideNav />
          <main className="flex-1 ml-64 mt-16 p-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
        <GlobalCommandPalette />
        <QuickActionsMenu />
      </div>
    </ToastProvider>
  );
}
