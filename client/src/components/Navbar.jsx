import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Github,
  GraduationCap
} from 'lucide-react';
import BackendStatusBadge from './BackendStatusBadge';

export default function Navbar({ onToggleSidebar }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menus on route change
  useEffect(() => {
    setProfileOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  const mainNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Resume', path: '/resume-analysis' },
    { name: 'GitHub', path: '/github-analysis' },
    { name: 'Job Match', path: '/job-match' },
    { name: 'Reports', path: '/analysis-report' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Sidebar Trigger + Brand */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle sidebar navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center text-white shadow-md shadow-navy-900/10 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-coral-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-navy-900 flex items-center gap-1.5 leading-none">
                  Tekmira <span className="text-coral-500 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-coral-50 border border-coral-500/20">AI</span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                  Beyond Claims. Driven by Evidence.
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'text-navy-900 bg-slate-100'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: API Badge + Profile Menu + Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex">
              <BackendStatusBadge compact={true} />
            </div>

            {/* Profile Dropdown Menu */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                aria-expanded={profileOpen}
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-navy-900 leading-none">Student Demo</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">B.Tech CS</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-navy-900">Alex Morgan</p>
                    <p className="text-[11px] text-slate-500">student@university.edu</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <GraduationCap className="w-3.5 h-3.5 text-navy-900" />
                      <span>Class of 2026</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Overview Dashboard</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      to="/login"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-coral-600 hover:bg-coral-50"
                    >
                      <LogOut className="w-4 h-4 text-coral-500" />
                      <span>Sign Out (Session Reset)</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Navigation Toggle Button */}
            <div className="lg:hidden flex">
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                aria-label="Toggle page navigation"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Page Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {mainNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileNavOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-medium ${
                isActive(link.path)
                  ? 'text-navy-900 bg-slate-100 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center px-1">
            <span className="text-[11px] text-slate-500">System Connection</span>
            <BackendStatusBadge compact={true} />
          </div>
        </div>
      )}
    </header>
  );
}
