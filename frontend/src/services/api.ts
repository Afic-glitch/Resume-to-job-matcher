import {
  Job,
  MatchResult,
  ScoreDetails,
  DashboardStats,
  FairnessResult,
  AuditLog,
  RoadmapWeek,
  SkillItem,
  AuthUser,
  DemoAccount
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `API error: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Health & Stats
  async checkHealth(): Promise<{ status: string; service: string; model: string }> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    return handleResponse(res);
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE_URL}/api/jobs`);
    return handleResponse(res);
  },

  async getJob(id: number): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`);
    return handleResponse(res);
  },

  async createJob(payload: {
    title: string;
    company?: string;
    description: string;
    required_skills?: string[];
    preferred_skills?: string[];
    experience_required?: string;
    education_required?: string;
  }): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async parseJobDescription(description: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    return handleResponse(res);
  },

  async uploadJobFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/jobs/upload-file`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Candidates & Matching
  async getCandidatesForJob(jobId: number): Promise<MatchResult[]> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/candidates`);
    return handleResponse(res);
  },

  async getCandidateDetails(candidateId: number, jobId?: number): Promise<{
    candidate: any;
    job: Job;
    score_details: ScoreDetails;
    roadmap: RoadmapWeek[];
    resume_suggestions: string[];
    audit_logs: AuditLog[];
  }> {
    const url = jobId
      ? `${API_BASE_URL}/api/candidates/${candidateId}?job_id=${jobId}`
      : `${API_BASE_URL}/api/candidates/${candidateId}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async uploadResumes(jobId: number, files: File[]): Promise<{
    processed_count: number;
    error_count: number;
    results: any[];
    errors: any[];
  }> {
    const formData = new FormData();
    formData.append('job_id', jobId.toString());
    for (const file of files) {
      formData.append('files', file);
    }
    const res = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async matchAdHoc(payload: {
    job_id?: number;
    job_description?: string;
    resume_text: string;
    candidate_code?: string;
  }): Promise<{
    job: Job;
    candidate_code: string;
    score_details: ScoreDetails;
    roadmap: RoadmapWeek[];
    resume_suggestions: string[];
    responsible_ai_notice: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Fairness
  async runFairnessTest(customData?: any): Promise<FairnessResult> {
    const res = await fetch(`${API_BASE_URL}/api/fairness-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customData || {}),
    });
    return handleResponse(res);
  },

  // Audit Logs
  async getAuditLogs(candidateId?: number, jobId?: number): Promise<AuditLog[]> {
    let url = `${API_BASE_URL}/api/audit`;
    const params = new URLSearchParams();
    if (candidateId) params.append('candidate_id', candidateId.toString());
    if (jobId) params.append('job_id', jobId.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    return handleResponse(res);
  },

  // Demo Data Seeder
  async seedDemoData(): Promise<{ status: string; message: string; job_id: number; candidates_count: number }> {
    const res = await fetch(`${API_BASE_URL}/api/demo-data`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Skills
  async getSkills(): Promise<SkillItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/skills`);
    return handleResponse(res);
  },

  // Authentication
  async login(payload: { email: string; password: string }): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role?: 'recruiter' | 'candidate' | 'admin';
    organization?: string;
  }): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getDemoUsers(): Promise<DemoAccount[]> {
    const res = await fetch(`${API_BASE_URL}/api/auth/demo-users`);
    return handleResponse(res);
  },

  async getMe(userId?: number): Promise<AuthUser> {
    const url = userId ? `${API_BASE_URL}/api/auth/me?user_id=${userId}` : `${API_BASE_URL}/api/auth/me`;
    const res = await fetch(url);
    return handleResponse(res);
  },
};
