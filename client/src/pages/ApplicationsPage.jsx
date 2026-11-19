import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Button, LoadingIndicator, ErrorMessage } from '../components/common';
import { jobService } from '../services/jobService';

export default function ApplicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    jobService.getMyApplications({ signal: controller.signal })
      .then((result) => setItems(result.data || []))
      .catch((err) => { if (!err.isCancelled) setError(err.message || 'Could not load applications. Sign in and try again.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  return <PageLayout title="My Applications" description="Your submitted applications and their current status." breadcrumbs={<><Link to="/dashboard">Dashboard</Link><span>/</span><span>Applications</span></>}>
    {loading ? <LoadingIndicator label="Loading applications..." /> : error ? <ErrorMessage message={error} /> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Briefcase className="mx-auto mb-3 text-slate-400"/><h2 className="font-bold text-navy-900">No applications yet</h2><p className="mt-1 text-sm text-slate-500">Apply to a benchmark role to see it here.</p><Link className="mt-4 inline-block text-sm font-semibold text-coral-600" to="/job-match">Explore jobs</Link></div> : <div className="grid gap-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold text-navy-900">{item.job?.title || 'Job role'}</h2><p className="mt-1 text-sm text-slate-600">{item.job?.company}</p>{item.job?.location && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin size={14}/>{item.job.location}</p>}</div><span className="rounded-full bg-coral-50 px-3 py-1 text-xs font-bold text-coral-700">{item.status}</span></div><div className="mt-4 flex flex-wrap gap-2">{(item.job?.requiredSkills || []).slice(0, 5).map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{skill}</span>)}</div><p className="mt-3 text-xs text-slate-400">Applied {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'recently'}</p></article>)}</div>}
  </PageLayout>;
}
