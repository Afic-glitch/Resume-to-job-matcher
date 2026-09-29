import React from 'react';
import { 
  Briefcase, 
  Users, 
  Percent, 
  AlertTriangle, 
  PlusCircle, 
  UploadCloud, 
  ArrowRight, 
  ShieldCheck, 
  Database
} from 'lucide-react';
import { Job, DashboardStats } from '../types';

interface RecruiterDashboardProps {
  stats: DashboardStats;
  jobs: Job[];
  selectedJobId: number | null;
  setSelectedJobId: (id: number) => void;
  onNavigate: (tab: string) => void;
  onLoadDemo: () => Promise<void>;
  isDemoLoading: boolean;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  stats,
  jobs,
  selectedJobId,
  setSelectedJobId,
  onNavigate,
  onLoadDemo,
  isDemoLoading
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Recruiter Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Good morning, Recruiter</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Review candidate-job alignment with transparent AI insights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('job-create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Job</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* Responsible AI Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white block mb-0.5">Responsible AI Principles Enforced:</strong>
          Candidate rankings are based on job-relevant information such as skills, experience and education. Selected identity attributes are masked before matching. This system is designed to support human review, not replace human hiring decisions.
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Jobs */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Jobs</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {stats.total_jobs}
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Active postings</span>
        </div>

        {/* Total Candidates */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Candidates</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {stats.total_candidates}
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Anonymously evaluated</span>
        </div>

        {/* Average Match Score */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Match Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
            {stats.average_match_score}%
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Based on 60/25/15 weights</span>
        </div>

        {/* Skill Gaps Detected */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skill Gaps Detected</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-1">
            {stats.skill_gaps_detected}
          </div>
          <span className="text-xs text-amber-600/90 dark:text-amber-400/90 font-medium">Linked to learning roadmaps</span>
        </div>
      </div>

      {/* Active Jobs Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Recruitment Jobs</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select a job to view ranked candidates or upload new resumes</p>
          </div>
          {jobs.length === 0 && (
            <button
              onClick={onLoadDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Load Python Backend Demo Job</span>
            </button>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <Briefcase className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-800 dark:text-slate-300 font-semibold mb-1">No jobs created yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Get started by clicking &ldquo;Load Demo Data&rdquo; to populate a realistic sample recruitment pipeline or create your own job posting.
            </p>
            <button
              onClick={onLoadDemo}
              disabled={isDemoLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo"
            >
              {isDemoLoading ? 'Loading Sample Data...' : 'Load Sample Demo Pipeline'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <div
                  key={job.id}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500/60 shadow-md dark:shadow-glow-indigo'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900 shadow-sm'
                  }`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {job.company || 'Enterprise'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.required_skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                        {s}
                      </span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        +{job.required_skills.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Exp: {job.experience_required}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJobId(job.id);
                        onNavigate('ranking');
                      }}
                      className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                    >
                      <span>Candidates</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
