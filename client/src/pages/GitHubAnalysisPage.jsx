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
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GitHubAnalysisPage() {
  const [username, setUsername] = useState('');
  const [submittedUser, setSubmittedUser] = useState('');

  const handleInspect = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setSubmittedUser(username.trim());
    }
  };

  return (
    <PageLayout
      withSidebar={true}
      title="GitHub Code Proof Mining"
      description="Connect your public GitHub handle to scan repositories, commit frequency, language trees, and implementation proofs."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">GitHub Mining</span>
        </>
      }
    >
      {/* Profile Search & Connector */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
        <div className="max-w-xl">
          <h3 className="text-base font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Github className="w-5 h-5 text-coral-500" />
            <span>Connect GitHub Profile</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Enter your public GitHub username to allow the mining engine to discover your repositories and commit history.
          </p>

          <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. torvalds, your-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4 text-coral-500" />
              <span>Inspect Repositories</span>
            </button>
          </form>

          {submittedUser && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
              <Info className="w-4 h-4 text-coral-500 shrink-0" />
              <span>
                Target profile set to <strong>@{submittedUser}</strong>. In Phase 4, the Node.js backend will query the GitHub REST API to pull authentic commit ASTs and repository dependency trees.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Discovered Evidence Feed (Placeholder) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-coral-500" />
              <span>Discovered Repository Evidence</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical code evidence detected across public repositories.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Phase 4 Integration
          </span>
        </div>

        {!submittedUser ? (
          <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <GitBranch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-navy-900 mb-1">No Profile Connected</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Enter your GitHub handle above to see repository insights and verify commit ownership.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-navy-50 border border-navy-100 text-xs text-navy-900">
              <span className="font-bold">Mining Protocol:</span> The GitHub Mining Engine will filter out forks and cloned repositories, focusing strictly on repositories where <code className="bg-white px-1.5 py-0.5 rounded border border-navy-200 font-mono">author.login == @{submittedUser}</code>.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Language Distribution
                </span>
                <p className="text-xs text-slate-500 italic">Byte-weighted languages will appear here.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Commit History & Recency
                </span>
                <p className="text-xs text-slate-500 italic">Commit frequency charts will appear here.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Code Snippet Citations
                </span>
                <p className="text-xs text-slate-500 italic">Sample AST snippets proving usage will appear here.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Step Shortcut */}
      <div className="flex justify-end">
        <Link
          to="/job-match"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-md transition-all group"
        >
          <span>Proceed to Step 3: Target Job Alignment</span>
          <ArrowRight className="w-4 h-4 text-coral-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </PageLayout>
  );
}
