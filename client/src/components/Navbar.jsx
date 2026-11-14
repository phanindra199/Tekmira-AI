import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, LayoutDashboard, FileText, Github, Target, Award } from 'lucide-react';
import BackendStatusBadge from './BackendStatusBadge';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Resume', path: '/resume-analysis' },
    { name: 'GitHub', path: '/github-analysis' },
    { name: 'Job Match', path: '/job-match' },
    { name: 'Report', path: '/analysis-report' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white shadow-md shadow-navy-900/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-coral-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-navy-900 flex items-center gap-1.5">
                Tekmira <span className="text-coral-500 text-xs font-semibold px-1.5 py-0.5 rounded bg-coral-50 border border-coral-500/20">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">Beyond Claims. Driven by Evidence.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'text-navy-900 bg-slate-100 font-semibold'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth CTA Actions & Backend Status */}
          <div className="hidden md:flex items-center space-x-3">
            <BackendStatusBadge compact={true} />
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <Link
              to="/login"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-coral-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-navy-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  isActive(link.path)
                    ? 'text-navy-900 bg-slate-100 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-navy-900 rounded-lg flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-coral-500" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
