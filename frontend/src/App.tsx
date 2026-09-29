import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { JobCreationPage } from './pages/JobCreationPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { CandidateRankingPage } from './pages/CandidateRankingPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { CandidateComparisonPage } from './pages/CandidateComparisonPage';
import { CandidateModePage } from './pages/CandidateModePage';
import { FairnessPage } from './pages/FairnessPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Job, MatchResult, DashboardStats } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userMode, setUserMode] = useState<'recruiter' | 'candidate'>('recruiter');

  // Auto-sync mode when user logs in
  useEffect(() => {
    if (user) {
      if (user.role === 'candidate') {
        setUserMode('candidate');
      } else {
        setUserMode('recruiter');
      }
    }
  }, [user]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<MatchResult[]>([]);
  const [selectedCandidateData, setSelectedCandidateData] = useState<any | null>(null);
  const [compareCandidates, setCompareCandidates] = useState<MatchResult[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    total_jobs: 0,
    total_candidates: 0,
    average_match_score: 0,
    skill_gaps_detected: 0
  });

  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshData = useCallback(async () => {
    try {
      const [fetchedJobs, fetchedStats] = await Promise.all([
        api.getJobs(),
        api.getStats()
      ]);
      setJobs(fetchedJobs);
      setStats(fetchedStats);

      if (fetchedJobs.length > 0) {
        setSelectedJobId(prev => prev ?? fetchedJobs[0].id);
      }
    } catch {
      console.warn('Backend not fully connected yet or starting up.');
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Whenever selectedJobId changes, load candidates for that job
  useEffect(() => {
    if (selectedJobId) {
      api.getCandidatesForJob(selectedJobId)
        .then(res => setCandidates(res))
        .catch(() => setCandidates([]));
    }
  }, [selectedJobId]);

  // Load Demo Data Action
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await api.seedDemoData();
      await refreshData();
      if (res.job_id) {
        setSelectedJobId(res.job_id);
        const cands = await api.getCandidatesForJob(res.job_id);
        setCandidates(cands);
      }
      showToast('Demo data seeded! 1 job and 5 realistic candidates loaded.');
      if (currentTab === 'home') {
        setCurrentTab('dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load demo data', 'error');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // View Candidate Details Action
  const handleSelectCandidate = async (candidateId: number) => {
    try {
      const data = await api.getCandidateDetails(candidateId, selectedJobId || undefined);
      setSelectedCandidateData(data);
      setCurrentTab('candidate-detail');
    } catch {
      showToast('Failed to load candidate details', 'error');
    }
  };

  // Compare Selected Action
  const handleCompareCandidates = (candidateIds: number[]) => {
    const selected = candidates.filter(c => candidateIds.includes(c.candidate_id));
    setCompareCandidates(selected);
  };

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl text-xs font-semibold text-slate-900 dark:text-white animate-bounce">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userMode={userMode}
        setUserMode={setUserMode}
        onLoadDemo={handleLoadDemo}
        isDemoLoading={isDemoLoading}
        activeJobTitle={activeJob?.title}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-6">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={setCurrentTab}
            setUserMode={setUserMode}
            onLoadDemo={handleLoadDemo}
            isDemoLoading={isDemoLoading}
          />
        )}

        {currentTab === 'dashboard' && (
          <RecruiterDashboard
            stats={stats}
            jobs={jobs}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
            isDemoLoading={isDemoLoading}
          />
        )}

        {currentTab === 'jobs' && (
          <RecruiterDashboard
            stats={stats}
            jobs={jobs}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            onNavigate={setCurrentTab}
            onLoadDemo={handleLoadDemo}
            isDemoLoading={isDemoLoading}
          />
        )}

        {currentTab === 'job-create' && (
          <JobCreationPage
            onJobCreated={(newJob) => {
              setJobs([newJob, ...jobs]);
              setSelectedJobId(newJob.id);
              showToast(`Created job: ${newJob.title}`);
              refreshData();
            }}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'upload' && (
          <ResumeUploadPage
            jobs={jobs}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            onNavigate={setCurrentTab}
            onUploadSuccess={() => {
              refreshData();
              if (selectedJobId) {
                api.getCandidatesForJob(selectedJobId).then(setCandidates);
              }
            }}
          />
        )}

        {currentTab === 'ranking' && (
          <CandidateRankingPage
            candidates={candidates}
            jobs={jobs}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            onSelectCandidate={handleSelectCandidate}
            onCompareCandidates={handleCompareCandidates}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'candidate-detail' && (
          <CandidateDetailPage
            candidateData={selectedCandidateData}
            onBack={() => setCurrentTab('ranking')}
          />
        )}

        {currentTab === 'comparison' && (
          <CandidateComparisonPage
            candidates={compareCandidates}
            job={activeJob}
            onBack={() => setCurrentTab('ranking')}
            onViewCandidate={handleSelectCandidate}
          />
        )}

        {currentTab === 'candidate-match' && (
          <CandidateModePage jobs={jobs} />
        )}

        {currentTab === 'fairness' && (
          <FairnessPage />
        )}

        {currentTab === 'audit' && (
          <AuditLogPage />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onNavigate={setCurrentTab}
            setUserMode={setUserMode}
          />
        )}
      </main>

      {/* Footer with notices */}
      <Footer />
    </div>
  );
}

export default App;
