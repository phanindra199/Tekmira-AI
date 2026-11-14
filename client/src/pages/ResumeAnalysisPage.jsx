import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Code, 
  Layers, 
  Database,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumeAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploaded

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus('uploaded');
    }
  };

  return (
    <PageLayout
      withSidebar={true}
      title="Resume Ingestion & Claim Extraction"
      description="Upload your academic resume to extract claimed technical competencies, frameworks, and project descriptions."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Resume Ingestion</span>
        </>
      }
    >
      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 mx-auto flex items-center justify-center text-navy-900 mb-4">
            <UploadCloud className="w-8 h-8 text-coral-500" />
          </div>

          <h3 className="text-lg font-bold text-navy-900 mb-1">
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload Student Resume (PDF)'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports standard PDF resumes. The parsing engine will extract your technical skill claims and listed project repositories.
          </p>

          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs cursor-pointer shadow-md transition-all group">
            <FileText className="w-4 h-4 text-coral-500 group-hover:scale-110 transition-transform" />
            <span>{selectedFile ? 'Change Selected File' : 'Select PDF File'}</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ready for Phase 3 Backend Parsing (Size: {(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Claims Section (Placeholder state until Phase 3 Backend) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral-500" />
              <span>Extracted Skill Claims</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured taxonomy extracted from resume text by Gemini API.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Awaiting Backend Pipeline
          </span>
        </div>

        {uploadStatus === 'idle' ? (
          <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-navy-900 mb-1">No Resume Uploaded Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Upload your PDF resume above to preview extracted languages, frameworks, and claimed project experience.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-800 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-coral-600" />
              <span>
                <strong>Stage Notice:</strong> File staged. In Phase 3, Node.js will parse this file via <code className="bg-white px-1.5 py-0.5 rounded border border-coral-200">pdf-parse</code> and query the Google Gemini API for structured schema extraction.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Frontend Proficiencies
                </span>
                <p className="text-xs text-slate-500 italic">Extracted claims will render here.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Backend & Systems
                </span>
                <p className="text-xs text-slate-500 italic">Extracted claims will render here.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Databases & Cloud
                </span>
                <p className="text-xs text-slate-500 italic">Extracted claims will render here.</p>
              </div>
            </div>
          </div>
        )}
      </div>

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
