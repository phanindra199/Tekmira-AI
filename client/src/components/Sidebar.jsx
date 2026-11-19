import React from 'react';
import NavigationItem from './NavigationItem';
import BackendStatusBadge from './BackendStatusBadge';
import { 
  LayoutDashboard, 
  FileText, 
  Github, 
  Target, 
  Award, 
  Sparkles,
  Code2,
  HelpCircle,
  Settings,
  ClipboardList,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen = false, onClose }) {
  const navigationItems = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Active'
    },
    {
      label: 'Resume Analysis',
      path: '/resume-analysis',
      icon: FileText,
      badge: 'Step 1'
    },
    {
      label: 'GitHub Analysis',
      path: '/github-analysis',
      icon: Github,
      badge: 'Step 2'
    },
    {
      label: 'Job Matching',
      path: '/job-match',
      icon: Target,
      badge: 'Step 3'
    },
    { label: 'My Applications', path: '/applications', icon: ClipboardList, badge: 'SQL JOIN' },
    {
      label: 'Skill Evidence',
      path: '/skill-evidence',
      icon: Code2,
      badge: 'Proof'
    },
    {
      label: 'Interview Preparation',
      path: '/interview-prep',
      icon: HelpCircle,
      badge: 'AI Prep'
    },
    {
      label: 'Reports',
      path: '/analysis-report',
      icon: Award,
      badge: 'Results'
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
        } min-h-[calc(100vh-4rem)]`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-coral-500" />
            <span>Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex p-4 border-b border-slate-100 items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-coral-500" />
            <span>Verification Pipeline</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.path}
              label={item.label}
              path={item.path}
              icon={item.icon}
              badge={item.badge}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Backend Connection & Quota Badge */}
        <div className="p-3 m-3 space-y-2 border-t border-slate-100">
          <BackendStatusBadge compact={false} />
          
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Student Tier:</span>
            <span className="text-coral-500 font-bold font-mono">5 Free Scans</span>
          </div>
        </div>
      </aside>
    </>
  );
}
