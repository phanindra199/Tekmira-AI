import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { 
  FileText, 
  Github, 
  Target, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  BookOpen,
  Code2,
  ExternalLink,
  RefreshCw,
  Layers,
  GraduationCap
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Badge, 
  Input, 
  EmptyState,
  LoadingIndicator 
} from '../components/common';
import { checkBackendHealth } from '../services/healthService';

export default function DashboardPage() {
  // Meaningful state management (Prompt 2.6)
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'activity'
  const [skillSearch, setSkillSearch] = useState('');
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    message: '',
    error: null
  });

  // Call the real /api/health endpoint with AbortController cleanup to prevent memory leaks and dangling requests
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchHealth() {
      setHealthStatus((prev) => ({ ...prev, loading: true }));
      const result = await checkBackendHealth({ signal: controller.signal });

      if (isMounted && !result.isCancelled) {
        if (result.connected && result.data?.success) {
          setHealthStatus({
            loading: false,
            connected: true,
            message: result.data.message,
            error: null
          });
        } else {
          setHealthStatus({
            loading: false,
            connected: false,
            message: '',
            error: result.error || 'Backend service unreachable'
          });
        }
      }
    }

    fetchHealth();

    return () => {
      isMounted = false; // Prevents state updates on unmounted component
      controller.abort(); // Cancels pending HTTP request
    };
  }, []);

  return (
    <MainLayout
      withSidebar={true}
      title="Placement Readiness Overview"
      description="Track the verification status of your resume claims against real GitHub code and target job roles."
      actionButton={
        <Link to="/analysis-report">
          <Button variant="primary" size="sm" icon={Award}>
            Generate Readiness Report
          </Button>
        </Link>
      }
    >
      {/* 1. Student Profile Overview Card */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-black text-xl shadow-md">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-900">Alex Morgan</h2>
                <Badge variant="coral">Student Candidate</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-navy-900" />
                  B.Tech Computer Science (2026)
                </span>
                <span>•</span>
                <span>Profile Status: Initial Setup</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant={healthStatus.connected ? 'success' : healthStatus.loading ? 'warning' : 'coral'}>
              {healthStatus.loading ? 'Checking API...' : healthStatus.connected ? 'Engine Online' : 'Engine Offline'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Dashboard View Tabs (useState) */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Pipeline Overview
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'skills'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Skills Breakdown
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'activity'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Verification History
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 3 Entry Point Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Entry Point 1: Resume */}
            <Card hover={true} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy-900">
                    <FileText className="w-5 h-5 text-coral-500" />
                  </div>
                  <Badge variant="coral">Step 1 Required</Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">Resume Ingestion</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Upload your PDF resume to extract claimed technical proficiencies, frameworks, and university projects.
                </p>
              </div>
              <Link to="/resume-analysis" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between" icon={ArrowRight} iconPosition="right">
                  Upload Resume PDF
                </Button>
              </Link>
            </Card>

            {/* Entry Point 2: GitHub */}
            <Card hover={true} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy-900">
                    <Github className="w-5 h-5 text-coral-500" />
                  </div>
                  <Badge variant="neutral">Step 2 Required</Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">GitHub Code Miner</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Connect your public GitHub username to inspect repositories, authentic commit frequency, and AST code snippets.
                </p>
              </div>
              <Link to="/github-analysis" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between" icon={ArrowRight} iconPosition="right">
                  Connect GitHub
                </Button>
              </Link>
            </Card>

            {/* Entry Point 3: Job Description */}
            <Card hover={true} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy-900">
                    <Target className="w-5 h-5 text-coral-500" />
                  </div>
                  <Badge variant="neutral">Step 3 Required</Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">Target Job Description</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Select a campus placement benchmark role or paste a custom company job description for competency alignment.
                </p>
              </div>
              <Link to="/job-match" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between" icon={ArrowRight} iconPosition="right">
                  Select Target Role
                </Button>
              </Link>
            </Card>
          </div>

          {/* Triangulation Pipeline Progress Box */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-coral-500" />
                  <span>Tekmira Verification Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow these 3 systematic steps to generate an explainable placement readiness report.
                </p>
              </div>
              <Badge variant="outline">Phase 1 Complete</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center mb-2">
                  1
                </span>
                <h4 className="text-xs font-bold text-navy-900 mb-1">Claim Ingestion</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Extracts self-reported technical skills from resume text.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center mb-2">
                  2
                </span>
                <h4 className="text-xs font-bold text-navy-900 mb-1">Evidence Mining</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Audits commit histories and dependency trees in public repos.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center mb-2">
                  3
                </span>
                <h4 className="text-xs font-bold text-navy-900 mb-1">Job Benchmark</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Calculates readiness score based on must-have role requirements.
                </p>
              </div>
            </div>
          </Card>

          {/* Actionable Next Steps Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-coral-500" />
                  <span>Next Steps to Verify Placement Readiness</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Action items required before your readiness score can be calculated.
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-navy-900">Upload your PDF resume</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ensure all college and personal software projects are listed with tech stack details.
                      </p>
                    </div>
                    <Link to="/resume-analysis">
                      <Button size="sm" variant="outline">Upload</Button>
                    </Link>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-navy-900">Link your GitHub profile</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Verify your public repositories so the mining engine can extract author commits.
                      </p>
                    </div>
                    <Link to="/github-analysis">
                      <Button size="sm" variant="outline">Connect</Button>
                    </Link>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-navy-900">Choose target job role</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Align your skills against Full-Stack, Frontend, or Backend SDE 1 benchmarks.
                      </p>
                    </div>
                    <Link to="/job-match">
                      <Button size="sm" variant="outline">Select</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

            {/* Score Calculation Criteria Explainer */}
            <div className="bg-navy-900 text-white rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-coral-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Deterministic Model</span>
                </div>
                <h4 className="text-base font-bold mb-3">Scoring Formulation</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                    <span className="text-slate-300 font-medium">Job Skill Alignment</span>
                    <span className="font-mono font-bold text-coral-500">40%</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                    <span className="text-slate-300 font-medium">GitHub Code Proof</span>
                    <span className="font-mono font-bold text-coral-500">35%</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                    <span className="text-slate-300 font-medium">Commit Recency (12 mo)</span>
                    <span className="font-mono font-bold text-coral-500">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Unit Testing Hygiene</span>
                    <span className="font-mono font-bold text-coral-500">10%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Deterministic Scoring</span>
                <span className="text-coral-500 font-semibold">100% Explainable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS BREAKDOWN */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  Triangulated Skills Categorization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison of claimed resume proficiencies, verified GitHub evidence, and target JD prerequisites.
                </p>
              </div>

              {/* Search Filter (useState) */}
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Filter skills (e.g. React)..."
                  icon={Search}
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Claimed Skills Box */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-coral-500" />
                    <span>Claimed in Resume</span>
                  </span>
                  <Badge variant="neutral">0 Claims</Badge>
                </div>
                <EmptyState
                  title="No Claims Ingested"
                  description="Upload your resume to extract claimed technical proficiencies."
                  actionLabel="Upload Resume"
                  onAction={() => window.location.assign('/resume-analysis')}
                />
              </div>

              {/* Demonstrated Skills Box */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Demonstrated in Code</span>
                  </span>
                  <Badge variant="neutral">0 Proofs</Badge>
                </div>
                <EmptyState
                  title="No Code Proof Yet"
                  description="Connect your GitHub profile to scan commit trees and code implementations."
                  actionLabel="Connect GitHub"
                  onAction={() => window.location.assign('/github-analysis')}
                />
              </div>

              {/* Missing Skills Box */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>Missing Prerequisites</span>
                  </span>
                  <Badge variant="neutral">0 Identified</Badge>
                </div>
                <EmptyState
                  title="No Role Selected"
                  description="Select a target job description to compute missing competencies."
                  actionLabel="Select Job"
                  onAction={() => window.location.assign('/job-match')}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: VERIFICATION HISTORY */}
      {activeTab === 'activity' && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-coral-500" />
                <span>Verification Audit Log</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamped records of your resume parses, GitHub scans, and generated readiness reports.
              </p>
            </div>
            <Badge variant="outline">0 Total Sessions</Badge>
          </div>

          <EmptyState
            title="No Activity History"
            description="Complete your first verification pipeline scan to generate an audit record."
            actionLabel="Start First Scan"
            onAction={() => window.location.assign('/resume-analysis')}
          />
        </Card>
      )}
    </MainLayout>
  );
}
