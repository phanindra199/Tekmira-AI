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
  GraduationCap,
  RotateCw,
  Code,
  ShieldAlert,
  FolderGit2
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
  ErrorMessage,
  LoadingIndicator 
} from '../components/common';
import { checkBackendHealth } from '../services/healthService';
import repositoryService from '../services/repositoryService';
import { normalizeApiError } from '../utils/apiError';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'activity'
  const [skillSearch, setSkillSearch] = useState('');
  
  // Real health and report states (Day 13)
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    message: '',
    error: null
  });

  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Fetch real backend health and triangulation report
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchData() {
      // 1. Health check
      try {
        const healthResult = await checkBackendHealth({ signal: controller.signal });
        if (isMounted && !healthResult.isCancelled) {
          if (healthResult.connected && healthResult.data?.success) {
            setHealthStatus({
              loading: false,
              connected: true,
              message: healthResult.data.message,
              error: null
            });
          } else {
            setHealthStatus({
              loading: false,
              connected: false,
              message: '',
              error: healthResult.error || 'Backend service unreachable'
            });
          }
        }
      } catch (e) {
        if (isMounted) {
          setHealthStatus({ loading: false, connected: false, message: '', error: 'Service offline' });
        }
      }

      // 2. Real Triangulation Report Fetch
      try {
        setLoadingReport(true);
        const cachedRepo = sessionStorage.getItem('tekmira_current_repo_snapshot');
        let repoSnapshot = null;
        if (cachedRepo) {
          try { repoSnapshot = JSON.parse(cachedRepo); } catch (e) {}
        }

        const reportResponse = await repositoryService.triangulateSkills({
          repoSnapshot: repoSnapshot || undefined
        });

        if (isMounted) {
          setReportData(reportResponse.data);
        }
      } catch (err) {
        if (isMounted) {
          setReportError(normalizeApiError(err));
        }
      } finally {
        if (isMounted) setLoadingReport(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleRefreshReport = async () => {
    setLoadingReport(true);
    setReportError(null);
    try {
      const cachedRepo = sessionStorage.getItem('tekmira_current_repo_snapshot');
      let repoSnapshot = null;
      if (cachedRepo) {
        try { repoSnapshot = JSON.parse(cachedRepo); } catch (e) {}
      }

      const reportResponse = await repositoryService.triangulateSkills({
        repoSnapshot: repoSnapshot || undefined
      });
      setReportData(reportResponse.data);
    } catch (err) {
      setReportError(normalizeApiError(err));
    } finally {
      setLoadingReport(false);
    }
  };

  // Filter skills in Tab 2
  const matrix = reportData?.triangulationMatrix || [];
  const filteredSkills = matrix.filter(item => 
    !skillSearch || 
    item.skillName.toLowerCase().includes(skillSearch.toLowerCase()) ||
    item.category?.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const verifiedSkills = filteredSkills.filter(s => s.verificationStatus === 'VERIFIED');
  const demonstratedBonusSkills = filteredSkills.filter(s => s.verificationStatus === 'UNCLAIMED_STRENGTH');
  const inflatedSkills = filteredSkills.filter(s => s.verificationStatus === 'INFLATED_CLAIM');
  const missingCriticalSkills = filteredSkills.filter(s => s.verificationStatus === 'MISSING_CRITICAL');

  return (
    <MainLayout
      withSidebar={true}
      title="Placement Readiness Overview"
      description="Track the empirical verification status of your resume claims against real GitHub code and campus job roles."
      actionButton={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshReport}
            disabled={loadingReport}
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${loadingReport ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </Button>

          <Link to="/analysis-report">
            <Button variant="primary" size="sm" icon={Award}>
              <span>Full Readiness Report</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* 1. Student Profile & System Health Strip */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-black text-xl shadow-md">
              TM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-900">Tekmira Candidate Portal</h2>
                <Badge variant="coral">B.Tech CS Benchmark</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-navy-900" />
                  Target Role: Junior Full Stack Engineer
                </span>
                <span>•</span>
                <span>3-Way Evidence Engine Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant={healthStatus.connected ? 'success' : healthStatus.loading ? 'warning' : 'coral'}>
              {healthStatus.loading ? 'Checking Backend...' : healthStatus.connected ? 'Services Online (Polyglot)' : 'Backend Offline'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Error state if API call failed */}
      {reportError && (
        <div className="mb-6">
          <ErrorMessage message={reportError} onDismiss={() => setReportError(null)} />
        </div>
      )}

      {/* Loading Skeleton */}
      {loadingReport && (
        <Card className="p-8 text-center mb-6">
          <LoadingIndicator message="Fetching real analysis report and computing Placement Readiness Index..." />
        </Card>
      )}

      {/* Dashboard View Tabs */}
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
          Skills Breakdown ({matrix.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'activity'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
          }`}
        >
          Pipeline Action Guide
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && reportData && !loadingReport && (
        <div className="space-y-6">
          
          {/* Executive Placement Readiness Gauge Card */}
          <Card className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Score Display (4 cols) */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Placement Readiness Index (PRI)
                </span>
                
                <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                  <div className="absolute inset-0 rounded-full border-6 border-slate-200" />
                  <div 
                    className="absolute inset-0 rounded-full border-6 border-coral-500 border-t-navy-900 border-r-navy-900 transition-all duration-1000"
                    style={{
                      transform: `rotate(${Math.min(360, (reportData.overallReadinessScore / 100) * 360)}deg)`
                    }}
                  />
                  <div className="flex flex-col items-center z-10">
                    <span className="text-3xl font-extrabold text-navy-900 font-mono">
                      {reportData.overallReadinessScore}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">/ 100</span>
                  </div>
                </div>

                <Badge 
                  variant={
                    reportData.overallReadinessScore >= 85 ? 'success' : 
                    reportData.overallReadinessScore >= 70 ? 'navy' : 'warning'
                  }
                  className="font-bold text-xs"
                >
                  {reportData.readinessTier || 'Placement Ready'}
                </Badge>
              </div>

              {/* 4 Quantitative Metrics (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-coral-500" />
                    <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                      Triangulation Evidence Summary
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {reportData.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="block text-[10px] text-emerald-800 font-semibold uppercase">Verified Proofs</span>
                    <span className="text-lg font-bold text-emerald-900 font-mono">
                      {reportData.metrics?.verifiedCount || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                    <span className="block text-[10px] text-navy-800 font-semibold uppercase">Bonus Strengths</span>
                    <span className="text-lg font-bold text-navy-900 font-mono">
                      {reportData.metrics?.unclaimedStrengthsCount || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                    <span className="block text-[10px] text-amber-800 font-semibold uppercase">Inflated Claims</span>
                    <span className="text-lg font-bold text-amber-900 font-mono">
                      {reportData.metrics?.inflatedCount || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-coral-50/60 border border-coral-100">
                    <span className="block text-[10px] text-coral-800 font-semibold uppercase">Required Missing</span>
                    <span className="text-lg font-bold text-coral-900 font-mono">
                      {reportData.metrics?.missingCriticalCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3 Interactive Pipeline Ingestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1: Resume */}
            <Card hover={true} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy-900">
                    <FileText className="w-5 h-5 text-coral-500" />
                  </div>
                  <Badge variant="success">Step 1 Ready</Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">Resume Ingestion</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Upload PDF resumes with %PDF- magic byte verification and Zod structured claims extraction.
                </p>
              </div>
              <Link to="/resume-analysis" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between" icon={ArrowRight} iconPosition="right">
                  Manage Resume PDF
                </Button>
              </Link>
            </Card>

            {/* Step 2: GitHub Miner */}
            <Card hover={true} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy-900">
                    <Github className="w-5 h-5 text-coral-500" />
                  </div>
                  <Badge variant="success">Step 2 Ready</Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">GitHub Code Miner</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Audit public repository trees, language percentages, commit provenance, and dependency manifests.
                </p>
              </div>
              <Link to="/github-analysis" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between" icon={ArrowRight} iconPosition="right">
                  Mine Repository Proof
                </Button>
              </Link>
            </Card>

            {/* Step 3: Viva Voce Prep */}
            <Card hover={true} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy-900">
                    <Sparkles className="w-5 h-5 text-coral-500" />
                  </div>
                  <Badge variant="coral">AI Viva Active</Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-1">AI Viva Preparation</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Practice technical interview questions grounded strictly in your verified files with rubric feedback.
                </p>
              </div>
              <Link to="/interview-prep" className="mt-2">
                <Button variant="primary" size="sm" className="w-full justify-between" icon={ArrowRight} iconPosition="right">
                  Start Technical Viva
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS BREAKDOWN */}
      {activeTab === 'skills' && reportData && !loadingReport && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  Triangulated Skills Categorization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time breakdown of Claimed (C), Demonstrated (D), and Required (R) competencies.
                </p>
              </div>

              {/* Search Filter */}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Box 1: Verified */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                  <Badge variant="success">{verifiedSkills.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {verifiedSkills.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-emerald-100 text-xs text-slate-700 flex justify-between">
                      <span className="font-semibold">{s.skillName}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">Code Proof</span>
                    </div>
                  ))}
                  {verifiedSkills.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No verified skills match filter.</p>
                  )}
                </div>
              </div>

              {/* Box 2: Bonus Strengths */}
              <div className="p-4 rounded-xl border border-navy-200 bg-navy-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-navy-700" />
                    <span>Bonus Strengths</span>
                  </span>
                  <Badge variant="navy">{demonstratedBonusSkills.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {demonstratedBonusSkills.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-navy-100 text-xs text-slate-700 flex justify-between">
                      <span className="font-semibold">{s.skillName}</span>
                      <span className="text-[10px] text-navy-600 font-mono">Repo Bonus</span>
                    </div>
                  ))}
                  {demonstratedBonusSkills.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No bonus skills match filter.</p>
                  )}
                </div>
              </div>

              {/* Box 3: Inflated Claims */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Inflated Claims</span>
                  </span>
                  <Badge variant="warning">{inflatedSkills.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {inflatedSkills.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-amber-100 text-xs text-slate-700 flex justify-between">
                      <span className="font-semibold">{s.skillName}</span>
                      <span className="text-[10px] text-amber-600 font-mono">0 Proof</span>
                    </div>
                  ))}
                  {inflatedSkills.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Zero inflated claims detected.</p>
                  )}
                </div>
              </div>

              {/* Box 4: Missing Critical */}
              <div className="p-4 rounded-xl border border-coral-200 bg-coral-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-coral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-coral-600" />
                    <span>Missing Critical</span>
                  </span>
                  <Badge variant="coral">{missingCriticalSkills.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {missingCriticalSkills.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-coral-100 text-xs text-slate-700 flex justify-between">
                      <span className="font-semibold">{s.skillName}</span>
                      <span className="text-[10px] text-coral-600 font-mono">Job Gap</span>
                    </div>
                  ))}
                  {missingCriticalSkills.length === 0 && (
                    <p className="text-xs text-slate-400 italic">All required job skills verified.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: PIPELINE ACTION GUIDE */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-navy-900 mb-2">
              Tekmira Continuous Placement Verification Architecture
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Tekmira AI cross-verifies self-reported resume claims against verified repository artifacts to produce an objective, explainable evaluation for campus placement drives.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-navy-900">Step 1: Resume Ingestion & Parsing</h4>
                  <p className="text-slate-600 mt-0.5">Upload multi-page PDF resumes. Multer memory streaming enforces the 5MB guard and validates official <code>%PDF-</code> magic byte signatures before parsing digital text streams.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-navy-900">Step 2: GitHub Evidence Mining</h4>
                  <p className="text-slate-600 mt-0.5">Submit public GitHub repositories. Tekmira AI inspects language byte distributions, parses package dependencies (<code>package.json</code>, <code>requirements.txt</code>), audits test suites, and verifies authentic commit authorship with zero code execution.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-navy-900">Step 3: 3-Way Triangulation & Placement Readiness Index</h4>
                  <p className="text-slate-600 mt-0.5">The engine executes deterministic 3-way matching ($C \times D \times R$) to classify competencies into <code>VERIFIED</code>, <code>UNCLAIMED_STRENGTH</code>, <code>INFLATED_CLAIM</code>, and <code>MISSING_CRITICAL</code>, generating an explainable score and actionable remediation plan.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-coral-500 text-white font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <h4 className="font-bold text-navy-900">Step 4: Grounded AI Technical Viva Preparation</h4>
                  <p className="text-slate-600 mt-0.5">Generate technical interview questions referencing your real implementation files, submit answers, and receive constructive rubric evaluation across Technical Accuracy, Evidence Awareness, and Conceptual Clarity.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
