import React from 'react';

/**
 * Reusable Card Container & Subcomponents
 */
export default function Card({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${
        hover ? 'hover:border-navy-900 hover:shadow-md transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-bold text-navy-900 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 border-t border-slate-100 mt-auto ${className}`} {...props}>
      {children}
    </div>
  );
}
