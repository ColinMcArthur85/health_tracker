import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        {content}
      </div>
    );
  }

  return <div className="py-24">{content}</div>;
}

// Skeleton loader for cards/lists
export function SkeletonCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-800 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-slate-800 rounded w-full mb-2"></div>
      <div className="h-3 bg-slate-800 rounded w-2/3"></div>
    </div>
  );
}

// Skeleton for photo grid
export function SkeletonPhotoGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-3/4 bg-slate-900 rounded-xl border border-slate-800 animate-pulse"
        />
      ))}
    </div>
  );
}
