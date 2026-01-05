'use client';

import { Eye, X } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Banner shown to demo users indicating read-only mode
 * Can be dismissed but reappears on page refresh
 */
export default function DemoModeBanner() {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show for demo users
  if (!session?.user?.isDemo || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-linear-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl shadow-amber-500/10">
        <div className="flex items-start gap-3">
          <div className="shrink-0 p-2 bg-amber-500/20 rounded-lg">
            <Eye className="w-5 h-5 text-amber-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-200 text-sm">
              Demo Mode Active
            </h3>
            <p className="text-amber-300/70 text-xs mt-1 leading-relaxed">
              You're viewing sample data. Sign in as owner to make changes.
            </p>
          </div>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="shrink-0 p-1 hover:bg-amber-500/20 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-amber-400/70" />
          </button>
        </div>
      </div>
    </div>
  );
}
