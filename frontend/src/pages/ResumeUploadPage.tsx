import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Trash2, 
  ArrowRight, 
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';

interface ResumeUploadPageProps {
  jobs: Job[];
  selectedJobId: number | null;
  setSelectedJobId: (id: number) => void;
  onNavigate: (tab: string) => void;
  onUploadSuccess: () => void;
}

const PIPELINE_STAGES = [
  'Parsing documents',
  'Masking identity attributes',
  'Extracting skills & experience',
  'Generating semantic embeddings',
  'Calculating explainable match scores',
  'Analysis complete'
];

export const ResumeUploadPage: React.FC<ResumeUploadPageProps> = ({
  jobs,
  selectedJobId,
  setSelectedJobId,
  onNavigate,
  onUploadSuccess
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(f => {
      const ext = f.name.toLowerCase();
      return ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.txt');
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedJob) {
      setErrorMessage('Please select a target job first.');
      return;
    }
    if (files.length === 0) {
      setErrorMessage('Please select at least one resume file to upload.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStageIdx(0);

    // Simulate animated pipeline progress through the 6 stages while network request runs
    const interval = setInterval(() => {
      setCurrentStageIdx(prev => (prev < 4 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await api.uploadResumes(selectedJob.id, files);
      clearInterval(interval);
      setCurrentStageIdx(5); // Complete
      setUploadResult(res);
      onUploadSuccess();
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'Unable to process resumes. Please verify that the files are valid PDF or DOCX.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Candidate Ingestion</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Candidate Resumes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Supported formats: PDF, DOCX. Multi-file upload supported.</p>
        </div>

        {/* Target Job Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Target Job:</label>
          <select
            value={selectedJobId || (jobs[0]?.id || '')}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsible AI Notice Card */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white">Automatic Identity Masking Enabled:</strong> Before embeddings or match calculations begin, names, gender pronouns, contact details, photos, and personal addresses are scrubbed from each resume. The evaluator sees only anonymized IDs (e.g., <code className="text-indigo-600 dark:text-indigo-300 font-mono">CAND-014</code>).
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white/70 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
        }`}
      >
        <UploadCloud className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Drag & drop resumes here, or click to browse
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          PDF and DOCX files up to 15MB each
        </p>
        <label className="inline-block px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer transition-all shadow-sm">
          <span>Choose Files</span>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* File Cards List */}
      {files.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">
            <span>Selected Files ({files.length})</span>
            <button
              onClick={() => setFiles([])}
              className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs flex items-center gap-1 font-normal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready</span>
                  </span>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Stage Tracker (Section 9) */}
      {isProcessing && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 space-y-4 shadow-glow-indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Analysis Pipeline Running</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Stage {currentStageIdx + 1} of 6
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${((currentStageIdx + 1) / 6) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                    isPast
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/60 text-indigo-900 dark:text-white font-semibold animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                  )}
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification */}
      {uploadResult && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Analysis Complete! Processed {uploadResult.processed_count} candidate(s).</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Selected identity attributes have been masked and explainable match scores calculated against{' '}
            <strong className="text-slate-900 dark:text-white">{selectedJob?.title}</strong>.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => onNavigate('ranking')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-all"
            >
              <span>View Candidate Rankings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {!uploadResult && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isProcessing || files.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            <span>{isProcessing ? 'Analyzing Candidates...' : 'Analyze Candidates'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
