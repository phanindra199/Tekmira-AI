import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import DashboardCard from '../components/DashboardCard';
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
  HelpCircle,
  Play
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <PageLayout
      withSidebar={true}
      title="Placement Readiness Dashboard"
      description="Track the verification status of your resume claims against real GitHub code and target job roles."
      actionButton={
        <Link
          to="/analysis-report"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white font-semibold text-xs hover:bg-navy-800 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 text-coral-500 fill-coral-500" />
          <span>Generate Readiness Report</span>
        </Link>
      }
    >
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <DashboardCard
          title="Overall Readiness Score"
          value="-- / 100"
          subtitle="Triangulation pending. Complete the 3 verification steps to generate your verified score."
          icon={Award}
          badgeText="Pending Analysis"
          badgeType="warning"
          actionLink="/analysis-report"
          actionText="Run Evaluation"
        />

        <DashboardCard
          title="Resume Status"
          value="Not Uploaded"
          subtitle="Upload your PDF resume to extract claimed technical skills and project descriptions."
          icon={FileText}
          badgeText="Step 1 Required"
          badgeType="coral"
          actionLink="/resume-analysis"
          actionText="Upload PDF"
        />

        <DashboardCard
          title="GitHub Code Proof"
          value="Not Connected"
          subtitle="Link your GitHub profile to scan commit history, language trees, and code snippets."
          icon={Github}
          badgeText="Step 2 Required"
          badgeType="neutral"
          actionLink="/github-analysis"
          actionText="Connect Profile"
        />

        <DashboardCard
          title="Target Job Description"
          value="No JD Selected"
          subtitle="Provide a target software engineer role to evaluate your competency match."
          icon={Target}
          badgeText="Step 3 Required"
          badgeType="neutral"
          actionLink="/job-match"
          actionText="Select Target Role"
        />
      </div>

      {/* Verification Pipeline Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral-500" />
              <span>Tekmira Verification Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow these three systematic steps to generate an explainable placement readiness report.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Phase 1 Scaffolding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-navy-900 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Input</span>
              </div>
              <h3 className="text-sm font-bold text-navy-900 mb-1">Upload Resume</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Parse candidate claims, skills taxonomy, and listed university projects via Gemini NLP.
              </p>
            </div>
            <Link
              to="/resume-analysis"
              className="text-xs font-bold text-navy-900 hover:text-coral-500 flex items-center gap-1.5 transition-colors"
            >
              <span>Go to Resume Parser</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-navy-900 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Evidence</span>
              </div>
              <h3 className="text-sm font-bold text-navy-900 mb-1">Mine GitHub Code</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Extract verifiable proof: authentic commits, lines of code, dependencies, and test coverage.
              </p>
            </div>
            <Link
              to="/github-analysis"
              className="text-xs font-bold text-navy-900 hover:text-coral-500 flex items-center gap-1.5 transition-colors"
            >
              <span>Connect GitHub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-navy-900 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-navy-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Benchmark</span>
              </div>
              <h3 className="text-sm font-bold text-navy-900 mb-1">Select Target Role</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Ingest job requirements for SDE 1, Frontend, Backend, or Full-Stack campus postings.
              </p>
            </div>
            <Link
              to="/job-match"
              className="text-xs font-bold text-navy-900 hover:text-coral-500 flex items-center gap-1.5 transition-colors"
            >
              <span>Select Job Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity & Evaluation Criteria Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Verification Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-coral-500" />
                <span>Recent Verification History</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of your resume-to-code evaluations and placement reports.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              0 Total Scans
            </span>
          </div>

          {/* Empty state for fresh student account */}
          <div className="py-10 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-navy-900 mb-1">No Verifications Run Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
              Upload your resume and link your GitHub profile above to generate your first placement readiness score and verified proof report.
            </p>
            <Link
              to="/resume-analysis"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-white font-semibold text-xs hover:bg-navy-800 transition-colors"
            >
              <span>Begin First Verification</span>
              <ArrowRight className="w-3.5 h-3.5 text-coral-500" />
            </Link>
          </div>
        </div>

        {/* Evaluation Criteria Explainer */}
        <div className="bg-navy-900 text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-coral-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Scoring Weight Breakdown</span>
            </div>
            <h4 className="text-base font-bold mb-3">How Your Score Is Calculated</h4>
            
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
    </PageLayout>
  );
}
