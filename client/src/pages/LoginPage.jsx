import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { ShieldCheck, Lock, Mail, ArrowRight, Info } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice('Backend Auth is scheduled for Phase 2 (JWT + PostgreSQL). For now, you can explore all dashboard routes directly!');
  };

  return (
    <PageLayout>
      <div className="py-16 sm:py-24 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-navy-900 mx-auto flex items-center justify-center mb-4 shadow-md">
              <ShieldCheck className="w-6 h-6 text-coral-500" />
            </div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight">Sign In to Tekmira AI</h1>
            <p className="text-xs text-slate-500 mt-1">
              Beyond Claims. Driven by Evidence.
            </p>
          </div>

          {/* Development Status Notice */}
          {notice ? (
            <div className="mb-6 p-3.5 rounded-xl bg-coral-50 border border-coral-200 text-coral-700 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Scaffold Notice</p>
                <p className="mt-0.5">{notice}</p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-2 text-xs font-bold text-navy-900 underline block"
                >
                  Continue to Dashboard &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-navy-900 shrink-0" />
              <span>UI Preview Mode: Enter any mock credentials to proceed.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                College or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-xs text-coral-500 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-navy-900 hover:bg-navy-800 shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-coral-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="font-bold text-navy-900 hover:text-coral-500 transition-colors">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
