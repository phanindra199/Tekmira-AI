import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Reusable Sidebar Navigation Item
 * Supports active route styling and automatic mobile drawer closing on click.
 */
export default function NavigationItem({
  label,
  path,
  icon: Icon,
  badge,
  onClick
}) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group select-none ${
          isActive
            ? 'bg-navy-900 text-white shadow-sm shadow-navy-900/10 font-semibold'
            : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={`w-4 h-4 transition-colors shrink-0 ${
                  isActive ? 'text-coral-500' : 'text-slate-400 group-hover:text-navy-900'
                }`}
              />
            )}
            <span className="truncate">{label}</span>
          </div>
          {badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isActive
                  ? 'bg-navy-800 text-slate-200'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
