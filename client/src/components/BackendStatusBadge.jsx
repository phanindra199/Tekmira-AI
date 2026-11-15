import React, { useState, useEffect, useRef } from 'react';
import { checkBackendHealth } from '../services/healthService';
import { RefreshCw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export default function BackendStatusBadge({ compact = false }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'error'
  const [message, setMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Track active AbortController to cancel previous in-flight requests
  const activeControllerRef = useRef(null);

  const verifyConnection = async () => {
    // 1. Cancel any active in-flight request to avoid duplicate concurrent calls
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    setStatus('checking');
    setIsRetrying(true);
    
    try {
      const result = await checkBackendHealth({ signal: controller.signal });
      
      // If this request was cancelled, do nothing (a newer request took over or component unmounted)
      if (result.isCancelled) return;

      if (result.connected && result.data?.success) {
        setStatus('connected');
        setMessage(result.data.message || 'Tekmira AI backend is running');
      } else {
        setStatus('error');
        setMessage(result.error || 'Server unreachable on port 5000');
      }
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setStatus('error');
        setMessage('Connection verification failed');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    verifyConnection();

    // Cleanup: cancel pending request when component unmounts
    return () => {
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {status === 'checking' && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Radio className="w-3 h-3 animate-spin" />
            <span className="font-medium text-[11px]">Connecting...</span>
          </span>
        )}
        {status === 'connected' && (
          <span 
            title={message}
            className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-[11px]">API Online</span>
          </span>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-1.5">
            <span 
              title={message}
              className="flex items-center gap-1 text-xs text-coral-600 bg-coral-50 px-2.5 py-1 rounded-full border border-coral-200 font-medium"
            >
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[11px]">Offline</span>
            </span>
            <button
              onClick={verifyConnection}
              disabled={isRetrying || status === 'checking'}
              className="p-1 text-slate-400 hover:text-navy-900 disabled:opacity-50 rounded transition-colors"
              title="Retry connection"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin text-coral-500' : ''}`} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full Box View (for Sidebar or Dashboard)
  return (
    <div className="p-3 rounded-xl border border-slate-200 transition-all duration-200 bg-white">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-coral-500" />
          <span>Express Backend</span>
        </span>
        
        {status === 'connected' && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        {status === 'checking' && (
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
        )}
        {status === 'error' && (
          <span className="h-2 w-2 rounded-full bg-coral-500"></span>
        )}
      </div>

      <div className="text-xs">
        {status === 'checking' && (
          <p className="text-slate-500 text-[11px]">Pinging http://localhost:5000/api/health...</p>
        )}
        {status === 'connected' && (
          <div>
            <p className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Service Healthy (200 OK)</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="text-coral-600 font-medium flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Backend Unreachable</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{message}</p>
            <button
              onClick={verifyConnection}
              disabled={isRetrying || status === 'checking'}
              className="mt-2 text-[10px] text-coral-600 hover:text-coral-700 font-semibold flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
