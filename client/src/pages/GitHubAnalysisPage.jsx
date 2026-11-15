import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  FolderGit2, 
  Code2, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search,
  ExternalLink,
  Info,
  Star,
  GitFork,
  AlertCircle,
  RotateCw,
  Layers,
  ShieldCheck,
  ShieldAlert,
  TestTube2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import repositoryService from '../services/repositoryService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingIndicator from '../components/common/LoadingIndicator';
import { normalizeApiError } from '../utils/apiError';

export default function GitHubAnalysisPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  // Sample quick-select repositories
  const sampleRepos = [
    { name: 'Tekmira AI (Full Stack)', url: 'https://github.com/phanindra199/Tekmira-AI' },
    { name: 'React (Facebook)', url: 'https://github.com/facebook/react' },
    { name: 'Prisma Client', url: 'https://github.com/prisma/prisma' }
  ];

  const handleInspect = async (e) => {
    e?.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please provide a valid public GitHub repository URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setSnapshot(null);

    try {
      const response = await repositoryService.fetchRepositoryEvidence(repoUrl.trim(), candidateEmail.trim());
      setSnapshot(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (url) => {
    setRepoUrl(url);
    setError(null);
  };

  const handleProceedToTriangulation = () => {
    if (snapshot) {
      // Store current snapshot in sessionStorage for seamless transfer to AnalysisReportPage
      sessionStorage.setItem('tekmira_current_repo_snapshot', JSON.stringify(snapshot));
      navigate('/analysis');
    }
  };

  return (
    <PageLayout
      withSidebar={true}
      title="GitHub Evidence Mining & Code Verification"
      description="Connect your public GitHub repository to extract commit provenance, language percentages, and dependency manifests."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">GitHub Mining</span>
        </>
      }
    >
      {/* Search & URL Input Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <form onSubmit={handleInspect} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label htmlFor="repo-url" className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                Public GitHub Repository URL
              </label>
              <div className="relative">
                <Github className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="repo-url"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="author-email" className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                Author Commit Email (Optional)
              </label>
              <input
                id="author-email"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Quick test sample:</span>
              {sampleRepos.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                >
                  {sample.name}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              variant="navy"
              disabled={loading || !repoUrl.trim()}
              className="px-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-coral-400" />
                  <span>Traversing Git Tree...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Mine Repository Evidence</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center mb-8">
          <LoadingIndicator message="Contacting GitHub REST API, inspecting tree blobs, and mining package dependencies..." />
        </div>
      )}

      {/* Mined Repository Evidence View */}
      {snapshot && !loading && (
        <div className="space-y-6 mb-8 animate-fade-in">
          {/* Top Repository Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-coral-500" />
                    <span>{snapshot.githubHandle}/{snapshot.repoName}</span>
                  </h3>
                  {snapshot.isFork && <Badge variant="slate">Forked</Badge>}
                  <Badge variant="navy">Branch: {snapshot.defaultBranch}</Badge>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">
                  {snapshot.description || 'Public repository mined for technical placement evidence.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={snapshot.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-navy-900 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <Button variant="coral" onClick={handleProceedToTriangulation}>
                  <span className="flex items-center gap-1.5">
                    <span>Run 3-Way Triangulation</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>

            {/* Metrics Quick Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Stars</span>
                  <span className="text-sm font-bold text-navy-900">{snapshot.stargazersCount || 0}</span>
                </div>
                <Star className="w-4 h-4 text-amber-500" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Forks</span>
                  <span className="text-sm font-bold text-navy-900">{snapshot.forksCount || 0}</span>
                </div>
                <GitFork className="w-4 h-4 text-slate-500" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Mined Blobs</span>
                  <span className="text-sm font-bold text-navy-900">{snapshot.fileCount || 0} files</span>
                </div>
                <Code2 className="w-4 h-4 text-navy-900" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Automated Tests</span>
                  <span className={`text-sm font-bold ${snapshot.hasTestFiles ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {snapshot.hasTestFiles ? 'Detected' : 'None Found'}
                  </span>
                </div>
                <TestTube2 className={`w-4 h-4 ${snapshot.hasTestFiles ? 'text-emerald-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Two Column Breakdown: Languages vs Detected Dependencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Languages Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-navy-900" />
                  <span>Language Distribution</span>
                </h4>

                {snapshot.languages?.length > 0 ? (
                  <div className="space-y-2.5">
                    {snapshot.languages.map((lang, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-800">{lang.name}</span>
                          <span className="font-mono text-slate-500">{lang.percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-navy-900' : idx === 1 ? 'bg-coral-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${lang.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No language data returned by GitHub.</p>
                )}
              </div>

              {/* Detected Dependencies */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-navy-900" />
                  <span>Mined Dependencies ({snapshot.detectedDependencies?.length || 0})</span>
                </h4>

                {snapshot.detectedDependencies?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {snapshot.detectedDependencies.map((dep, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-mono"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No package manifest (package.json, requirements.txt) discovered.</p>
                )}
              </div>
            </div>

            {/* Authentic Commits */}
            {snapshot.authenticCommits?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-navy-900" />
                  <span>Recent Commit History & Authorship Verification</span>
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {snapshot.authenticCommits.map((c, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-coral-600 bg-coral-50 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                          {c.hash}
                        </span>
                        <span className="text-slate-800 font-medium max-w-md truncate">{c.message}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.committedAt).toLocaleDateString()}
                        </span>
                        {c.verifiedAuthored ? (
                          <Badge variant="emerald" className="text-[10px]">Verified Author</Badge>
                        ) : (
                          <Badge variant="slate" className="text-[10px]">Unverified Author</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
