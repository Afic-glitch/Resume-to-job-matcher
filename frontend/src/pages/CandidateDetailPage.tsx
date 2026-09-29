import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Layers
} from 'lucide-react';
import { ScoreDetails, Job, AuditLog, RoadmapWeek } from '../types';

interface CandidateDetailPageProps {
  candidateData: {
    candidate: any;
    job: Job;
    score_details: ScoreDetails;
    roadmap: RoadmapWeek[];
    resume_suggestions: string[];
    audit_logs: AuditLog[];
  } | null;
  onBack: () => void;
}

export const CandidateDetailPage: React.FC<CandidateDetailPageProps> = ({
  candidateData,
  onBack
}) => {
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(true);
  const [showMaskedText, setShowMaskedText] = useState<boolean>(false);

  if (!candidateData) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500 dark:text-slate-400">
        <p>No candidate selected.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Rankings
        </button>
      </div>
    );
  }

  const { candidate, job, score_details } = candidateData;

  const scoreBadgeColor =
    score_details.final_score >= 85
      ? 'from-emerald-600 to-teal-600 border-emerald-500/40 shadow-glow-emerald'
      : score_details.final_score >= 75
      ? 'from-indigo-600 to-blue-600 border-indigo-500/40 shadow-glow-indigo'
      : 'from-amber-600 to-orange-600 border-amber-500/40';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Navigation and Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Rankings</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Position Target:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white shadow-sm">
            {job?.title || 'Target Job'}
          </span>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide">
              {candidate.candidate_code}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Identity Masked</span>
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              score_details.confidence === 'High'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
            }`}>
              {score_details.confidence} Analysis Confidence
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {score_details.confidence_reason}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300 pt-1">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Exp: {candidate.experience_raw || `${candidate.experience} years`}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{candidate.education}</span>
            </span>
            {candidate.certifications?.length > 0 && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{candidate.certifications.length} verified certification(s)</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Big Overall Match Score Badge */}
        <div className={`p-6 rounded-2xl bg-gradient-to-tr ${scoreBadgeColor} text-white text-center min-w-[170px]`}>
          <span className="text-4xl sm:text-5xl font-black block tracking-tight leading-none">
            {score_details.final_score}%
          </span>
          <span className="text-xs font-bold uppercase tracking-wider mt-1 block opacity-90">
            Overall Match
          </span>
          <span className="text-[10px] text-white/80 font-mono block mt-0.5">
            Exact: {score_details.final_score_exact}%
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 11 & 12: EXPLAINABLE SCORE UI (CRITICAL FEATURE) */}
      {/* ============================================================ */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-500/30 space-y-6 shadow-glow-indigo">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Explainable AI Scoring
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Why this candidate scored {score_details.final_score}%
            </h2>
          </div>
          <button
            onClick={() => setShowHowCalculated(!showHowCalculated)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{showHowCalculated ? 'Hide Breakdown Details' : 'How this was calculated'}</span>
            {showHowCalculated ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Visual Progress Breakdown */}
        <div className="space-y-5 bg-slate-100/90 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* 1. Skill Match (60% Weight) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Skill Match (60% Total Weight)
              </span>
              <div className="font-mono text-xs">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(score_details.skill_score)}%</span>
                <span className="text-slate-500 dark:text-slate-400"> &rarr; Contribution: </span>
                <strong className="text-slate-900 dark:text-white">{score_details.skill_contribution} / 60</strong>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(score_details.skill_contribution / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* 2. Experience Match (25% Weight) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Experience Match (25% Total Weight)
              </span>
              <div className="font-mono text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.round(score_details.experience_score)}%</span>
                <span className="text-slate-500 dark:text-slate-400"> &rarr; Contribution: </span>
                <strong className="text-slate-900 dark:text-white">{score_details.experience_contribution} / 25</strong>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(score_details.experience_contribution / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Education Match (15% Weight) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Education Match (15% Total Weight)
              </span>
              <div className="font-mono text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(score_details.education_score)}%</span>
                <span className="text-slate-500 dark:text-slate-400"> &rarr; Contribution: </span>
                <strong className="text-slate-900 dark:text-white">{score_details.education_contribution} / 15</strong>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(score_details.education_contribution / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Formula summary */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono text-[11px]">
              {score_details.skill_contribution} (Skill) + {score_details.experience_contribution} (Exp) + {score_details.education_contribution} (Edu) = <strong className="text-slate-900 dark:text-white">{score_details.final_score_exact}%</strong> &rarr; Rounded: <strong className="text-indigo-600 dark:text-indigo-300">{score_details.final_score}%</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              ✓ Deterministic Mathematical Proof
            </span>
          </div>
        </div>

        {/* Expandable "How this was calculated" Panel (Section 12) */}
        {showHowCalculated && (
          <div className="bg-white dark:bg-slate-950/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Underlying Attribute Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Required Skills</span>
                <p className="font-bold text-slate-900 dark:text-white">{job?.required_skills?.length || 0} skills demanded</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">{score_details.matched_skills.length} matched</p>
                <p className="text-rose-600 dark:text-rose-400 font-medium">{score_details.missing_skills.length} missing</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Experience Requirement</span>
                <p className="text-slate-700 dark:text-slate-300">Required: <strong className="text-slate-900 dark:text-white">{job?.experience_required}</strong></p>
                <p className="text-slate-700 dark:text-slate-300">Candidate: <strong className="text-slate-900 dark:text-white">{candidate.experience_raw || `${candidate.experience} years`}</strong></p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {score_details.experience_rationale}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Education Requirement</span>
                <p className="text-slate-700 dark:text-slate-300">Required: <strong className="text-slate-900 dark:text-white">{job?.education_required}</strong></p>
                <p className="text-slate-700 dark:text-slate-300">Candidate: <strong className="text-slate-900 dark:text-white">{candidate.education}</strong></p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {score_details.education_rationale}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Matched & Missing Skills Sections (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Matched Skills ({score_details.matched_skills.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              Verified from Resume
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {score_details.matched_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold"
              >
                <span>✓</span>
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills with Learning Suggestions */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Missing Skills / Gaps ({score_details.missing_skills.length})</span>
            </h3>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
              Roadmap Available
            </span>
          </div>

          {score_details.missing_skills.length === 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium py-2">
              All required skills for this position are satisfied!
            </p>
          ) : (
            <div className="space-y-3">
              {score_details.missing_skills.map((skill) => (
                <div key={skill} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <span>✗</span>
                      <span>{skill}</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Learning suggestion:</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-4 space-y-0.5">
                    <div>&rarr; {skill} Core Fundamentals</div>
                    <div>&rarr; Architecture Patterns & Practice Projects</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Relevant Projects Section */}
      {candidate.projects?.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Extracted Relevant Projects</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {candidate.projects.map((p: string, i: number) => (
              <li key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">&bull;</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audit Log Transparency Card (Section 22) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Responsible-AI Audit Trail</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Candidate ID: {candidate.candidate_code}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold block uppercase text-[10px]">
              ✓ Information Used in Scoring
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
              <li>&bull; Technical Skills ({candidate.skills?.join(', ') || 'Extracted tags'})</li>
              <li>&bull; Experience Duration ({candidate.experience_raw})</li>
              <li>&bull; Educational Degree ({candidate.education})</li>
              <li>&bull; Technical Project Descriptions</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-rose-700 dark:text-rose-400 font-semibold block uppercase text-[10px]">
              ✗ Information Excluded from Scoring
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
              <li>&bull; Candidate Name (Scrubbed before model input)</li>
              <li>&bull; Gender & Pronouns (Masked)</li>
              <li>&bull; Photograph & Visual Appearance (Omitted)</li>
              <li>&bull; Email, Phone & Home Address (Masked)</li>
              <li>&bull; Caste & Demographic Indicators (Omitted)</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => setShowMaskedText(!showMaskedText)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium"
          >
            {showMaskedText ? 'Hide Masked Resume Text' : 'View Masked Resume Text Evaluated by AI'}
          </button>
          {showMaskedText && (
            <div className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-left font-mono text-[11px] text-slate-800 dark:text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {candidate.masked_text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
