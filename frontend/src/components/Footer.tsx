import React from 'react';
import { ShieldCheck, Scale, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/90 text-slate-500 dark:text-slate-400 text-xs py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Resume-to-Job Matcher</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              AI-powered, explainable, and identity-aware candidate matching engineered for placement cells, university recruitment, and progressive hiring teams.
            </p>
          </div>

          {/* Core Responsible AI Principles */}
          <div className="border-l border-slate-200 dark:border-slate-800/80 pl-4 md:pl-6">
            <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-300 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Responsible-AI Framework</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              Selected identity attributes (name, gender, contact info, photo, demographic flags) are excluded from the ranking pipeline. Candidate matching is computed solely on verifiable qualification signals.
            </p>
          </div>

          {/* Transparency & Disclaimer */}
          <div className="border-l border-slate-200 dark:border-slate-800/80 pl-4 md:pl-6">
            <div className="flex items-center gap-2 mb-2 text-emerald-900 dark:text-emerald-300 font-semibold text-sm">
              <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Audit & Controlled Testing</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              Controlled fairness tests check whether changing selected identity attributes changes the matching result. This system supports human decision-makers and does not guarantee employment.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            &copy; 2026 Resume-to-Job Matcher. Built for ethical, transparent, and skill-first talent evaluation.
          </div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI Engine Online
            </span>
            <span>&bull;</span>
            <span>Weights: 60% Skills / 25% Exp / 15% Edu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
