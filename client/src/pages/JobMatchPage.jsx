import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { 
  Target, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  PlusCircle, 
  FileText,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobMatchPage() {
  const [selectedPreset, setSelectedPreset] = useState('fullstack');
  const [customJD, setCustomJD] = useState('');

  const benchmarkRoles = [
    {
      id: 'fullstack',
      title: 'Graduate Full-Stack Engineer',
      company: 'Campus Placement Benchmark',
      skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git', 'Docker'],
      description: 'Building responsive user interfaces, designing scalable microservices, and managing relational databases.'
    },
    {
      id: 'frontend',
      title: 'Associate Frontend Developer',
      company: 'Campus Placement Benchmark',
      skills: ['React', 'JavaScript (ES6+)', 'Tailwind CSS', 'State Management', 'Web Performance'],
      description: 'Developing high-fidelity single page web applications and integrating RESTful endpoints.'
    },
    {
      id: 'backend',
      title: 'Junior Backend Software Engineer',
      company: 'Campus Placement Benchmark',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Authentication (JWT)', 'Unit Testing'],
      description: 'Designing transactional database schemas, implementing secure auth flows, and optimizing database queries.'
    }
  ];

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
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-coral-500" />
              <span>Standard Campus Placement Benchmark Roles</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose a standard role or paste a custom company job description below.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Presets Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benchmarkRoles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedPreset(role.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedPreset === role.id
                  ? 'border-navy-900 bg-slate-50/80 shadow-sm ring-1 ring-navy-900'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-coral-500 uppercase tracking-wider">
                  {role.company}
                </span>
                {selectedPreset === role.id && (
                  <CheckCircle2 className="w-4 h-4 text-navy-900" />
                )}
              </div>
              <h4 className="text-sm font-bold text-navy-900 mb-1">{role.title}</h4>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                {role.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {role.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom JD Input Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <h3 className="text-base font-bold text-navy-900 mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-coral-500" />
          <span>Or Paste Custom Job Description</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Paste the job requirements from an on-campus placement drive or career portal.
        </p>

        <textarea
          rows={5}
          value={customJD}
          onChange={(e) => setCustomJD(e.target.value)}
          placeholder="Paste requirements, eligibility criteria, and tech stack expectations here..."
          className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all mb-3"
        />

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>In Phase 5, Gemini API will normalize skills into standard taxonomies.</span>
          <span className="font-mono">{customJD.length} characters</span>
        </div>
      </div>

      {/* Next Step Shortcut */}
      <div className="flex justify-end">
        <Link
          to="/analysis-report"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-md transition-all group"
        >
          <span>Proceed to Step 4: Generate Verified Report</span>
          <ArrowRight className="w-4 h-4 text-coral-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </PageLayout>
  );
}
