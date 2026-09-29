import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  HelpCircle, 
  Target, 
  TrendingUp, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Users,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  setUserMode: (mode: 'recruiter' | 'candidate') => void;
  onLoadDemo: () => Promise<void>;
  isDemoLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  setUserMode,
  onLoadDemo,
  isDemoLoading
}) => {
  const features = [
    {
      icon: Cpu,
      title: '1. Semantic Matching',
      description: 'Sentence transformer embeddings map candidate achievements to job requirements beyond brittle exact keyword matching.'
    },
    {
      icon: HelpCircle,
      title: '2. Explainable AI',
      description: 'Every score is decomposed into explicit contributions: 60% Skills, 25% Experience, and 15% Education. Zero black-box ranking.'
    },
    {
      icon: ShieldCheck,
      title: '3. Identity Masking',
      description: 'Candidate names, gender markers, photos, addresses, and contact info are stripped before the scoring pipeline receives data.'
    },
    {
      icon: Target,
      title: '4. Skill Gap Detection',
      description: 'Immediate side-by-side identification of verified competencies vs critical missing qualifications for targeted evaluation.'
    },
    {
      icon: TrendingUp,
      title: '5. Learning Roadmaps',
      description: 'Automated 4-week step-by-step curriculum with recommended topics and milestones tailored to close missing skill gaps.'
    },
    {
      icon: Scale,
      title: '6. Fairness Testing',
      description: 'Built-in controlled benchmark verifying that identical qualification profiles receive identical match scores regardless of identity.'
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Responsible AI Recruitment Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          <span className="block">RESUME-TO-JOB</span>
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
            MATCHER
          </span>
        </h1>

        <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-300 mb-4">
          &ldquo;Match Skills. Explain Gaps. Reduce Identity Bias.&rdquo;
        </p>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered, explainable and identity-aware candidate matching. Built for college placement cells, hiring managers, and career seekers who demand transparency over opaque algorithms.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-indigo transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setUserMode('recruiter');
              onNavigate('dashboard');
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Recruiter Dashboard</span>
          </button>

          <button
            onClick={() => {
              setUserMode('candidate');
              onNavigate('candidate-match');
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-sm dark:shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Check My Resume</span>
          </button>

          <button
            onClick={onLoadDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-glow-emerald transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isDemoLoading ? 'Seeding Data...' : 'Quick Demo Mode (One-Click)'}</span>
          </button>
        </div>

        {/* Responsible AI Notice Callout */}
        <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span>
            Candidate matching is based on job-relevant information. Selected identity attributes are masked before scoring.
          </span>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Core Technological Innovations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Engineered to replace opaque keyword screening with verified, explainable semantic reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparent Formula Explainer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-200 dark:border-indigo-900/30 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Deterministic Mathematical Weighting</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-4">
              Standardized Explainable Scoring Formula
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
              Unlike black-box models, every candidate score is mathematically provable and auditable down to individual component contributions:
            </p>

            <div className="bg-slate-100 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-800 dark:text-slate-200 mb-6 flex flex-col md:flex-row items-center justify-around gap-4 text-center">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-500/20 w-full">
                <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-sans font-semibold">Skill Score (60%)</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Skill × 0.60</span>
              </div>
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500">+</span>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-500/20 w-full">
                <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-sans font-semibold">Experience Score (25%)</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Exp × 0.25</span>
              </div>
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500">+</span>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-500/20 w-full">
                <span className="text-xs text-indigo-700 dark:text-indigo-400 block font-sans font-semibold">Education Score (15%)</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Edu × 0.15</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                <span>Excludes candidate names, genders, photos, emails, and phone numbers.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                <span>Generates automatic confidence rating based on data completeness.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
