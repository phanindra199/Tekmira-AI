import React from 'react';

/**
 * Reusable Page Header with Breadcrumbs & Action Area
 */
export default function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className = ''
}) {
  return (
    <div className={`mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div>
        {breadcrumbs && (
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            {breadcrumbs}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0 flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
