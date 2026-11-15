import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Github, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Code2,
  Compass,
  Check
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/common';

export default function HomePage() {
  const workflowSteps = [
    {
      step: '01',
      title: 'Resume Skill Extraction',
      description: 'Upload your academic resume. Tekmira AI parses self-reported skills, claimed frameworks, and project descriptions into structured competency categories.',
      icon: FileText,
      badge: 'Step 1: Claims'
    },
    {
      step: '02',
      title: 'GitHub Evidence Analysis',
      description: 'Connect your public GitHub username. The engine mines public repositories, verifies author commit logs, analyzes dependency trees, and samples code implementations.',
      icon: Github,
      badge: 'Step 2: Proof'
    },
    {
      step: '03',
      title: 'Job Matching & Alignment',
      description: 'Compare your verified technical profile against targeted job descriptions to identify exact hiring requirements, must-have skills, and bonus competencies.',
      icon: Target,
      badge: 'Step 3: Benchmark'
    },
    {
      step: '04',
      title: 'Improvement Recommendations',
      description: 'Receive an explainable placement readiness report. Every score deduction comes with transparent evidence citations and concrete code improvements.',
      icon: BookOpen,
      badge: 'Step 4: Readiness'
    }
  ];

  const platformCapabilities = [
    {
      title: 'Evidence-Backed Verification',
      description: 'Eliminate resume inflation. Every claimed proficiency is cross-referenced with real commits and source files in authentic student-authored repositories.',
      icon: Code2
    },
    {
      title: 'Target Job Description Alignment',
      description: 'Select from standardized campus placement benchmark roles or paste custom job descriptions from recruiting portals to evaluate role fitness.',
      icon: Target
    },
    {
      title: 'Actionable Skill-Gap Remediation',
      description: 'Get targeted advice on missing prerequisites, unverified claims, and code hygiene improvements before attending campus interviews.',
      icon: Compass
    }
  ];

  return (
    <MainLayout withSidebar={false}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill / Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-navy-900 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-coral-500" />
            <span>Beyond Claims. Driven by Evidence.</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-navy-900 tracking-tight leading-[1.12] mb-6">
            Your Skills Deserve <br />
            <span className="text-coral-500">More Than Just Claims.</span>
          </h1>

          {/* Subtitle / Platform Mission */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Tekmira AI is an AI-powered platform that evaluates resume-claimed skills against actual GitHub project evidence, identifies skill gaps, recommends suitable job opportunities, and helps users improve their job readiness.
          </p>

          {/* Call-to-Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Trust & Architecture Principles Banner */}
          <div className="mt-16 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                Triangulation
              </span>
              <span className="text-xs text-slate-500">Resume ⨉ GitHub ⨉ JD</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                Zero Hallucination
              </span>
              <span className="text-xs text-slate-500">Grounded in code proofs</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                100% Explainable
              </span>
              <span className="text-xs text-slate-500">Clickable commit citations</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                Student Focused
              </span>
              <span className="text-xs text-slate-500">Engineered for campus drives</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="coral" className="mb-2">Systematic Verification</Badge>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              How Tekmira AI Works
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Our 4-step pipeline evaluates student code artifacts to ensure objective, verifiable placement readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.step} hover={true} className="flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-coral-500 bg-coral-50 border border-coral-200 px-2 py-0.5 rounded-md">
                        STEP {step.step}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {step.badge}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center mb-4 shadow-sm">
                      <Icon className="w-5 h-5 text-coral-500" />
                    </div>

                    <h3 className="text-base font-bold text-navy-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="navy" className="mb-2">Core Capabilities</Badge>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              Built for Technical Transparency
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Bridge the credibility gap between written resume bullets and actual software engineering skill.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platformCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center mb-4 shadow-sm">
                      <Icon className="w-6 h-6 text-coral-500" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">{cap.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{cap.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            Ready to Verify Your Technical Portfolio?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
            Explore the verification dashboard, inspect your repositories, and see how your code stacks up against target job postings.
          </p>
          <Link to="/dashboard">
            <Button size="lg" variant="coral" icon={ArrowRight} iconPosition="right">
              Open Verification Dashboard
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
