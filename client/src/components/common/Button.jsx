import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Accessible Button Component
 * Supports multiple variants, sizes, icon integration, and loading states.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'coral'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-900 border border-transparent shadow-sm',
    secondary: 'bg-navy-700 text-white hover:bg-navy-800 focus:ring-navy-700 border border-transparent',
    outline: 'bg-white text-navy-900 border border-slate-300 hover:bg-slate-50 focus:ring-navy-900 shadow-sm',
    ghost: 'text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:ring-slate-400 border border-transparent',
    coral: 'bg-coral-500 text-white hover:bg-coral-600 focus:ring-coral-500 border border-transparent shadow-sm'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
