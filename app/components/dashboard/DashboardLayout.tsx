'use client';

import { ReactNode } from 'react';
import TopBar from './TopBar';
import SideNav from './SideNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-text-primary)">
      <TopBar />
      <div className="flex">
        <SideNav />
        <main className="flex-1 ml-64 mt-16 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
