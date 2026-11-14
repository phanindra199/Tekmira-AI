import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/healthService';
import { RefreshCw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export default function BackendStatusBadge({ compact = false }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'error'
  const [message, setMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const verifyConnection = async () => {
    setStatus('checking');
    setIsRetrying(true);
    
    const result = await checkBackendHealth();
    
    if (result.connected && result.data?.success) {
      setStatus('connected');
      setMessage(result.data.message);
    } else {
      setStatus('error');
      setMessage(result.error || 'Server unreachable on port 5000');
    }

    setIsRetrying(false);
  };

  useEffect(() => {
    verifyConnection();
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {status === 'checking' && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            <Radio className="w-3 h-3 animate-spin" />
            <span className="font-medium">Connecting...</span>
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
              className="flex items-center gap-1 text-xs text-coral-600 bg-coral-50 px-2 py-1 rounded-full border border-coral-200 font-medium"
            >
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[11px]">Offline</span>
            </span>
            <button
              onClick={verifyConnection}
              disabled={isRetrying}
              className="p-1 text-slate-400 hover:text-navy-900 rounded transition-colors"
              title="Retry connection"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin text-coral-500' : ''}`} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full Box View (ideal for Sidebar or Dashboard)
  return (
    <div className="p-3 rounded-xl border transition-all duration-200 bg-white">
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
            <p className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>{message}</span>
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-1.5">
            <p className="text-coral-600 font-medium text-[11px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{message}</span>
            </p>
            <button
              onClick={verifyConnection}
              disabled={isRetrying}
              className="text-[10px] font-bold text-navy-900 hover:text-coral-500 underline flex items-center gap-1"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Reconnect Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
