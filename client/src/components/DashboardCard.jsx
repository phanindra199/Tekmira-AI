import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'neutral', // 'positive', 'warning', 'coral', 'neutral'
  actionLink,
  actionText = 'View Details'
}) {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'coral':
        return 'bg-coral-50 text-coral-600 border-coral-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top bar with Icon and Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors">
            {Icon && <Icon className="w-6 h-6 text-coral-500 group-hover:text-coral-500" />}
          </div>
          {badgeText && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getBadgeStyle()}`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-sm font-semibold text-slate-500 mb-1">{title}</h3>
        <div className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight mb-2">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{subtitle}</p>
        )}
      </div>

      {/* Action link */}
      {actionLink && (
        <div className="pt-4 border-t border-slate-100 mt-2">
          <Link
            to={actionLink}
            className="text-xs font-semibold text-navy-900 hover:text-coral-500 flex items-center gap-1 group/btn transition-colors"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
