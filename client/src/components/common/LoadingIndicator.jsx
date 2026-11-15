import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Accessible Loading Indicator Component
 */
export default function LoadingIndicator({
  text = 'Loading...',
  size = 'md', // 'sm' | 'md' | 'lg'
  centered = false,
  className = ''
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2.5 text-slate-500 font-medium ${className}`}
    >
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-coral-500 shrink-0`} />
      {text && <span className="text-xs text-slate-600">{text}</span>}
      <span className="sr-only">{text}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="py-12 flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
}
