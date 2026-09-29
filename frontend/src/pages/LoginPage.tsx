import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Scale, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
  setUserMode: (mode: 'recruiter' | 'candidate') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, setUserMode }) => {
  const { login, register, loginAsDemo, demoAccounts, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<'recruiter' | 'candidate' | 'admin'>('recruiter');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('recruiter@resumematch.ai');
  const [password, setPassword] = useState<string>('recruiter123');
  const [organization, setOrganization] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  const handleRoleSelect = (role: 'recruiter' | 'candidate' | 'admin') => {
    setSelectedRole(role);
    setErrorMsg(null);
    const demo = demoAccounts.find(d => d.role === role);
    if (demo && mode === 'signin') {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const handleQuickDemoLogin = async (role: 'recruiter' | 'candidate' | 'admin') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const user = await loginAsDemo(role);
      setSuccessMsg(`Welcome, ${user.name}! Redirecting...`);
      setTimeout(() => {
        if (user.role === 'recruiter') {
          setUserMode('recruiter');
          onNavigate('dashboard');
        } else if (user.role === 'candidate') {
          setUserMode('candidate');
          onNavigate('candidate-match');
        } else {
          setUserMode('recruiter');
          onNavigate('fairness');
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      if (mode === 'signin') {
        const user = await login(email, password);
        setSuccessMsg(`Welcome back, ${user.name}! Redirecting...`);
        setTimeout(() => {
          if (user.role === 'candidate') {
            setUserMode('candidate');
            onNavigate('candidate-match');
          } else {
            setUserMode('recruiter');
            onNavigate('dashboard');
          }
        }, 700);
      } else {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          return;
        }
        const user = await register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role: selectedRole,
          organization: organization.trim()
        });
        setSuccessMsg(`Account created for ${user.name}! Directing to your workspace...`);
        setTimeout(() => {
          if (user.role === 'candidate') {
            setUserMode('candidate');
            onNavigate('candidate-match');
          } else {
            setUserMode('recruiter');
            onNavigate('dashboard');
          }
        }, 700);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-emerald-500/15 to-purple-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-gradient-to-tl from-indigo-500/15 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Top Breadcrumb / Return Button */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => {
            setUserMode('recruiter');
            onNavigate('dashboard');
          }}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Continue as Guest &rarr;
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Value Prop & One-Click Demo Access */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Brand Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-glass">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Responsible AI System</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Sign In to <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
                RESUME-TO-JOB
              </span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Match skills, detect qualification gaps, and ensure algorithmic fairness with our identity-masked semantic engine.
            </p>

            {/* AI Trust Pillars */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Zero Demographic Bias:</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">Name, gender & contact info stripped before scoring.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <Scale className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Explainable Decomposition:</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">Transparent 60/25/15 scoring with verified evidence.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Access Widget */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-glass">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Instant Demo Accounts
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                1-Click Login
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
              Explore immediate role-based workflows without registration:
            </p>

            <div className="space-y-2.5">
              {demoAccounts.map(demo => {
                const isSelected = selectedRole === demo.role;
                const Icon = demo.role === 'recruiter' ? Briefcase : demo.role === 'candidate' ? UserCheck : Scale;
                const accentColor = demo.role === 'recruiter' 
                  ? 'border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                  : demo.role === 'candidate'
                  ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300';

                return (
                  <div
                    key={demo.role}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs ${
                      isSelected
                        ? `${accentColor} shadow-sm ring-1 ring-indigo-500/30`
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                          <span>{demo.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {demo.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {demo.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickDemoLogin(demo.role)}
                      className="ml-2 flex-shrink-0 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      Login
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Main Auth Form Card */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role Selector Header */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Your Role / Purpose:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('recruiter')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'recruiter'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mb-1" />
                  <span className="text-xs">Recruiter</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('candidate')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'candidate'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mb-1" />
                  <span className="text-xs">Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'admin'
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Scale className="w-4 h-4 mb-1" />
                  <span className="text-xs">Auditor</span>
                </button>
              </div>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Organization / University (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder={selectedRole === 'recruiter' ? 'e.g. Apex Global' : 'e.g. MIT / Self-Employed'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Keep me signed in</span>
                </label>

                <span className="text-[11px] text-slate-400">
                  Protected with SHA-256
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-glow-indigo transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : mode === 'signin' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer switcher */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Sign up now
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Sign in to your account
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Demo Password Notice</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In this environment, demo accounts have pre-configured passwords:
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl text-[11px] font-mono space-y-1 text-slate-700 dark:text-slate-300">
              <div>Recruiter: recruiter123</div>
              <div>Candidate: candidate123</div>
              <div>Auditor: auditor123</div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
