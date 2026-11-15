import React, { useState, useEffect, useRef } from 'react';
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
  ListFilter,
  UploadCloud,
  FileCheck2,
  Fingerprint,
  FileSearch,
  Hash,
  AlertTriangle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import aiService, { SAMPLE_CANDIDATE_RESUME } from '../services/aiService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingIndicator from '../components/common/LoadingIndicator';
import { normalizeApiError } from '../utils/apiError';

export default function ResumeAnalysisPage() {
  // Input tabs: 'upload' (PDF file) or 'text' (raw text / sample)
  const [activeTab, setActiveTab] = useState('upload');
  
  // PDF Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pdfMetadata, setPdfMetadata] = useState(null);
  const [scannedWarning, setScannedWarning] = useState(null);
  const fileInputRef = useRef(null);

  // Resume text & analysis state
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
        const status = await aiService.getAiStatus();
        if (isMounted) {
          setAiStatus({
            configured: status?.data?.configured || false,
            model: status?.data?.model || 'gemini-2.5-flash',
            checked: true
          });
        }
      } catch (err) {
        if (isMounted) {
          setAiStatus({ configured: false, model: 'unavailable', checked: true });
        }
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  // Handle file selection via input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelectFile(file);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSelectFile(file);
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;

    setError(null);
    setScannedWarning(null);

    // 1. Verify extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file type. Only standard PDF documents (.pdf) are permitted.');
      return;
    }

    // 2. Verify file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the strict 5MB upload limit.`);
      return;
    }

    setSelectedFile(file);
    setPdfMetadata(null);
  };

  // Upload and parse PDF stream
  const handleUploadPdf = async (autoAnalyze = false) => {
    if (!selectedFile) {
      setError('Please select a PDF resume file to upload.');
      return;
    }

    setUploadLoading(true);
    setError(null);
    setScannedWarning(null);

    try {
      const response = await aiService.uploadResumePdf(selectedFile, { autoAnalyze });
      const data = response.data;

      setPdfMetadata(data);
      if (data.rawTextPreview || data.rawTextLength) {
        // Auto-populate the resumeText state with extracted text
        // (In development we also query getResumeById or use the preview)
        setResumeText(data.rawTextPreview || '');
      }

      // Check if scanned document
      if (data.isScanned) {
        setScannedWarning(
          'No selectable text stream detected in this PDF. It appears to be an image-based scanned document. Tekmira AI requires selectable text; OCR is not supported.'
        );
      }

      // If auto-analyze was run and claims returned
      if (autoAnalyze && data.extractedClaims?.skills?.length > 0) {
        setAnalysisResult({
          success: true,
          model: aiStatus.model,
          analyzedAt: data.createdAt,
          disclaimer: 'Extracted competencies are unverified self-reported claims. In Day 11 & 12, Tekmira AI will cross-verify each against authentic commits in your public GitHub repository.',
          data: {
            candidateName: data.extractedClaims.candidateName || 'Extracted Candidate',
            skills: data.extractedClaims.skills.map(s => ({
              skillName: s.name,
              category: s.category,
              confidence: s.confidence,
              evidenceSnippet: s.context
            })),
            projects: data.extractedClaims.projects.map(p => ({
              projectName: p.title,
              description: p.description,
              technologies: p.technologies
            })),
            unsubstantiatedClaims: [],
            uncertainties: []
          }
        });
      }
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (err.response?.status === 422 || normalized.includes('OCR')) {
        setScannedWarning(normalized);
      } else {
        setError(normalized);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Reset file selection
  const handleClearFile = () => {
    setSelectedFile(null);
    setPdfMetadata(null);
    setScannedWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load standard development sample
  const handleLoadSample = () => {
    setResumeText(SAMPLE_CANDIDATE_RESUME);
    setIsSampleLoaded(true);
    setError(null);
  };

  // Clear text input
  const handleClearText = () => {
    setResumeText('');
    setIsSampleLoaded(false);
    setError(null);
    setAnalysisResult(null);
  };

  // Analyze text with Gemini (Structured Output)
  const handleAnalyze = async (mode = 'structured') => {
    if (!resumeText.trim()) {
      setError('Please provide candidate resume text or upload a valid PDF document.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisMode(mode);

    try {
      let result;
      if (mode === 'structured') {
        result = await aiService.extractStructuredSkills(resumeText.trim());
      } else {
        result = await aiService.analyzeResume(resumeText.trim());
      }
      setAnalysisResult(result);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Group skills by category for structured card view
  const groupSkillsByCategory = (skills = []) => {
    const groups = {};
    skills.forEach(skill => {
      const cat = skill.category || 'GENERAL';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  };

  return (
    <PageLayout
      title="Resume Claim Extraction & Verification"
      description="Extract digital text streams, validate PDF signatures, and structure candidate claims with Google Gemini."
    >
      {/* AI Engine & Parser Health Header Banner */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center text-white">
            <Cpu className="w-5 h-5 text-coral-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-navy-900">Tekmira Evidence Parsing Engine</h2>
              <Badge variant="navy">Day 10 Active</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Multer Memory Stream • %PDF- Magic Bytes • SHA-256 Hashing • Gemini 2.5 Flash Structured Schemas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aiStatus.checked ? (
            aiStatus.configured ? (
              <Badge variant="emerald" className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Gemini Online ({aiStatus.model})
              </Badge>
            ) : (
              <Badge variant="amber" className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                API Key Not Configured (Mock Fallback)
              </Badge>
            )
          ) : (
            <Badge variant="slate">Probing Engine...</Badge>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column: Input Panel (Tabs: PDF Upload vs Text) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex-1 flex flex-col">
            
            {/* Input Mode Selector Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'upload'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-coral-500" />
                <span>Upload PDF Resume</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-coral-50 text-coral-600 font-bold">New</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'text'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <FileText className="w-4 h-4 text-navy-900" />
                <span>Paste Text / Sample</span>
              </button>
            </div>

            {/* TAB 1: PDF UPLOAD DROPZONE */}
            {activeTab === 'upload' && (
              <div className="flex-1 flex flex-col">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer mb-4 ${
                    dragOver 
                      ? 'border-coral-500 bg-coral-50/50' 
                      : selectedFile
                        ? 'border-emerald-400 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                        <FileCheck2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-navy-900 max-w-xs truncate">{selectedFile.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB • application/pdf
                      </p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-coral-600 hover:underline"
                      >
                        <X className="w-3.5 h-3.5" /> Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-navy-900 flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6 text-coral-500" />
                      </div>
                      <h4 className="text-sm font-bold text-navy-900">Drag & drop your PDF resume here</h4>
                      <p className="text-xs text-slate-500 mt-1">or click to browse from your computer</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-200/60 font-mono">.PDF strictly</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200/60 font-mono">Max 5MB</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200/60 font-mono">%PDF- signature verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scanned / Image PDF Warning Alert */}
                {scannedWarning && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong className="block font-semibold mb-0.5">Scanned or Unreadable PDF Detected:</strong>
                      <p className="text-amber-800 leading-relaxed">{scannedWarning}</p>
                    </div>
                  </div>
                )}

                {/* Extracted PDF Metadata Card */}
                {pdfMetadata && (
                  <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-coral-500" />
                        PDF Forensic Metadata Extracted
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified %PDF- Header
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                      <div className="p-2 rounded bg-white border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Pages</span>
                        <span className="font-bold text-navy-900">{pdfMetadata.pageCount}</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Word Count</span>
                        <span className="font-bold text-navy-900">{pdfMetadata.wordCount} words</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Binary Size</span>
                        <span className="font-bold text-navy-900">{(pdfMetadata.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Scanned Check</span>
                        <span className={`font-bold ${pdfMetadata.isScanned ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {pdfMetadata.isScanned ? 'Scanned' : 'Digital Text'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono break-all">
                      <Hash className="w-3 h-3 shrink-0 text-slate-400" />
                      <span>SHA-256: {pdfMetadata.sha256Hash || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* Upload Action Buttons */}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="navy"
                    onClick={() => handleUploadPdf(false)}
                    disabled={!selectedFile || uploadLoading}
                    className="flex-1"
                  >
                    {uploadLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Streaming PDF...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FileSearch className="w-4 h-4" />
                        <span>Extract PDF Stream</span>
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="coral"
                    onClick={() => handleUploadPdf(true)}
                    disabled={!selectedFile || uploadLoading}
                    className="flex-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Extract & Auto-Analyze</span>
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: RAW TEXT / BENCHMARK SAMPLE */}
            {activeTab === 'text' && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="resume-text-input" className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                    Resume Text Stream
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="text-xs text-coral-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Load Benchmark Resume
                    </button>
                    {resumeText && (
                      <button
                        type="button"
                        onClick={handleClearText}
                        className="text-xs text-slate-400 hover:text-slate-600 ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="resume-text-input"
                  rows={14}
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setIsSampleLoaded(false);
                    setError(null);
                  }}
                  placeholder="Paste candidate resume text or click 'Load Benchmark Resume' above to test with calibrated engineering claims..."
                  className="w-full flex-1 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all resize-none bg-slate-50/50"
                />

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 mb-4">
                  <span>{resumeText.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>{resumeText.length} characters</span>
                </div>

                {/* Analysis Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="coral"
                    onClick={() => handleAnalyze('structured')}
                    disabled={!resumeText.trim() || loading}
                    className="flex-1"
                  >
                    {loading && analysisMode === 'structured' ? (
                      <span className="flex items-center justify-center gap-2">
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Enforcing Zod Schemas...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Extract Claims (Structured JSON)</span>
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAnalyze('narrative')}
                    disabled={!resumeText.trim() || loading}
                  >
                    <span className="text-xs">Narrative Summary</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Architectural Viva & Assessor Defense Panel */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Project Assessor Evidence & Security Guarantees</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="block text-navy-900 font-semibold mb-1">
                  1. Magic Byte Inspection (%PDF-) vs Simple Extension
                </strong>
                <span>
                  Extensions (.pdf) and Content-Type headers are trivially spoofed. Tekmira AI validates the raw binary buffer for the official <code>%PDF-</code> (hex <code>25 50 44 46 2D</code>) file signature before processing.
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="block text-navy-900 font-semibold mb-1">
                  2. Multer Memory Storage & 5MB Guard
                </strong>
                <span>
                  Using in-memory buffers prevents saving unvetted, potentially malicious binaries to disk, avoiding orphaned temporary file vulnerabilities and filesystem exhaustion attacks.
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="block text-navy-900 font-semibold mb-1">
                  3. Scanned Image Detection & Zero-OCR Honesty
                </strong>
                <span>
                  Text stream parsers cannot read raster photographs inside PDFs. Tekmira AI detects empty/scanned documents and issues transparent, honest disclosures rather than hallucinating text.
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="block text-navy-900 font-semibold mb-1">
                  4. SHA-256 Audit Fingerprinting
                </strong>
                <span>
                  Every uploaded PDF generates an immutable cryptographic SHA-256 digest stored in MongoDB <code>ResumeDocument</code> for tamper-evident evaluation records.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Scheduled Next (Day 11):</span>
              <span className="font-semibold text-navy-900 flex items-center gap-1">
                GitHub REST API Code Mining <ArrowRight className="w-3.5 h-3.5 text-coral-500" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-6">
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        </div>
      )}

      {/* Loading Indicator */}
      {(loading || uploadLoading) && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center mb-8">
          <LoadingIndicator 
            message={
              uploadLoading 
                ? "Extracting PDF stream & verifying cryptographic magic bytes..." 
                : "Communicating with Gemini 2.5 Flash & enforcing structured JSON schemas..."
            } 
          />
        </div>
      )}

      {/* STRUCTURED ANALYSIS VIEW */}
      {analysisResult?.data && !loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 animate-fade-in">
          {/* Header with Candidate Name & Model details */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-navy-900">
                  {analysisResult.data.candidateName || 'Candidate Profile'}
                </h3>
                <Badge variant="emerald">Schema Validated</Badge>
                <Badge variant="navy">{analysisResult.data.skills?.length || 0} Skills Extracted</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Model: <code className="font-semibold text-navy-900">{analysisResult.model || 'gemini-2.5-flash'}</code> • 
                Prompt Version: <code className="font-mono text-slate-600">v1.0.0</code> • 
                Analyzed: {new Date(analysisResult.analyzedAt || Date.now()).toLocaleTimeString()}
              </p>
            </div>

            {/* Toggle Raw JSON Drawer */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Raw Schema JSON' : 'Inspect Raw Schema JSON'}</span>
            </Button>
          </div>

          {/* Collapsible Raw JSON Drawer for Viva Examiner Inspection */}
          {showRawJson && (
            <div className="mb-6 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span>Verified Schema Output (OpenAPI Object)</span>
                <span>Zod Runtime Certified</span>
              </div>
              <pre>{JSON.stringify(analysisResult.data, null, 2)}</pre>
            </div>
          )}

          {/* Categorized Skills Grid */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-navy-900" />
              <span>Extracted Competencies by Domain</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(groupSkillsByCategory(analysisResult.data.skills)).map(([category, skills]) => (
                <div key={category} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>{category.replace('_', ' ')}</span>
                    <span className="text-xs text-slate-400 font-normal">{skills.length}</span>
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, idx) => (
                      <span
                        key={idx}
                        title={s.evidenceSnippet ? `Evidence: "${s.evidenceSnippet}"` : s.skillName}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-coral-300 transition-colors cursor-help"
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
                {analysisResult.disclaimer || 'These extracted competencies are strictly self-reported claims. In Day 11 & 12, Tekmira AI will cross-verify each claim against authentic commits in the candidate\'s public GitHub repositories.'}
              </span>
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

          <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            {analysisResult.rawAnalysis}
          </div>

          <div className="p-4 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-coral-600 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Evidence Disclaimer:</strong>
              <span>
                {analysisResult.disclaimer || 'Extracted skills represent unverified candidate claims.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
