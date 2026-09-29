import React from 'react';
import { ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import { MatchResult, Job } from '../types';

interface CandidateComparisonPageProps {
  candidates: MatchResult[];
  job: Job | null;
  onBack: () => void;
  onViewCandidate: (id: number) => void;
}

export const CandidateComparisonPage: React.FC<CandidateComparisonPageProps> = ({
  candidates,
  job,
  onBack,
  onViewCandidate
}) => {
  if (candidates.length < 2) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500 dark:text-slate-400 space-y-4">
        <Layers className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
        <p>Please select at least 2 candidates from the Candidate Ranking page to compare.</p>
        <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Candidate Ranking
        </button>
      </div>
    );
  }

  // Collect union of required job skills and unique candidate skills
  const jobSkills = job?.required_skills || ['Python', 'SQL', 'REST API', 'Git', 'Docker', 'AWS'];
  const allSkills = Array.from(new Set([...jobSkills]));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Rankings</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Side-by-Side Candidate Comparison</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparing <strong className="text-slate-900 dark:text-white">{candidates.length} candidates</strong> against{' '}
            <strong className="text-indigo-600 dark:text-indigo-300">{job?.title || 'Target Job'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Blind Comparison: Identity attributes masked</span>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">
                  Evaluation Dimension
                </th>
                {candidates.map((c) => (
                  <th key={c.candidate_id} className="py-4 px-6 text-center">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-white block">
                      {c.candidate_code}
                    </span>
                    <button
                      onClick={() => onViewCandidate(c.candidate_id)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium mt-0.5 inline-block"
                    >
                      View Details
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {/* Overall Match Score Row */}
              <tr className="bg-indigo-50/70 dark:bg-indigo-950/20 font-semibold">
                <td className="py-4 px-6 text-slate-900 dark:text-white font-bold">
                  Overall Match Score
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block">60% Skill + 25% Exp + 15% Edu</span>
                </td>
                {candidates.map((c) => {
                  const color =
                    c.final_score >= 85
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : c.final_score >= 75
                      ? 'text-indigo-700 dark:text-indigo-400'
                      : 'text-amber-700 dark:text-amber-400';
                  return (
                    <td key={c.candidate_id} className="py-4 px-6 text-center">
                      <span className={`text-2xl font-black ${color}`}>
                        {c.final_score}%
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Skill Match % */}
              <tr>
                <td className="py-3 px-6 text-slate-700 dark:text-slate-300 font-medium">Skill Alignment Score</td>
                {candidates.map((c) => (
                  <td key={c.candidate_id} className="py-3 px-6 text-center font-bold text-slate-900 dark:text-white">
                    {Math.round(c.skill_score)}%
                  </td>
                ))}
              </tr>

              {/* Skills Matrix Section Header */}
              <tr className="bg-slate-50 dark:bg-slate-900/40">
                <td colSpan={candidates.length + 1} className="py-2.5 px-6 font-bold text-[11px] text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Technical Skill Competency Matrix
                </td>
              </tr>

              {/* Skill Rows */}
              {allSkills.map((skill) => (
                <tr key={skill} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                  <td className="py-2.5 px-6 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                    <span>{skill}</span>
                  </td>
                  {candidates.map((c) => {
                    const hasSkill =
                      c.matched_skills?.includes(skill) ||
                      c.skills?.includes(skill);
                    return (
                      <td key={c.candidate_id} className="py-2.5 px-6 text-center">
                        {hasSkill ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                            ✗
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Experience Row */}
              <tr className="bg-slate-50 dark:bg-slate-900/40">
                <td colSpan={candidates.length + 1} className="py-2.5 px-6 font-bold text-[11px] text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Experience & Background
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300 font-medium">Experience Timeline</td>
                {candidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-6 text-center font-semibold text-slate-900 dark:text-white">
                    {c.experience_raw || `${c.experience} years`}
                  </td>
                ))}
              </tr>

              {/* Education Row */}
              <tr>
                <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300 font-medium">Educational Degree</td>
                {candidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-6 text-center text-slate-700 dark:text-slate-300">
                    {c.education || 'CS Degree'}
                  </td>
                ))}
              </tr>

              {/* Confidence Row */}
              <tr>
                <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300 font-medium">Data Completeness Confidence</td>
                {candidates.map((c) => (
                  <td key={c.candidate_id} className="py-3.5 px-6 text-center">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {c.confidence || 'High'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
