import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  Layers, 
  Database,
  ArrowRight,
  RotateCw,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import aiService, { SAMPLE_CANDIDATE_RESUME } from '../services/aiService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingIndicator from '../components/common/LoadingIndicator';
import { normalizeApiError } from '../utils/apiError';

export default function ResumeAnalysisPage() {
  const [resumeText, setResumeText] = useState('');
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiStatus, setAiStatus] = useState({ configured: false, model: 'gemini-2.5-flash', checked: false });

  // Probe Gemini service health on mount
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await aiService.getAiStatus();
        if (isMounted && res.data) {
          setAiStatus({
            configured: res.data.configured,
            model: res.data.model,
            checked: true
          });
        }
      } catch (err) {
        if (isMounted) {
          setAiStatus((prev) => ({ ...prev, checked: true }));
        }
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  const handleLoadSample = () => {
    setResumeText(SAMPLE_CANDIDATE_RESUME);
    setIsSampleLoaded(true);
    setError(null);
  };

  const handleClear = () => {
    setResumeText('');
    setIsSampleLoaded(false);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!resumeText.trim() || resumeText.trim().length < 20) {
      setError({ message: 'Please enter at least 20 characters of resume text to analyze.' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.analyzeResume(resumeText.trim());
      setAnalysisResult(response.data);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      withSidebar={true}
      title="Resume Ingestion & Gemini AI Analysis"
      description="Extract claimed technical competencies, framework proficiencies, and project scopes using Google Gemini 2.5 Flash."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Resume Ingestion</span>
        </>
      }
    >
      {/* AI Service Status Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-900">
            <Cpu className="w-5 h-5 text-coral-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-navy-900">Gemini AI Engine</h4>
              <Badge variant={aiStatus.configured ? 'success' : 'coral'}>
                {aiStatus.configured ? 'Online & Configured' : 'Needs GEMINI_API_KEY'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Model: <code className="text-navy-900 font-mono font-semibold">{aiStatus.model}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSample}
            type="button"
          >
            <Sparkles className="w-3.5 h-3.5 text-coral-500 mr-1.5" />
            <span>Load Sample Academic Resume</span>
          </Button>
          {resumeText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              type="button"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Input Area Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-coral-500" />
              <span>Candidate Resume Input</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste plain resume text or test using our verified sample resume.
            </p>
          </div>
          {isSampleLoaded && (
            <Badge variant="navy">Development Sample Loaded</Badge>
          )}
        </div>

        <form onSubmit={handleAnalyze}>
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setIsSampleLoaded(false);
            }}
            placeholder="Paste raw candidate resume text here (minimum 20 characters)... e.g. Technical Skills: React, Node.js, Express, PostgreSQL..."
            rows={8}
            className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-all resize-y mb-4"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Character count: <strong className="text-navy-900">{resumeText.length}</strong>
            </span>

            <Button
              variant="coral"
              type="submit"
              disabled={loading || resumeText.trim().length < 20}
              loading={loading}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Analyze with Gemini AI</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Error Message Alert */}
      {error && (
        <div className="mb-8">
          <ErrorMessage
            title="AI Analysis Failed"
            message={error.message || 'Failed to analyze resume text.'}
            onRetry={handleAnalyze}
          />
        </div>
      )}

      {/* Analysis Loading Indicator */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm mb-8 text-center">
          <LoadingIndicator size="lg" text="Calling Google Gemini AI to analyze candidate competencies..." />
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Extracting claimed technical proficiencies, frameworks, and project scopes without hallucination.
          </p>
        </div>
      )}

      {/* Extracted Claims Result View */}
      {analysisResult && !loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral-500" />
                <span>Extracted Skill Claims (Gemini Output)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Model: <code className="font-semibold text-navy-900">{analysisResult.model}</code> • Analyzed at: {new Date(analysisResult.analyzedAt).toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="success">Extraction Completed</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap mb-6">
            {analysisResult.rawAnalysis}
          </div>

          {/* Evidence Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-coral-600 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Tekmira Evidence Disclaimer:</strong>
              <span>
                {analysisResult.disclaimer || 'These extracted competencies are strictly self-reported claims. In Days 10 & 11, Tekmira AI will cross-verify each claim against authentic commits in the candidate\'s public GitHub repositories.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Next Step Shortcut */}
      <div className="flex justify-end">
        <Link
          to="/github-analysis"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-md transition-all group"
        >
          <span>Proceed to Step 2: GitHub Evidence Mining</span>
          <ArrowRight className="w-4 h-4 text-coral-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </PageLayout>
  );
}
