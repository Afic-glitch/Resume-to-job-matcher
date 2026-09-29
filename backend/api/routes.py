import secrets
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from backend.services.matcher_service import MatcherService
from backend.services.fairness_service import FairnessService
from backend.database.db import (
    get_all_jobs, get_job, get_matches_for_job, get_audit_logs, get_stats,
    create_user, get_user_by_email, get_user_by_id, get_all_users, hash_password, verify_password
)
from backend.skills.extractor import SkillExtractor
from backend.parser.document_parser import extract_text

router = APIRouter(prefix="/api")

matcher_service = MatcherService()
fairness_service = FairnessService()
skill_extractor = SkillExtractor()

# Auth Request Models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "candidate"
    organization: Optional[str] = ""

# Pydantic Request Models
class JobCreateRequest(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Python Backend Developer"})
    company: Optional[str] = Field("TechCorp Inc.", json_schema_extra={"example": "TechCorp Inc."})
    description: str = Field(..., json_schema_extra={"example": "Looking for a Python Backend Developer with FastAPI, SQL, Docker..."})
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    experience_required: Optional[str] = None
    education_required: Optional[str] = None

class JobParseRequest(BaseModel):
    description: str

class MatchRequest(BaseModel):
    job_id: Optional[int] = None
    job_description: Optional[str] = None
    resume_text: str
    candidate_code: Optional[str] = None

class CustomCandidateInput(BaseModel):
    name: str
    gender: str
    email: Optional[str] = "candidate@example.com"
    phone: Optional[str] = "+91 9876543210"
    skills: List[str]
    experience: float
    experience_raw: str
    education: str
    projects: Optional[List[str]] = []

class CustomFairnessRequest(BaseModel):
    candidate_a: Optional[CustomCandidateInput] = None
    candidate_b: Optional[CustomCandidateInput] = None

# Health & Stats
@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Resume-to-Job Matcher API",
        "tagline": "Match Skills. Explain Gaps. Reduce Identity Bias.",
        "model": matcher_service.semantic_matcher.model_name,
        "scoring_weights": {"skills": "60%", "experience": "25%", "education": "15%"}
    }

@router.get("/stats")
def get_dashboard_stats():
    return get_stats()

# Authentication Endpoints
@router.post("/auth/login")
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = f"auth_{user['id']}_{secrets.token_hex(16)}"
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "organization": user["organization"],
            "avatar_url": user["avatar_url"],
            "created_at": user["created_at"]
        }
    }

@router.post("/auth/register")
def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    
    existing = get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    role = payload.role.strip().lower() if payload.role else "candidate"
    if role not in ("recruiter", "candidate", "admin"):
        role = "candidate"
    
    pwd_hash = hash_password(payload.password)
    user_id = create_user(
        name=payload.name.strip(),
        email=email,
        password_hash=pwd_hash,
        role=role,
        organization=payload.organization or ""
    )
    user = get_user_by_id(user_id)
    token = f"auth_{user['id']}_{secrets.token_hex(16)}"
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "organization": user["organization"],
            "avatar_url": user["avatar_url"],
            "created_at": user["created_at"]
        }
    }

@router.get("/auth/demo-users")
def get_demo_accounts():
    return [
        {
            "name": "Sarah Jenkins",
            "title": "Lead Technical Recruiter",
            "email": "recruiter@resumematch.ai",
            "password": "recruiter123",
            "role": "recruiter",
            "organization": "Apex Talent Partners",
            "badge": "Recruiter Mode",
            "description": "Post jobs, batch upload resumes, inspect candidate match breakdown and explainability rankings."
        },
        {
            "name": "Alex Rivera",
            "title": "Software Engineer Candidate",
            "email": "candidate@resumematch.ai",
            "password": "candidate123",
            "role": "candidate",
            "organization": "Independent Applicant",
            "badge": "Candidate Mode",
            "description": "Upload or paste your resume, inspect anonymized match scoring, and receive targeted 4-week learning roadmaps."
        },
        {
            "name": "Dr. Elena Vance",
            "title": "AI Ethics & Compliance Officer",
            "email": "auditor@resumematch.ai",
            "password": "auditor123",
            "role": "admin",
            "organization": "AI Governance Board",
            "badge": "Auditor Mode",
            "description": "Audit scoring models, verify demographic attribute exclusion, and test counterfactual bias parity."
        }
    ]

@router.get("/auth/me")
def get_current_user_profile(user_id: Optional[int] = Query(None)):
    if user_id:
        user = get_user_by_id(user_id)
        if user:
            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "organization": user["organization"],
                "avatar_url": user["avatar_url"],
                "created_at": user["created_at"]
            }
    users = get_all_users()
    if users:
        return users[0]
    raise HTTPException(status_code=404, detail="No user found")

