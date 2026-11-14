import React from 'react';
import { NavLink } from 'react-router-dom';
import BackendStatusBadge from './BackendStatusBadge';
import { 
  LayoutDashboard, 
  FileText, 
  Github, 
  Target, 
  Award, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    {
      label: 'Readiness Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Active'
    },
    {
      label: '1. Resume Ingestion',
      path: '/resume-analysis',
      icon: FileText,
      badge: 'Step 1'
    },
    {
      label: '2. GitHub Evidence',
      path: '/github-analysis',
      icon: Github,
      badge: 'Step 2'
    },
    {
      label: '3. Job Match Matrix',
      path: '/job-match',
      icon: Target,
      badge: 'Step 3'
    },
    {
      label: '4. Verified Report',
      path: '/analysis-report',
      icon: Award,
      badge: 'Result'
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Sidebar Header Section */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-coral-500" />
          <span>Verification Pipeline</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-navy-900 text-white shadow-sm shadow-navy-900/10'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-coral-500' : 'text-slate-400 group-hover:text-navy-900'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-navy-800 text-slate-200' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Backend Connection & Engine Status */}
      <div className="p-3 m-3 space-y-2">
        <BackendStatusBadge compact={false} />
        
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span>Student Tier:</span>
          <span className="text-coral-500 font-bold font-mono">5 Free Scans</span>
        </div>
      </div>
    </aside>
  );
}
