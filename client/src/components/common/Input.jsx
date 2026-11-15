import React from 'react';

/**
 * Reusable Accessible Form Input Component
 */
export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const inputId = id || name || Math.random().toString(36).substring(7);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-coral-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            Icon && iconPosition === 'left' ? 'pl-10' : 'pl-3.5'
          } ${Icon && iconPosition === 'right' ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-coral-500 focus:ring-coral-500'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-coral-600 mt-1 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
