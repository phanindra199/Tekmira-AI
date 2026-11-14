import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { ShieldCheck, Lock, Mail, User, Github, GraduationCap, Calendar, ArrowRight, Info } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    githubUsername: '',
    degree: 'B.Tech Computer Science',
    gradYear: '2026',
    password: ''
  });
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice('Registration endpoint will be integrated in Phase 2 with PostgreSQL and bcrypt password hashing.');
  };

  return (
    <PageLayout>
      <div className="py-12 sm:py-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-navy-900 mx-auto flex items-center justify-center mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6 text-coral-500" />
            </div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight">Create Tekmira AI Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Beyond Claims. Driven by Evidence.
            </p>
          </div>

          {/* Development Notice */}
          {notice ? (
            <div className="mb-6 p-3.5 rounded-xl bg-coral-50 border border-coral-200 text-coral-700 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Phase 2 Preview</p>
                <p className="mt-0.5">{notice}</p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-2 text-xs font-bold text-navy-900 underline block"
                >
                  Proceed to Dashboard &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-navy-900 shrink-0" />
              <span>Linking your GitHub username enables automated repo inspection.</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  GitHub Username
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="githubUsername"
                    required
                    placeholder="e.g. torvalds"
                    value={formData.githubUsername}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Degree / Branch
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Graduation Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="gradYear"
                    value={formData.gradYear}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-navy-900 hover:bg-navy-800 shadow-md transition-all flex items-center justify-center gap-2 group mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-coral-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-navy-900 hover:text-coral-500 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
