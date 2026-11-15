import React from 'react';

/**
 * Reusable Status & Category Badge Component
 */
export default function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'success' | 'warning' | 'coral' | 'navy' | 'outline'
  size = 'sm',        // 'sm' | 'md'
  icon: Icon,
  className = '',
  ...props
}) {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    coral: 'bg-coral-50 text-coral-600 border-coral-200',
    navy: 'bg-navy-900 text-white border-transparent',
    outline: 'bg-white text-slate-700 border-slate-300'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
