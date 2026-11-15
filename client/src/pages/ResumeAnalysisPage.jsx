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
  Cpu,
  ShieldAlert,
  FolderGit2,
  ListFilter
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
  const [analysisMode, setAnalysisMode] = useState('structured'); // 'structured' or 'narrative'
  const [showRawJson, setShowRawJson] = useState(false);
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

  const handleAnalyze = async (mode = 'structured') => {
    if (!resumeText.trim() || resumeText.trim().length < 20) {
      setError({ message: 'Please enter at least 20 characters of resume text to analyze.' });
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisMode(mode);

    try {
      if (mode === 'structured') {
        const response = await aiService.extractStructuredSkills(resumeText.trim());
        setAnalysisResult(response.data);
      } else {
        const response = await aiService.analyzeResume(resumeText.trim());
        setAnalysisResult(response.data);
      }
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized);
    } finally {
      setLoading(false);
    }
  };

  // Group structured skills by category
  const groupedSkills = React.useMemo(() => {
    if (!analysisResult?.data?.skills) return {};
    return analysisResult.data.skills.reduce((acc, skill) => {
      const cat = skill.category || 'TOOLS_OTHER';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [analysisResult]);

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
              <Badge variant="neutral">Structured JSON Schema</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Model: <code className="text-navy-900 font-mono font-semibold">{aiStatus.model}</code> • Temperature: <code className="text-navy-900 font-mono font-semibold">0.1</code>
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={loading || resumeText.trim().length < 20}
              onClick={() => handleAnalyze('narrative')}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              <span>Narrative Text</span>
            </Button>

            <Button
              variant="coral"
              type="button"
              disabled={loading || resumeText.trim().length < 20}
              loading={loading}
              onClick={() => handleAnalyze('structured')}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Extract Structured Skills (JSON Schema)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message Alert */}
      {error && (
        <div className="mb-8">
          <ErrorMessage
            title="AI Analysis Failed"
            message={error.message || 'Failed to analyze resume text.'}
            onRetry={() => handleAnalyze(analysisMode)}
          />
        </div>
      )}

      {/* Analysis Loading Indicator */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm mb-8 text-center">
          <LoadingIndicator size="lg" text="Calling Google Gemini AI with Structured OpenAPI Schema..." />
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Extracting claimed competencies, project evidence, and unsubstantiated claims with zero hallucination.
          </p>
        </div>
      )}

      {/* STRUCTURED EXTRACTION VIEW (Day 9 Deliverable) */}
      {analysisResult?.data && !loading && (
        <div className="space-y-6 mb-8">
          {/* Summary Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-coral-500" />
                  <span>Structured Claim Analysis (Validated Schema)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Model: <code className="font-semibold text-navy-900">{analysisResult.model}</code> • Confidence: <code className="font-semibold text-navy-900">{Math.round((analysisResult.data.overallConfidence || 0.8) * 100)}%</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawJson(!showRawJson)}
                  type="button"
                >
                  <Code className="w-3.5 h-3.5 mr-1" />
                  <span>{showRawJson ? 'Hide Raw JSON' : 'View Verified JSON'}</span>
                </Button>
                <Badge variant="success">Schema Validated</Badge>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Executive Profile Summary
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {analysisResult.data.summary}
              </p>
            </div>

            {/* Raw JSON Drawer if toggled */}
            {showRawJson && (
              <pre className="mb-4 text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto max-h-72">
                {JSON.stringify(analysisResult.data, null, 2)}
              </pre>
            )}

            {/* Categorized Skills Grid */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Extracted Skills By Domain ({analysisResult.data.skills?.length || 0} Total Claims)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(groupedSkills).map(([category, skills]) => (
                  <div key={category} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-xs font-bold text-navy-900 block mb-2 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                      <span>{category.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-400 font-normal">{skills.length}</span>
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, idx) => (
                        <span
                          key={idx}
                          title={s.evidenceSnippet ? `Evidence: "${s.evidenceSnippet}"` : s.skillName}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:border-coral-300 transition-colors cursor-help"
                        >
                          <span>{s.skillName}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.confidence >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            {analysisResult.data.projects?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-navy-900" />
                  <span>Reported Technical Projects ({analysisResult.data.projects.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.data.projects.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <h5 className="text-xs font-bold text-navy-900 mb-1">{p.projectName}</h5>
                      <p className="text-xs text-slate-600 mb-2.5">{p.description || 'Project details extracted from resume.'}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.technologies?.map((tech, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px] font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unsubstantiated Claims Alert (Zero Code Proof in Resume) */}
            {analysisResult.data.unsubstantiatedClaims?.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold mb-0.5">Unsubstantiated Skills Detected (Potential Inflation):</strong>
                  <span>
                    The candidate listed the following skills without project or implementation context: {analysisResult.data.unsubstantiatedClaims.join(', ')}.
                  </span>
                </div>
              </div>
            )}

            {/* Uncertainties / Anomalies */}
            {analysisResult.data.uncertainties?.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 mb-4">
                <strong className="block font-semibold mb-1">Assessor Uncertainty Disclosures:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {analysisResult.data.uncertainties.map((u, uIdx) => (
                    <li key={uIdx}>{u}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Disclaimer Banner */}
            <div className="p-4 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-coral-600 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">Tekmira Evidence Audit Notice:</strong>
                <span>
                  {analysisResult.disclaimer || 'These extracted competencies are strictly self-reported claims. In Day 10 & 11, Tekmira AI will cross-verify each claim against authentic commits in the candidate\'s public GitHub repositories.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAW NARRATIVE VIEW (Fallback/Alternative Mode) */}
      {analysisResult?.rawAnalysis && !analysisResult?.data && !loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-coral-500" />
                <span>Extracted Skill Claims (Narrative View)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Model: <code className="font-semibold text-navy-900">{analysisResult.model}</code> • Analyzed at: {new Date(analysisResult.analyzedAt).toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="navy">Narrative Output</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap mb-6">
            {analysisResult.rawAnalysis}
          </div>

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
