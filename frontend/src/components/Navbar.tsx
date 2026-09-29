import React, { useState } from 'react';
import { 
  Briefcase, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Layers, 
  BarChart3, 
  Scale, 
  Sparkles,
  Database,
  Sun,
  Moon,
  LogIn,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userMode: 'recruiter' | 'candidate';
  setUserMode: (mode: 'recruiter' | 'candidate') => void;
  onLoadDemo: () => Promise<void>;
  isDemoLoading: boolean;
  activeJobTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userMode,
  setUserMode,
  onLoadDemo,
  isDemoLoading,
  activeJobTitle
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const recruiterLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'upload', label: 'Upload Resumes', icon: FileText },
    { id: 'ranking', label: 'Candidates', icon: UserCheck },
    { id: 'comparison', label: 'Comparison', icon: Layers },
    { id: 'fairness', label: 'Fairness Check', icon: Scale },
    { id: 'audit', label: 'Audit Log', icon: ShieldCheck },
  ];

  const candidateLinks = [
    { id: 'candidate-match', label: 'My Match', icon: Sparkles },
    { id: 'fairness', label: 'Fairness Transparency', icon: Scale },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  ];

  const links = userMode === 'recruiter' ? recruiterLinks : candidateLinks;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors duration-200">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-100 to-indigo-50 dark:from-indigo-950/80 dark:via-slate-900 dark:to-indigo-950/80 border-b border-indigo-100 dark:border-indigo-900/40 px-4 py-1.5 text-center text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>
          <strong>Responsible AI Active:</strong> Selected identity attributes (name, gender, contact, photo) are masked before scoring.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-glow-indigo group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">RESUME-TO-JOB</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300/40 dark:border-indigo-500/30">
                  AI MATCHER
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Match Skills. Explain Gaps. Reduce Identity Bias.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Mode Switcher & Demo Data & Theme Toggle */}
          <div className="flex items-center gap-2.5">
            {userMode === 'recruiter' && activeJobTitle && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                <span className="truncate max-w-[150px]">{activeJobTitle}</span>
              </span>
            )}

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setUserMode('recruiter');
                  if (currentTab === 'candidate-match') setCurrentTab('dashboard');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  userMode === 'recruiter'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Recruiter
              </button>
              <button
                onClick={() => {
                  setUserMode('candidate');
                  setCurrentTab('candidate-match');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  userMode === 'candidate'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Candidate
              </button>
            </div>

            {/* Load Demo Data Button */}
            <button
              onClick={onLoadDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow-emerald transition-all disabled:opacity-50 active:scale-95"
              title="Instantly loads sample job and 5 realistic candidates for hackathon demo"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isDemoLoading ? 'Loading...' : 'Load Demo'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm flex items-center justify-center group"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle light/dark theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Auth Profile / Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs transition-all shadow-sm"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shadow-sm ${
                    user.role === 'recruiter' 
                      ? 'bg-indigo-600' 
                      : user.role === 'candidate' 
                      ? 'bg-emerald-600' 
                      : 'bg-purple-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize leading-tight">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 py-2 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-200/80 dark:border-slate-800/80">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      {user.organization && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{user.organization}</div>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setCurrentTab('login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Switch Account / Re-login</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                          setCurrentTab('home');
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
