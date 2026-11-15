import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { 
  Target, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  FileText,
  Bookmark,
  MapPin,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Badge, LoadingIndicator, ErrorMessage } from '../components/common';
import { jobService } from '../services/jobService';

export default function JobMatchPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [customJD, setCustomJD] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedStatus, setSavedStatus] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      setLoading(true);
      setError(null);
      try {
        const fetchedJobs = await jobService.getJobs({ signal: controller.signal });
        setJobs(fetchedJobs);
        if (fetchedJobs.length > 0) {
          setSelectedJobId(fetchedJobs[0].id);
        }
      } catch (err) {
        if (!err.isCancelled) {
          setError(err.message || 'Unable to load benchmark job profiles');
        }
      } finally {
        setLoading(false);
      }
    }

    loadJobs();

    return () => {
      controller.abort();
    };
  }, []);

  const handleSaveJob = async (jobId) => {
    try {
      await jobService.saveJob(jobId);
      setSavedStatus(prev => ({ ...prev, [jobId]: true }));
    } catch (err) {
      alert(err.message || 'Could not bookmark job');
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <PageLayout
      withSidebar={true}
      title="Target Job Alignment & Requirements"
      description="Select or paste a target Job Description (JD) to evaluate your verified skills against industry hiring criteria."
      breadcrumbs={
        <>
          <Link to="/dashboard" className="hover:text-navy-900">Dashboard</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Job Match</span>
        </>
      }
    >
      {/* Benchmark Roles Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-coral-500" />
              <span>Campus Benchmark Job Profiles</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated campus placement competency profiles fetched from Tekmira AI database.
            </p>
          </div>
          <Badge variant="navy">Step 3 of 3</Badge>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingIndicator size="md" text="Loading benchmark job specifications from PostgreSQL..." centered />
          </div>
        ) : error ? (
          <ErrorMessage title="Failed to Load Benchmark Roles" message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const isSaved = !!savedStatus[job.id];

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-navy-900 bg-navy-50/20 shadow-md ring-2 ring-navy-900/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-navy-900 text-sm">{job.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveJob(job.id);
                        }}
                        title={isSaved ? 'Bookmarked' : 'Save Job'}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                          isSaved ? 'text-coral-500' : 'text-slate-400'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <p className="text-xs font-medium text-slate-500 mb-3">{job.company}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{job.location}</span>
                        </span>
                      )}
                      {job.jobType && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{job.jobType}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(job.requiredSkills || []).slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 4 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">
                          +{(job.requiredSkills || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {isSelected ? '✓ Selected Role' : 'Click to select'}
                    </span>
                    <span className="font-bold text-coral-600">Benchmark JD</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Job Specification View */}
      {selectedJob && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-navy-900" />
                <span>Selected Target Job: {selectedJob.title}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Competency profile used for 3-way verification against your resume claims and GitHub code.
              </p>
            </div>
            <Badge variant="coral">Target Benchmark</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Required Technical Competencies
              </label>
              <div className="flex flex-wrap gap-2">
                {(selectedJob.requiredSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-navy-50 text-navy-900 border border-navy-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-coral-500" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {selectedJob.rawText && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Role Overview & Requirements
                </label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                  {selectedJob.rawText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Job Description Option */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-coral-500" />
              <span>Or Paste a Custom Campus Job Posting</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Have a specific on-campus or off-campus job description? Paste the complete text below.
            </p>
          </div>
        </div>

        <textarea
          rows={6}
          value={customJD}
          onChange={(e) => setCustomJD(e.target.value)}
          placeholder="Paste job title, responsibilities, and required qualifications here..."
          className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all resize-y"
        />

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-coral-500 shrink-0" />
            <span>Gemini NLP will extract mandatory requirements and skill weights automatically.</span>
          </p>

          <Link to="/analysis-report">
            <Button variant="coral">
              <span>Execute 3-Way Triangulation</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
