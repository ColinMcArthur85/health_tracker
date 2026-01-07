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
    <div className="flex flex-col items-center justify-center py-24 px-8">
      <div className="p-12 rounded-[40px] bg-background-raised mb-8 border border-border-subtle shadow-inner">
        <Icon className="w-20 h-20 text-text-secondary opacity-40" />
      </div>
      <h3 className="text-4xl font-black text-text-primary mb-4 text-center tracking-tight">{title}</h3>
      <p className="text-text-secondary mb-12 max-w-lg text-center text-lg font-medium leading-relaxed">
        {description}
      </p>
      {ActionComponent ? (
        ActionComponent
      ) : actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

