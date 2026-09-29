import uuid
from typing import Dict, Any, List, Optional
from backend.database.db import (
    insert_job, get_job, get_all_jobs,
    insert_candidate, get_candidate, get_candidate_by_code,
    insert_match, get_matches_for_job,
    insert_audit_log, get_audit_logs, get_stats
)
from backend.parser.document_parser import extract_text
from backend.parser.job_parser import JobParser
from backend.parser.resume_parser import ResumeParser
from backend.bias.masker import IdentityMasker
from backend.matching.semantic_matcher import SemanticMatcher
from backend.matching.scorer import ExplainableScorer
from backend.skills.extractor import SkillExtractor
from backend.skills.roadmap import generate_learning_roadmap, generate_resume_suggestions

class MatcherService:
    def __init__(self):
        self.skill_extractor = SkillExtractor()
        self.job_parser = JobParser(self.skill_extractor)
        self.resume_parser = ResumeParser(self.skill_extractor)
        self.masker = IdentityMasker()
        self.semantic_matcher = SemanticMatcher()
        self.scorer = ExplainableScorer(self.semantic_matcher)

    def create_job(self, title: str, company: str, description: str,
                   required_skills: Optional[List[str]] = None,
                   preferred_skills: Optional[List[str]] = None,
                   experience_required: Optional[str] = None,
                   education_required: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates and stores a new job posting. If skills/experience/education are not passed,
        they are automatically parsed from the description text.
        """
        parsed = self.job_parser.parse_job_description(description)
        req_skills = required_skills if required_skills is not None else parsed["required_skills"]
        pref_skills = preferred_skills if preferred_skills is not None else parsed["preferred_skills"]
        exp_req = experience_required or parsed["experience_required"]
        edu_req = education_required or parsed["education_required"]

        job_id = insert_job(
            title=title,
            company=company or "Enterprise Partner",
            description=description,
            required_skills=req_skills,
            preferred_skills=pref_skills,
            experience_required=exp_req,
            education_required=edu_req
        )

        job_data = get_job(job_id)
        job_data["quality_warnings"] = parsed["quality_warnings"]
        return job_data

    def process_and_match_resume(self, job_id: int, filename: str, content: bytes,
                                candidate_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Full 8-stage pipeline:
        1. Extract text from PDF/DOCX/TXT
        2. Assign anonymous candidate code (e.g. CAND-XXX)
        3. Identity Masking (exclude names, email, phone, gender, etc.)
        4. Structured extraction (skills, experience, education, projects)
        5. Candidate persistence in SQLite
        6. Semantic matching & Explainable Scoring (60/25/15)
        7. Audit log persistence
        8. Learning roadmap & resume tips generation
        """
        job = get_job(job_id)
        if not job:
            raise ValueError(f"Job with ID {job_id} not found.")

        # 1. Text extraction
        raw_text = extract_text(filename, content)
        if not raw_text.strip():
            raw_text = f"Resume document: {filename} with technical experience in software development."

        # 2. Candidate code
        if not candidate_code:
            short_id = uuid.uuid4().hex[:4].upper()
            candidate_code = f"CAND-{short_id}"

        # 3. Identity Masking
        mask_result = self.masker.mask_resume(raw_text, candidate_code=candidate_code)
        masked_text = mask_result["masked_text"]

        # 4. Structured Parsing from masked text
        parsed_resume = self.resume_parser.parse_resume(masked_text)

        # 5. Candidate persistence
        candidate_id = insert_candidate(
            candidate_code=candidate_code,
            original_text=raw_text,
            masked_text=masked_text,
            skills=parsed_resume["skills"],
            experience=parsed_resume["experience"],
            experience_raw=parsed_resume["experience_raw"],
            education=parsed_resume["education"],
            projects=parsed_resume["projects"],
            certifications=parsed_resume["certifications"]
        )

        candidate_obj = get_candidate(candidate_id)

        # 6. Semantic Matching & Explainable Scoring
        score_data = self.scorer.calculate_explainable_score(job, candidate_obj)

        # Save match
        match_id = insert_match(
            job_id=job_id,
            candidate_id=candidate_id,
            skill_score=score_data["skill_score"],
            experience_score=score_data["experience_score"],
            education_score=score_data["education_score"],
            final_score=score_data["final_score"],
            matched_skills=score_data["matched_skills"],
            missing_skills=score_data["missing_skills"],
            confidence=score_data["confidence"],
            confidence_reason=score_data["confidence_reason"],
            explanation_summary=score_data["explanation_summary"]
        )

        # 7. Audit log
        insert_audit_log(
            candidate_id=candidate_id,
            job_id=job_id,
            model_name=self.semantic_matcher.model_name,
            weights=score_data["weights"],
            information_used=mask_result["information_used"],
            information_excluded=mask_result["information_excluded"],
            final_score=score_data["final_score"]
        )

        # 8. Roadmap & Suggestions
        roadmap = generate_learning_roadmap(score_data["missing_skills"], self.skill_extractor)
        suggestions = generate_resume_suggestions(
            score_data["matched_skills"],
            score_data["missing_skills"],
            score_data["experience_score"],
            score_data["education_score"]
        )

        return {
            "match_id": match_id,
            "job_id": job_id,
            "candidate_id": candidate_id,
            "candidate_code": candidate_code,
            "score_details": score_data,
            "information_used": mask_result["information_used"],
            "information_excluded": mask_result["information_excluded"],
            "roadmap": roadmap,
            "resume_suggestions": suggestions
        }

    def get_candidate_details(self, candidate_id: int, job_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """
        Retrieves full candidate detail with explainable score, roadmap, projects, and audit data.
        """
        candidate = get_candidate(candidate_id)
        if not candidate:
            return None

        # If job_id not provided, pick first available job
        if not job_id:
            jobs = get_all_jobs()
            if jobs:
                job_id = jobs[0]["id"]

        job = get_job(job_id) if job_id else None
        score_details = None
        roadmap = []
        suggestions = []

        if job:
            score_details = self.scorer.calculate_explainable_score(job, candidate)
            roadmap = generate_learning_roadmap(score_details["missing_skills"], self.skill_extractor)
            suggestions = generate_resume_suggestions(
                score_details["matched_skills"],
                score_details["missing_skills"],
                score_details["experience_score"],
                score_details["education_score"]
            )

        audit_logs = get_audit_logs(candidate_id=candidate_id)

        return {
            "candidate": candidate,
            "job": job,
            "score_details": score_details,
            "roadmap": roadmap,
            "resume_suggestions": suggestions,
            "audit_logs": audit_logs
        }

    def seed_demo_data(self) -> Dict[str, Any]:
        """
        Pre-populates the SQLite database with the demo job and 4-5 realistic candidate profiles.
        """
        # 1. Demo Job
        job_id = insert_job(
            title="Python Backend Developer",
            company="Nexora AI Solutions",
            description="""
We are looking for a skilled Python Backend Developer to design, develop, and maintain high-performance microservices and REST APIs.

Key Responsibilities:
- Design robust backend architectures using Python, FastAPI, and PostgreSQL.
- Maintain source code with Git and establish automated CI/CD pipelines.
- Containerize application services using Docker and orchestrate workloads.
- Integrate cloud infrastructure on AWS (EC2, S3, RDS).

Requirements:
- Strong proficiency in Python, SQL, REST API, Git, Docker, and AWS.
- 1-2 years of relevant hands-on software development experience.
- B.Tech/B.E. in Computer Science, Information Technology, or related technical discipline.
- Knowledge of Kubernetes and Azure is a plus.
            """.strip(),
            required_skills=["Python", "SQL", "REST API", "Git", "Docker", "AWS"],
            preferred_skills=["Kubernetes", "Azure"],
            experience_required="1-2 years",
            education_required="B.Tech Computer Science or related"
        )

        job = get_job(job_id)

        # 2. Candidate 1 (Strong Match - ~91%)
        c1_code = "CAND-014"
        c1_raw = """
Arun Verma
arun.verma@example.com | +91 9876543210
Education: B.Tech Computer Science, Batch 2024
Summary: Python backend engineer with 2 years of experience developing microservices.
Skills: Python, SQL, REST API, Git, Docker, AWS, PostgreSQL, Linux
Experience: 2 years as Junior Software Engineer at CloudCorp. Built RESTful microservices using FastAPI and SQLAlchemy. Deployed containers using Docker on AWS EC2.
Projects:
- Microservices E-Commerce API: Built high-throughput REST APIs using Python & PostgreSQL.
- Cloud Monitoring Agent: Dockerized telemetry service deployed on AWS EC2.
Certifications: AWS Certified Cloud Practitioner
        """.strip()
        self.process_and_match_resume(job_id, "resume_arun_verma.txt", c1_raw.encode("utf-8"), candidate_code=c1_code)

        # 3. Candidate 2 (Solid Match, Missing AWS - ~84%)
        c2_code = "CAND-027"
        c2_raw = """
Priya Sharma
priya.sharma@example.com | +91 9811122233
Education: B.Tech Computer Science, Tier-1 Institute
Skills: Python, SQL, Git, REST API, MySQL, Django, Linux
Experience: 1.5 years experience as Associate Backend Developer. Designed REST APIs and optimized complex SQL queries.
Projects:
- Inventory Management API: Created RESTful services with Django REST Framework and MySQL.
- Git Workflow Automation: Implemented pre-commit hooks and GitHub Actions.
Certifications: Python Certified Developer
        """.strip()
        self.process_and_match_resume(job_id, "resume_priya_sharma.txt", c2_raw.encode("utf-8"), candidate_code=c2_code)

        # 4. Candidate 3 (Moderate Match, Strong Backend - ~76%)
        c3_code = "CAND-031"
        c3_raw = """
Rohan Mehta
rohan.m@example.com | +91 9777888999
Education: B.Tech Information Technology
Skills: Python, SQL, Docker, Git, Flask, MongoDB
Experience: 2 years in software development focusing on containerized database backends.
Projects:
- Data Ingestion Service: Flask microservice packaged with Docker Compose.
- MongoDB Aggregation Engine: SQL to NoSQL data migration pipeline.
Certifications: Docker Certified Associate
        """.strip()
        self.process_and_match_resume(job_id, "resume_rohan_mehta.txt", c3_raw.encode("utf-8"), candidate_code=c3_code)

        # 5. Candidate 4 (Frontend/Full-stack Shift - ~68%)
        c4_code = "CAND-045"
        c4_raw = """
Neha Gupta
neha.gupta@example.com | +91 9666555444
Education: B.E. Computer Science
Skills: JavaScript, TypeScript, React, HTML, CSS, Git, Node.js, SQL
Experience: 1 year as Frontend / Junior Fullstack Developer.
Projects:
- Analytics Web Dashboard: Built responsive interfaces in React and TypeScript.
- REST API Client: Integrated frontend components with backend endpoints.
Certifications: Meta Frontend Professional Certificate
        """.strip()
        self.process_and_match_resume(job_id, "resume_neha_gupta.txt", c4_raw.encode("utf-8"), candidate_code=c4_code)

        # 6. Candidate 5 (Entry Level Python Developer - ~72%)
        c5_code = "CAND-052"
        c5_raw = """
Kavita Iyer
kavita.iyer@example.com | +91 9555444333
Education: B.Tech Computer Science & Engineering
Skills: Python, SQL, REST API, Git, Data Structures, Algorithms
Experience: 1 year as Software Trainee / Intern.
Projects:
- Student Record API: RESTful CRUD service written in Python with SQLite.
- Algorithmic Trading Bot: Python script utilizing REST APIs.
Certifications: Python Data Structures Certificate
        """.strip()
        self.process_and_match_resume(job_id, "resume_kavita_iyer.txt", c5_raw.encode("utf-8"), candidate_code=c5_code)

        return {
            "status": "success",
            "message": "Demo data loaded successfully with 1 job and 5 matched candidates.",
            "job_id": job_id,
            "candidates_count": 5
        }
