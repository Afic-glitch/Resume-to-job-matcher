import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';
import { Job, RoadmapWeek } from '../types';

interface CandidateModePageProps {
  jobs: Job[];
}

export const CandidateModePage: React.FC<CandidateModePageProps> = ({ jobs }) => {
  const [selectedJobId, setSelectedJobId] = useState<number>(jobs[0]?.id || 1);
  const [customJobDesc, setCustomJobDesc] = useState<string>('');
  const [useCustomJob, setUseCustomJob] = useState<boolean>(false);
  const [resumeText, setResumeText] = useState<string>(
`Priya Sharma
priya.sharma@example.com | +91 9811122233
Bengaluru, India

SUMMARY:
Software Engineer with 1.5 years of experience in backend development. Specialized in designing scalable REST APIs with Python, Django, and PostgreSQL. Proficient in Git version control and SQL database performance tuning.

EDUCATION:
B.Tech in Computer Science & Engineering, Batch of 2024 (First Class with Distinction)

SKILLS:
Python, SQL, REST API, Git, Django, PostgreSQL, Linux, HTML, CSS

WORK EXPERIENCE:
Associate Backend Engineer (2024 - Present)
- Developed and documented RESTful microservice endpoints for high-throughput client applications.
- Optimized complex SQL queries, reducing query response times by 35%.
- Maintained code repositories using Git and automated integration workflows.

PROJECTS:
- Scalable E-commerce Cart API: Built with Python and Django REST framework.
- Database Migration Engine: Migrated legacy relational tables to PostgreSQL.`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunMatch = async () => {
    if (!resumeText.trim()) {
      setErrorMsg('Please paste your resume text to evaluate alignment.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const payload: any = { resume_text: resumeText };
      if (useCustomJob && customJobDesc.trim()) {
        payload.job_description = customJobDesc;
      } else {
        payload.job_id = selectedJobId;
      }
      const res = await api.matchAdHoc(payload);
      setMatchResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing resume match');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Candidate Career Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Your Job Match & Learning Roadmap</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Check your alignment against industry job descriptions. Identify skills gaps and get a tailored study roadmap.
        </p>
      </div>

      {/* Responsible AI Disclaimer (Section 34) */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white block mb-0.5">Responsible AI Notice:</strong>
          This score represents alignment between your resume and the selected job description. It is not a guarantee of employment. All personal identification attributes (name, contact details, gender) are masked during analysis.
        </div>
      </div>

      {/* Input Section: Target Job + Resume Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Job Selection */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Select Target Job
            </label>
            <button
              type="button"
              onClick={() => setUseCustomJob(!useCustomJob)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium"
            >
              {useCustomJob ? 'Select from active jobs' : 'Or paste custom job description'}
            </button>
          </div>

          {!useCustomJob ? (
            <div className="space-y-3">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} &bull; {j.company}
                  </option>
                ))}
              </select>

              {jobs.find(j => j.id === selectedJobId) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold uppercase text-[10px]">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {jobs.find(j => j.id === selectedJobId)?.required_skills.map((s, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Exp: {jobs.find(j => j.id === selectedJobId)?.experience_required} | Edu: {jobs.find(j => j.id === selectedJobId)?.education_required}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              rows={7}
              value={customJobDesc}
              onChange={(e) => setCustomJobDesc(e.target.value)}
              placeholder="Paste target job requirements here..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
            />
          )}
        </div>

        {/* Right: Resume Paste */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              2. Your Resume (Text or Content)
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <button
            onClick={handleRunMatch}
            disabled={isLoading || !resumeText.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow-emerald transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing Alignment...' : 'Analyze My Match & Generate Roadmap'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-8 pt-4">
          {/* Top Alignment Hero Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-glow-indigo">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Alignment Analysis for {matchResult.candidate_code}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Match Results for &ldquo;{matchResult.job.title}&rdquo;
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {matchResult.score_details.explanation_summary}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-600 text-white text-center min-w-[150px]">
              <span className="text-4xl font-black block leading-none">
                {matchResult.score_details.final_score}%
              </span>
              <span className="text-[11px] uppercase tracking-wider font-semibold opacity-90 mt-1 block">
                Match Score
              </span>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Matched Skills ({matchResult.score_details.matched_skills.length})</span>
                </h3>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Verified in Resume
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.score_details.matched_skills.map((s: string) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold"
                  >
                    <span>✓</span>
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Skill Gaps ({matchResult.score_details.missing_skills.length})</span>
                </h3>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Action Required
                </span>
              </div>
              {matchResult.score_details.missing_skills.length === 0 ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Zero skill gaps detected for this role!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchResult.score_details.missing_skills.map((s: string) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold"
                    >
                      <span>✗</span>
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Personalized Learning Roadmap (Section 19) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Targeted Upskilling</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">4-Week Personalized Learning Roadmap</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Milestone Driven</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {matchResult.roadmap.map((week: RoadmapWeek) => (
                <div
                  key={week.week}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Week {week.week}</span>
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{week.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">{week.milestone}</p>
                    <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2">
                      {week.topics.slice(0, 3).map((topic, i) => (
                        <li key={i} className="truncate">&bull; {topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Improvement Suggestions (Section 20) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-base">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Improve My Resume (Actionable Recommendations)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Guidance tailored to your target job profile. Important: never invent achievements or fabricate certifications you do not possess.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {matchResult.resume_suggestions.map((sug: string, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm leading-none mt-0.5">&bull;</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
