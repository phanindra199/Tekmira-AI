import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Github, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Layers, 
  BarChart3 
} from 'lucide-react';

export default function HomePage() {
  const steps = [
    {
      step: '01',
      title: 'Resume Skill Extraction',
      description: 'Upload your student resume in PDF format. The system extracts claimed technical proficiencies, frameworks, and project descriptions.',
      icon: FileText,
      badge: 'Claimed Skills'
    },
    {
      step: '02',
      title: 'GitHub Code Proof Mining',
      description: 'We scan your authentic public repositories, commit frequency, ASTs, and dependencies to verify hands-on implementation evidence.',
      icon: Github,
      badge: 'Empirical Evidence'
    },
    {
      step: '03',
      title: 'Job Description Matching',
      description: 'Compare your verified skill matrix against targeted job descriptions to identify precise gaps, strengths, and interview prep targets.',
      icon: Target,
      badge: 'Target Alignment'
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/50 py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 border border-navy-100 text-xs font-semibold text-navy-900 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-coral-500" />
            <span>Beyond Claims. Driven by Evidence.</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-navy-900 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            Prove What You Know. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-900 via-navy-700 to-coral-500">
              Back Every Resume Claim With Real Code.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Stop guessing if your resume will pass technical screenings. <strong className="text-navy-900 font-semibold">Tekmira AI</strong> is an AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl shadow-lg shadow-navy-900/10 hover:shadow-navy-900/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Skill Verification</span>
              <ArrowRight className="w-5 h-5 text-coral-500 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/resume-analysis"
              className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-navy-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-sm"
            >
              Upload Sample Resume
            </Link>
          </div>

          {/* Feature Highlights Banner */}
          <div className="mt-16 pt-8 border-t border-slate-200/80 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-extrabold text-navy-900 block">3-Way</span>
              <span className="text-xs text-slate-500 font-medium">Triangulation Model</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-extrabold text-navy-900 block">100%</span>
              <span className="text-xs text-slate-500 font-medium">Explainable Proof</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-extrabold text-navy-900 block">0%</span>
              <span className="text-xs text-slate-500 font-medium">Black-Box Guessing</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-2xl font-extrabold text-coral-500 block">Placement</span>
              <span className="text-xs text-slate-500 font-medium">Readiness Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Triangulation Architecture Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-coral-500 uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              The Three-Way Triangulation Engine
            </h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Recruiters don't trust claims without code. We solve this by bridging the gap between what you write and what you build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative group hover:border-navy-900 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold font-mono text-coral-500 bg-coral-50 border border-coral-200 px-2.5 py-1 rounded-md">
                      STEP {item.step}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-coral-500" />
                  </div>

                  <h4 className="text-xl font-bold text-navy-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Prop Banner */}
      <section className="py-16 bg-navy-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Ready to inspect your placement readiness?
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
            Experience the automated pipeline: Upload your resume, link your GitHub handle, and select your target software role.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-coral-500 hover:bg-coral-600 text-white shadow-lg shadow-coral-500/20 transition-all"
          >
            <span>Open Verification Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
