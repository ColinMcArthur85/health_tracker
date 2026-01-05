import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  ActionComponent?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  ActionComponent,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="p-10 rounded-full bg-slate-900 mb-6 border border-slate-800 shadow-2xl">
        <Icon className="w-16 h-16 text-slate-700" />
      </div>
      <h3 className="text-3xl font-extrabold text-white mb-3 text-center">{title}</h3>
      <p className="text-slate-500 mb-10 max-w-md text-center text-lg font-medium leading-relaxed">
        {description}
      </p>
      {ActionComponent ? (
        ActionComponent
      ) : actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/5"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