# Jobs Endpoints
@router.post("/jobs")
def create_job(payload: JobCreateRequest):
    try:
        job = matcher_service.create_job(
            title=payload.title,
            company=payload.company or "TechCorp Inc.",
            description=payload.description,
            required_skills=payload.required_skills,
            preferred_skills=payload.preferred_skills,
            experience_required=payload.experience_required,
            education_required=payload.education_required
        )
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs/parse")
def parse_job_text(payload: JobParseRequest):
    try:
        parsed = matcher_service.job_parser.parse_job_description(payload.description)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs/upload-file")
async def upload_job_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = extract_text(file.filename, content)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded job description.")
        parsed = matcher_service.job_parser.parse_job_description(text)
        return {
            "filename": file.filename,
            "raw_text": text,
            "parsed": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs")
def list_jobs():
    return get_all_jobs()

@router.get("/jobs/{job_id}")
def get_job_by_id(job_id: int):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Resumes & Matching Endpoints
@router.post("/resumes/upload")
async def upload_resumes(
    job_id: int = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Accepts one or more PDF/DOCX resumes, applies identity masking,
    performs semantic skill matching, and returns ranked results.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")

    results = []
    errors = []

    for file in files:
        try:
            content = await file.read()
            match_res = matcher_service.process_and_match_resume(
                job_id=job_id,
                filename=file.filename,
                content=content
            )
            results.append({
                "filename": file.filename,
                "status": "success",
                "data": match_res
            })
        except Exception as e:
            errors.append({
                "filename": file.filename,
                "status": "error",
                "message": f"Unable to process resume: {str(e)}"
            })

    return {
        "processed_count": len(results),
        "error_count": len(errors),
        "results": results,
        "errors": errors
    }

@router.post("/match")
def match_single_resume(payload: MatchRequest):
    """
    Ad-hoc matching for candidate self-assessment or recruiter quick check.
    """
    try:
        # Determine job
        if payload.job_id:
            job = get_job(payload.job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job ID not found")
        elif payload.job_description:
            parsed = matcher_service.job_parser.parse_job_description(payload.job_description)
            job = {
                "id": 9999,
                "title": "Target Role",
                "description": payload.job_description,
                "required_skills": parsed["required_skills"],
                "preferred_skills": parsed["preferred_skills"],
                "experience_required": parsed["experience_required"],
                "education_required": parsed["education_required"]
            }
        else:
            jobs = get_all_jobs()
            if not jobs:
                raise HTTPException(status_code=400, detail="No active jobs available for matching.")
            job = jobs[0]

        # Process through full pipeline
        code = payload.candidate_code or "CAND-MYMATCH"
        mask_res = matcher_service.masker.mask_resume(payload.resume_text, candidate_code=code)
        parsed_resume = matcher_service.resume_parser.parse_resume(mask_res["masked_text"])

        candidate_temp = {
            "candidate_code": code,
            "skills": parsed_resume["skills"],
            "experience": parsed_resume["experience"],
            "experience_raw": parsed_resume["experience_raw"],
            "education": parsed_resume["education"],
            "masked_text": mask_res["masked_text"]
        }

        score_details = matcher_service.scorer.calculate_explainable_score(job, candidate_temp)
        roadmap = matcher_service.skill_extractor
        from backend.skills.roadmap import generate_learning_roadmap, generate_resume_suggestions
        roadmap_items = generate_learning_roadmap(score_details["missing_skills"], skill_extractor)
        suggestions = generate_resume_suggestions(
            score_details["matched_skills"],
            score_details["missing_skills"],
            score_details["experience_score"],
            score_details["education_score"]
        )

        return {
            "job": job,
            "candidate_code": code,
            "score_details": score_details,
            "information_used": mask_res["information_used"],
            "information_excluded": mask_res["information_excluded"],
            "roadmap": roadmap_items,
            "resume_suggestions": suggestions,
            "responsible_ai_notice": "Selected identity attributes are excluded from the ranking pipeline. Scores reflect job alignment only."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}/candidates")
def get_candidates_for_job(job_id: int):
    matches = get_matches_for_job(job_id)
    return matches

@router.get("/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: int, job_id: Optional[int] = Query(None)):
    details = matcher_service.get_candidate_details(candidate_id, job_id)
    if not details:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return details

# Fairness / Bias Check
@router.post("/fairness-test")
def run_fairness_test(payload: Optional[CustomFairnessRequest] = None):
    try:
        cand_a_dict = payload.candidate_a.model_dump() if payload and payload.candidate_a else None
        cand_b_dict = payload.candidate_b.model_dump() if payload and payload.candidate_b else None
        result = fairness_service.run_controlled_bias_test(cand_a_dict, cand_b_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Audit Logs
@router.get("/audit")
def list_audit_logs(job_id: Optional[int] = Query(None), candidate_id: Optional[int] = Query(None)):
    return get_audit_logs(candidate_id=candidate_id, job_id=job_id)

@router.get("/audit/{candidate_id}")
def get_candidate_audit(candidate_id: int):
    return get_audit_logs(candidate_id=candidate_id)

# Demo Mode Data Seeder
@router.post("/demo-data")
def seed_demo():
    try:
        result = matcher_service.seed_demo_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Skills catalog
@router.get("/skills")
def get_skills_catalog():
    return skill_extractor.skills_db
