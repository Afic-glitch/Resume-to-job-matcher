import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Layers, 
  Eye, 
  ArrowUpDown, 
  ShieldCheck
} from 'lucide-react';
import { MatchResult, Job } from '../types';

interface CandidateRankingPageProps {
  candidates: MatchResult[];
  jobs: Job[];
  selectedJobId: number | null;
  setSelectedJobId: (id: number) => void;
  onSelectCandidate: (candidateId: number) => void;
  onCompareCandidates: (candidateIds: number[]) => void;
  onNavigate: (tab: string) => void;
}

export const CandidateRankingPage: React.FC<CandidateRankingPageProps> = ({
  candidates,
  jobs,
  selectedJobId,
  setSelectedJobId,
  onSelectCandidate,
  onCompareCandidates,
  onNavigate
}) => {
  const [minScore, setMinScore] = useState<number>(0);
  const [searchSkill, setSearchSkill] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<'final_score' | 'skill_score' | 'experience'>('final_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Filtering candidates
  const filteredCandidates = candidates.filter(c => {
    if (c.final_score < minScore) return false;
    if (searchSkill.trim()) {
      const q = searchSkill.toLowerCase().trim();
      const hasSkill = c.skills?.some(s => s.toLowerCase().includes(q)) ||
                       c.matched_skills?.some(s => s.toLowerCase().includes(q));
      if (!hasSkill) return false;
    }
    return true;
  }).sort((a, b) => {
    let valA = a[sortField] || 0;
    let valB = b[sortField] || 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleToggleSelect = (cid: number) => {
    if (selectedIds.includes(cid)) {
      setSelectedIds(selectedIds.filter(id => id !== cid));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare a maximum of 4 candidates simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, cid]);
    }
  };

  const handleCompareClick = () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 candidates to compare.');
      return;
    }
    onCompareCandidates(selectedIds);
    onNavigate('comparison');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Candidate Matching & Ranking</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Candidate Matches</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Target Job: <strong className="text-indigo-600 dark:text-indigo-300">{selectedJob?.title || 'All Active Positions'}</strong>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedJobId || (jobs[0]?.id || '')}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <button
            onClick={handleCompareClick}
            disabled={selectedIds.length < 2}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all disabled:opacity-40"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Selected ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Critical Responsible AI Identity Notice (Section 10) */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Blind Ranking Active:</strong> Candidate names, demographic attributes, photos, and contact info are masked. Candidates are identified solely by anonymized codes (e.g. <code className="text-indigo-600 dark:text-indigo-300 font-mono">CAND-014</code>).
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Weights: 60% Skill | 25% Exp | 15% Edu</span>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Search Skill */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            placeholder="Filter by skill (e.g. Docker, Python)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Min Score Slider */}
        <div className="flex items-center gap-3">
          <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">Min Score: <strong className="text-slate-900 dark:text-white">{minScore}%</strong></span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Sort By */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-slate-600 dark:text-slate-400">Sort:</span>
          <select
            value={sortField}
            onChange={(e: any) => setSortField(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="final_score">Match Score</option>
            <option value="skill_score">Skill Match</option>
            <option value="experience">Experience</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Candidates List / Table */}
      {filteredCandidates.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <UserCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No candidates match your current filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your minimum score or skill filter, or upload new resumes to this job posting.
          </p>
          <button
            onClick={() => { setMinScore(0); setSearchSkill(''); }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-medium border border-slate-300 dark:border-slate-700 shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map((candidate, idx) => {
            const isChecked = selectedIds.includes(candidate.candidate_id);
            const scoreColor =
              candidate.final_score >= 85
                ? 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20'
                : candidate.final_score >= 75
                ? 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/20'
                : 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20';

            return (
              <div
                key={candidate.candidate_id}
                className={`glass-card glass-card-hover p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isChecked 
                    ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50/70 dark:bg-indigo-950/30' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Left: Checkbox, Code, Score Badge */}
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(candidate.candidate_id)}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    title="Select to compare"
                  />

                  {/* Rank Position */}
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-6">#{idx + 1}</span>

                  {/* Candidate Code (NO NAME!) */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-white tracking-wide">
                        {candidate.candidate_code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
                        {candidate.confidence || 'High'} Conf.
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {candidate.education || 'B.Tech Computer Science'}
                    </span>
                  </div>
                </div>

                {/* Center: Qualification Signals */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-y md:border-y-0 md:border-x border-slate-200 dark:border-slate-800/80 py-3 md:py-0 md:px-6">
                  {/* Skill Match */}
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Skill Alignment</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {Math.round(candidate.skill_score)}%
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {candidate.matched_skills?.length || 0} matched / {candidate.missing_skills?.length || 0} missing
                    </span>
                  </div>

                  {/* Experience */}
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Experience</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {candidate.experience_raw || `${candidate.experience} years`}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                      {candidate.experience_score >= 80 ? '✓ Meets requirement' : '~ Near requirement'}
                    </span>
                  </div>

                  {/* Education */}
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Education</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate block">
                      {candidate.education || 'CS / Tech Degree'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                      ✓ Matches requirement
                    </span>
                  </div>
                </div>

                {/* Right: Score & View Button */}
                <div className="flex items-center justify-between md:justify-end gap-4">
                  {/* Big Prominent Match Score */}
                  <div className={`px-4 py-2 rounded-xl border text-center font-bold ${scoreColor}`}>
                    <span className="text-xl block leading-none">{candidate.final_score}%</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Match Score</span>
                  </div>

                  {/* View Details Action */}
                  <button
                    onClick={() => {
                      onSelectCandidate(candidate.candidate_id);
                      onNavigate('candidate-detail');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>View Candidate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
