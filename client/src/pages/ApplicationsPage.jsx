import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Trash2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Button, LoadingIndicator, ErrorMessage } from '../components/common';
import { jobService } from '../services/jobService';

const STATUSES = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];

export default function ApplicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // READ: this list is loaded from the authenticated API, with joined job details.
  const loadApplications = useCallback(async (signal) => {
    try {
      const result = await jobService.getMyApplications({ signal });
      setItems(result.data || []);
      setError('');
    } catch (err) {
      if (!err.isCancelled) setError(err.message || 'Could not load applications. Sign in and try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadApplications(controller.signal);
    return () => controller.abort();
  }, [loadApplications]);

  // UPDATE: PATCH changes only this candidate's selected application.
  const handleStatusChange = async (applicationId, status) => {
    setBusyId(applicationId);
    try {
      const response = await jobService.updateApplication(applicationId, status);
      setItems((current) => current.map((item) => item.id === applicationId ? response.data : item));
    } catch (err) { setError(err.message || 'Could not update application status.'); }
    finally { setBusyId(null); }
  };

  // DELETE: withdraw removes the application from the database and current list.
  const handleWithdraw = async (applicationId) => {
    setBusyId(applicationId);
    try {
      await jobService.deleteApplication(applicationId);
      setItems((current) => current.filter((item) => item.id !== applicationId));
    } catch (err) { setError(err.message || 'Could not withdraw application.'); }
    finally { setBusyId(null); }
  };

  return (
    <PageLayout title="My Applications" description="Create applications from Job Matching, review them here, update their status, or withdraw." breadcrumbs={<><Link to="/dashboard">Dashboard</Link><span>/</span><span>Applications</span></>}>
      {error && <ErrorMessage message={error} />}
      {loading ? <LoadingIndicator text="Loading applications..." /> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Briefcase className="mx-auto mb-3 text-slate-400"/><h2 className="font-bold text-navy-900">No applications yet</h2><p className="mt-1 text-sm text-slate-500">Apply to a benchmark role to add one to your tracker.</p><Link className="mt-4 inline-block text-sm font-semibold text-coral-600" to="/job-match">Explore jobs</Link></div> : <div className="grid gap-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold text-navy-900">{item.job?.title || 'Job role'}</h2><p className="mt-1 text-sm text-slate-600">{item.job?.company}</p>{item.job?.location && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin size={14}/>{item.job.location}</p>}</div><span className="rounded-full bg-coral-50 px-3 py-1 text-xs font-bold text-coral-700">{item.status}</span></div><div className="mt-4 flex flex-wrap gap-2">{(item.job?.requiredSkills || []).slice(0, 5).map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{skill}</span>)}</div><div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-xs font-semibold text-slate-600">Update status<select aria-label={`Update status for ${item.job?.title || 'application'}`} value={item.status} disabled={busyId === item.id} onChange={(event) => handleStatusChange(item.id, event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"><option value="SAVED">Saved</option>{STATUSES.filter((status) => status !== 'SAVED').map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}</select></label><Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => handleWithdraw(item.id)} icon={Trash2}>Withdraw</Button></div><p className="mt-3 text-xs text-slate-400">Applied {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'recently'}</p></article>)}</div>}
    </PageLayout>
  );
}
