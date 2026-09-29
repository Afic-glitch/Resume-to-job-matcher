import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchCode, setSearchCode] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (searchCode.trim()) {
      return log.candidate_code?.toLowerCase().includes(searchCode.toLowerCase().trim()) ||
             log.job_title?.toLowerCase().includes(searchCode.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Compliance & Auditability</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Transparency & Match Audit Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable trace of models, weights, signals used, and identity attributes excluded for every scoring event.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Search by candidate code (e.g. CAND-014) or job title..."
          className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="glass-panel text-center py-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Loading Audit Logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No audit records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Audit logs are automatically created each time a resume is parsed, masked, and matched against a job description.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Top row: Candidate Code, Job Title, Timestamp & Final Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    {log.candidate_code}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block">{log.job_title}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block leading-none">
                      {log.final_score}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                      Audited Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle row: Model & Weights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Inference Architecture</span>
                  </span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    {log.model_name}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Standardized Weights
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span>Skills: <strong>60%</strong></span>
                    <span>&bull;</span>
                    <span>Exp: <strong>25%</strong></span>
                    <span>&bull;</span>
                    <span>Edu: <strong>15%</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom row: Information Used vs Information Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                {/* Information Used */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[10px] block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Included in Score Calculation</span>
                  </span>
                  <ul className="text-slate-700 dark:text-slate-300 text-[11px] space-y-0.5">
                    {log.information_used.map((item, i) => (
                      <li key={i}>&bull; {item}</li>
                    ))}
                  </ul>
                </div>

                {/* Information Excluded */}
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 space-y-1.5">
                  <span className="text-rose-700 dark:text-rose-400 font-semibold uppercase text-[10px] block flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Masked / Excluded Identity Attributes</span>
                  </span>
                  <ul className="text-slate-700 dark:text-slate-300 text-[11px] space-y-0.5">
                    {log.information_excluded.map((item, i) => (
                      <li key={i}>&bull; {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
