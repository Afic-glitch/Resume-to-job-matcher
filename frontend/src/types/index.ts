export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_required: string;
  education_required: string;
  quality_warnings?: string[];
  created_at?: string;
}

export interface Candidate {
  id: number;
  candidate_code: string;
  original_text?: string;
  masked_text: string;
  skills: string[];
  experience: number;
  experience_raw: string;
  education: string;
  projects: string[];
  certifications: string[];
  created_at?: string;
}

export interface ScoreWeights {
  skill: number;
  experience: number;
  education: number;
}

export interface ScoreDetails {
  final_score: number;
  final_score_exact: number;
  skill_score: number;
  skill_contribution: number;
  skill_max: number;
  experience_score: number;
  experience_contribution: number;
  experience_max: number;
  experience_rationale: string;
  education_score: number;
  education_contribution: number;
  education_max: number;
  education_rationale: string;
  matched_skills: string[];
  missing_skills: string[];
  confidence: 'High' | 'Medium' | 'Low';
  confidence_reason: string;
  explanation_summary: string;
  scoring_formula: string;
  weights: ScoreWeights;
}

export interface MatchResult {
  id?: number;
  job_id: number;
  candidate_id: number;
  candidate_code: string;
  skill_score: number;
  experience_score: number;
  education_score: number;
  final_score: number;
  matched_skills: string[];
  missing_skills: string[];
  confidence: 'High' | 'Medium' | 'Low';
  confidence_reason: string;
  explanation_summary: string;
  skills: string[];
  experience: number;
  experience_raw: string;
  education: string;
  projects?: string[];
  certifications?: string[];
  created_at?: string;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  focus: string;
  milestone: string;
  topics: string[];
}

export interface AuditLog {
  id: number;
  candidate_id: number;
  candidate_code: string;
  job_id: number;
  job_title: string;
  model_name: string;
  weights: ScoreWeights;
  information_used: string[];
  information_excluded: string[];
  final_score: number;
  timestamp: string;
}

export interface DashboardStats {
  total_jobs: number;
  total_candidates: number;
  average_match_score: number;
  skill_gaps_detected: number;
}

export interface FairnessCandidate {
  name: string;
  gender: string;
  code: string;
  masked_text: string;
  excluded_attributes: string[];
  score_details: ScoreDetails;
}

export interface FairnessResult {
  job: Partial<Job>;
  candidate_a: FairnessCandidate;
  candidate_b: FairnessCandidate;
  score_a: number;
  score_b: number;
  score_difference: number;
  is_fair: boolean;
  excluded_checks: Array<{ attribute: string; status: string; verified: boolean }>;
  explanation: string;
  responsible_ai_disclaimer: string;
}

export interface SkillItem {
  name: string;
  category: string;
  aliases: string[];
  learning_suggestions: string[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'recruiter' | 'candidate' | 'admin';
  organization?: string;
  avatar_url?: string;
  token?: string;
  created_at?: string;
}

export interface DemoAccount {
  name: string;
  title: string;
  email: string;
  password: string;
  role: 'recruiter' | 'candidate' | 'admin';
  organization: string;
  badge: string;
  description: string;
}

