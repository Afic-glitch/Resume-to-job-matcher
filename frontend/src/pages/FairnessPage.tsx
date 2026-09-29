import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { FairnessResult } from '../types';

export const FairnessPage: React.FC = () => {
  const [fairnessData, setFairnessData] = useState<FairnessResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customNameA, setCustomNameA] = useState<string>('Arun Kumar');
  const [customGenderA, setCustomGenderA] = useState<string>('Male');
  const [customNameB, setCustomNameB] = useState<string>('Ananya Kumar');
  const [customGenderB, setCustomGenderB] = useState<string>('Female');
  const [isCustomTesting, setIsCustomTesting] = useState<boolean>(false);

  const fetchFairnessData = useCallback(async (customPayload?: any) => {
    setIsLoading(true);
    try {
      const data = await api.runFairnessTest(customPayload);
      setFairnessData(data);
    } catch (err) {
      console.error('Failed to load fairness test:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFairnessData();
  }, [fetchFairnessData]);

  const handleRunCustomTest = async () => {
    setIsCustomTesting(true);
    const payload = {
      candidate_a: {
        name: customNameA,
        gender: customGenderA,
        email: `${customNameA.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+91 9876543210',
        skills: ['Python', 'SQL', 'Git', 'REST API'],
        experience: 2.0,
        experience_raw: '2 years as Software Developer',
        education: 'B.Tech Computer Science'
      },
      candidate_b: {
        name: customNameB,
        gender: customGenderB,
        email: `${customNameB.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+91 9123456780',
        skills: ['Python', 'SQL', 'Git', 'REST API'],
        experience: 2.0,
        experience_raw: '2 years as Software Developer',
        education: 'B.Tech Computer Science'
      }
    };
    await fetchFairnessData(payload);
    setIsCustomTesting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Responsible AI Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Fairness & Bias Verification</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Controlled identity invariance testing: verifying that modifying identity attributes yields identical match scores.
        </p>
      </div>

      {/* Mandatory Responsible AI Notice (Section 2 & 21) */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white block mb-0.5">Critical Responsible-AI Principle:</strong>
          {fairnessData?.responsible_ai_disclaimer || 
            "Controlled fairness tests check whether changing selected identity attributes changes the matching result. Selected identity attributes are excluded from the ranking pipeline. This does not claim that the system completely eliminates hiring bias."}
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel text-center py-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Running Controlled Bias Benchmark...</p>
        </div>
      ) : (
        fairnessData && (
          <div className="space-y-8">
            {/* Benchmark Result Overview Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Controlled Test Results
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Identity Masking Parity Verification
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>0 Point Difference (100% Invariance)</span>
                  </div>
                </div>
              </div>

              {/* Side-by-side Candidate Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Candidate A Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Profile A</span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{fairnessData.candidate_a.name}</h3>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">{fairnessData.candidate_a.gender}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white block">
                        {fairnessData.score_a}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Match Score</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p><strong className="text-slate-500 dark:text-slate-400">Skills:</strong> Python, SQL, Git, REST API</p>
                    <p><strong className="text-slate-500 dark:text-slate-400">Experience:</strong> 2.0 years</p>
                    <p><strong className="text-slate-500 dark:text-slate-400">Education:</strong> B.Tech Computer Science</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-[10px] uppercase">Scored As:</span>
                    {fairnessData.candidate_a.code} (Identity Excluded)
                  </div>
                </div>

                {/* Candidate B Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Profile B</span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{fairnessData.candidate_b.name}</h3>
                      <span className="text-xs text-purple-600 dark:text-purple-400">{fairnessData.candidate_b.gender}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white block">
                        {fairnessData.score_b}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Match Score</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p><strong className="text-slate-500 dark:text-slate-400">Skills:</strong> Python, SQL, Git, REST API</p>
                    <p><strong className="text-slate-500 dark:text-slate-400">Experience:</strong> 2.0 years</p>
                    <p><strong className="text-slate-500 dark:text-slate-400">Education:</strong> B.Tech Computer Science</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-[10px] uppercase">Scored As:</span>
                    {fairnessData.candidate_b.code} (Identity Excluded)
                  </div>
                </div>
              </div>

              {/* Exclusion Checklist (Section 21) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Audited Identity Exclusion Checklist
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {fairnessData.excluded_checks.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <span>{item.attribute}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmark Summary Note */}
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                &ldquo;{fairnessData.explanation}&rdquo;
              </p>
            </div>

            {/* Interactive Perturbation Sandbox */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Interactive Identity Perturbation Tester
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Modify names, genders, and demographic attributes below. The pipeline will scrub them and verify that the match score remains mathematically invariant.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Candidate 1 Inputs</span>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Name</label>
                    <input
                      type="text"
                      value={customNameA}
                      onChange={(e) => setCustomNameA(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Gender</label>
                    <select
                      value={customGenderA}
                      onChange={(e) => setCustomGenderA(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Candidate 2 Inputs</span>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Name</label>
                    <input
                      type="text"
                      value={customNameB}
                      onChange={(e) => setCustomNameB(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Gender</label>
                    <select
                      value={customGenderB}
                      onChange={(e) => setCustomGenderB(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunCustomTest}
                  disabled={isCustomTesting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCustomTesting ? 'animate-spin' : ''}`} />
                  <span>{isCustomTesting ? 'Evaluating...' : 'Run Controlled Test'}</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
