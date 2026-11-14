import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-coral-500" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Tekmira <span className="text-coral-500">AI</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              An AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-[11px] font-medium bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-800">React 18</span>
              <span className="text-[11px] font-medium bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-800">Vite</span>
              <span className="text-[11px] font-medium bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-800">Tailwind CSS</span>
              <span className="text-[11px] font-medium bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-800">Node.js</span>
              <span className="text-[11px] font-medium bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-800">Google Gemini</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Verification Suite</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Readiness Dashboard</Link>
              </li>
              <li>
                <Link to="/resume-analysis" className="hover:text-white transition-colors">Resume Parser</Link>
              </li>
              <li>
                <Link to="/github-analysis" className="hover:text-white transition-colors">GitHub Code Miner</Link>
              </li>
              <li>
                <Link to="/job-match" className="hover:text-white transition-colors">Target Job Matcher</Link>
              </li>
              <li>
                <Link to="/analysis-report" className="hover:text-white transition-colors">Explainable Reports</Link>
              </li>
            </ul>
          </div>

          {/* Project & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Project Specs</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400">Capstone Project (B.Tech CS)</span>
              </li>
              <li>
                <span className="text-slate-400">21-Day Modular Build</span>
              </li>
              <li>
                <span className="text-slate-400">Dual-DB Architecture</span>
              </li>
              <li>
                <span className="text-coral-500 font-medium">Zero Hallucination Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Tekmira AI. Beyond Claims. Driven by Evidence.</p>
          <div className="flex items-center gap-1">
            <span>Built with discipline</span>
            <span className="text-coral-500">✦</span>
            <span>Modular Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
