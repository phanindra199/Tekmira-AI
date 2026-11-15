import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Empty State Component
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data available',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`py-12 px-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
        <Icon className="w-6 h-6 text-coral-500" />
      </div>
      <h4 className="text-sm font-bold text-navy-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
