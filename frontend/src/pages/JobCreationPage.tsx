import React, { useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  X, 
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';

interface JobCreationPageProps {
  onJobCreated: (job: Job) => void;
  onNavigate: (tab: string) => void;
}

export const JobCreationPage: React.FC<JobCreationPageProps> = ({
  onJobCreated,
  onNavigate
}) => {
  const [title, setTitle] = useState('Python Backend Developer');
  const [company, setCompany] = useState('Nexora AI Solutions');
  const [description, setDescription] = useState(
`We are seeking a Python Backend Developer with 1-2 years of experience to build high-performance REST APIs and microservices.

Key Responsibilities:
- Design robust backend architectures using Python, FastAPI, and PostgreSQL.
- Maintain source code with Git and establish automated CI/CD pipelines.
- Containerize application services using Docker and orchestrate workloads.
- Integrate cloud infrastructure on AWS (EC2, S3, RDS).

Requirements:
- Strong proficiency in Python, SQL, REST API, Git, Docker, and AWS.
- 1-2 years of relevant software engineering experience.
- B.Tech/B.E. in Computer Science, Information Technology, or related field.
- Good communication skills to collaborate with cross-functional teams.
- Knowledge of Kubernetes and Azure is a plus.`
  );

  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'Python', 'SQL', 'REST API', 'Git', 'Docker', 'AWS'
  ]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    'Kubernetes', 'Azure'
  ]);
  const [experienceRequired, setExperienceRequired] = useState('1-2 years');
  const [educationRequired, setEducationRequired] = useState('B.Tech/B.E. Computer Science or related');
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([
    'Communication skills mentioned without objective evaluation criteria.'
  ]);

  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auto-parse description with backend NLP parser
  const handleAutoParse = async () => {
    if (!description.trim()) return;
    setIsParsing(true);
    setUploadError(null);
    try {
      const parsed = await api.parseJobDescription(description);
      if (parsed.required_skills?.length) setRequiredSkills(parsed.required_skills);
      if (parsed.preferred_skills?.length) setPreferredSkills(parsed.preferred_skills);
      if (parsed.experience_required) setExperienceRequired(parsed.experience_required);
      if (parsed.education_required) setEducationRequired(parsed.education_required);
      if (parsed.quality_warnings) setQualityWarnings(parsed.quality_warnings);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse job description');
    } finally {
      setIsParsing(false);
    }
  };

  // Upload JD file (PDF / DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setUploadError(null);
    try {
      const res = await api.uploadJobFile(file);
      setDescription(res.raw_text);
      if (res.parsed) {
        if (res.parsed.required_skills?.length) setRequiredSkills(res.parsed.required_skills);
        if (res.parsed.preferred_skills?.length) setPreferredSkills(res.parsed.preferred_skills);
        if (res.parsed.experience_required) setExperienceRequired(res.parsed.experience_required);
        if (res.parsed.education_required) setEducationRequired(res.parsed.education_required);
        if (res.parsed.quality_warnings) setQualityWarnings(res.parsed.quality_warnings);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to extract text from document');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddReqSkill = () => {
    if (newReqSkill.trim() && !requiredSkills.includes(newReqSkill.trim())) {
      setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
      setNewReqSkill('');
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = () => {
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || requiredSkills.length === 0) {
      setUploadError('Please fill in title, description, and at least one required skill.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    try {
      const created = await api.createJob({
        title,
        company,
        description,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        experience_required: experienceRequired,
        education_required: educationRequired
      });
      onJobCreated(created);
      onNavigate('upload');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to save job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Job Setup</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Job Posting</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Define job requirements for automated skill matching and gap detection.</p>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Python Backend Developer"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company / Organization</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Nexora AI Solutions"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Job Description Textarea & File Upload */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Job Description (Paste or Upload PDF/DOCX)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 shadow-sm transition-all">
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Upload PDF / DOCX</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleAutoParse}
                disabled={isParsing || !description.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsing ? 'Analyzing...' : 'Auto-Extract Requirements'}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Paste complete job description here..."
            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Quality Analysis Flags (Section 25) */}
        {qualityWarnings.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Job Description Analysis: Quality Flags</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
              {qualityWarnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracted & Editable Requirements Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Skills */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Required Skills (60% Weighting)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReqSkill}
                onChange={(e) => setNewReqSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddReqSkill(); } }}
                placeholder="Add skill (e.g. Python)"
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[50px]">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReqSkill(skill)}
                    className="hover:text-indigo-900 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Preferred Skills (Optional Bonus)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrefSkill}
                onChange={(e) => setNewPrefSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrefSkill(); } }}
                placeholder="Add preferred skill (e.g. Kubernetes)"
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                type="button"
                onClick={handleAddPrefSkill}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[50px]">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrefSkill(skill)}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Experience Requirement (25% Weighting)
            </label>
            <input
              type="text"
              value={experienceRequired}
              onChange={(e) => setExperienceRequired(e.target.value)}
              placeholder="e.g. 1-2 years"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Education Requirement (15% Weighting)
            </label>
            <input
              type="text"
              value={educationRequired}
              onChange={(e) => setEducationRequired(e.target.value)}
              placeholder="e.g. B.Tech Computer Science or related"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Job...' : 'Save Job & Proceed to Upload'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
