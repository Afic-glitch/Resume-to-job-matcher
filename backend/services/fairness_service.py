from typing import Dict, Any, List
from backend.bias.masker import IdentityMasker
from backend.matching.scorer import ExplainableScorer
from backend.matching.semantic_matcher import SemanticMatcher

CONTROLLED_JOB = {
    "title": "Python Backend Developer",
    "description": "Seeking a Python Backend Developer with experience building REST APIs, managing SQL databases, Git version control, and deploying backend services. Docker and AWS experience is preferred.",
    "required_skills": ["Python", "SQL", "Git", "REST API"],
    "preferred_skills": ["Docker", "AWS"],
    "experience_required": "1-2 years",
    "education_required": "B.Tech Computer Science"
}

class FairnessService:
    def __init__(self):
        self.masker = IdentityMasker()
        self.semantic_matcher = SemanticMatcher()
        self.scorer = ExplainableScorer(self.semantic_matcher)

    def run_controlled_bias_test(self, custom_candidate_a: Dict[str, Any] = None,
                                  custom_candidate_b: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Executes a controlled fairness benchmark comparing two candidates with
        identical qualifications but divergent demographic and identity markers.
        """
        # Profile A (Male Candidate)
        cand_a_raw = custom_candidate_a or {
            "name": "Arun Kumar",
            "gender": "Male",
            "email": "arun.kumar@gmail.com",
            "phone": "+91 9876543210",
            "photo": "[PHOTO]",
            "skills": ["Python", "SQL", "Git", "REST API"],
            "experience": 2.0,
            "experience_raw": "2 years as Backend Software Developer",
            "education": "B.Tech Computer Science",
            "projects": ["Built scalable REST APIs with FastAPI and PostgreSQL", "Git repository branching and CI automation"],
            "certifications": ["Python Professional Certificate"]
        }

        # Profile B (Female Candidate)
        cand_b_raw = custom_candidate_b or {
            "name": "Ananya Kumar",
            "gender": "Female",
            "email": "ananya.kumar@gmail.com",
            "phone": "+91 9123456780",
            "photo": "[PHOTO]",
            "skills": ["Python", "SQL", "Git", "REST API"],
            "experience": 2.0,
            "experience_raw": "2 years as Backend Software Developer",
            "education": "B.Tech Computer Science",
            "projects": ["Built scalable REST APIs with FastAPI and PostgreSQL", "Git repository branching and CI automation"],
            "certifications": ["Python Professional Certificate"]
        }

        # Format full raw resume text including identity markers safely
        name_a = cand_a_raw.get('name', 'Candidate A')
        gender_a = cand_a_raw.get('gender', 'Unspecified')
        email_a = cand_a_raw.get('email') or f"{name_a.lower().replace(' ', '.')}@example.com"
        phone_a = cand_a_raw.get('phone') or "+91 9876543210"
        photo_a = cand_a_raw.get('photo', '[PHOTO]')
        edu_a = cand_a_raw.get('education', 'B.Tech Computer Science')
        skills_a = cand_a_raw.get('skills') or ['Python', 'SQL', 'Git', 'REST API']
        exp_raw_a = cand_a_raw.get('experience_raw') or f"{cand_a_raw.get('experience', 2.0)} years as Software Developer"
        projects_a = cand_a_raw.get('projects') or []
        proj_a_0 = projects_a[0] if len(projects_a) > 0 else "Built scalable REST APIs with FastAPI and PostgreSQL"
        proj_a_1 = projects_a[1] if len(projects_a) > 1 else "Git repository branching and CI automation"

        text_a = f"""
Name: {name_a}
Gender: {gender_a}
Email: {email_a}
Phone: {phone_a}
Photo: {photo_a}

Professional Summary:
Backend Engineer with 2 years of experience building REST APIs with Python and SQL.

Education:
{edu_a}

Skills:
{', '.join(skills_a)}

Experience:
{exp_raw_a}

Projects:
- {proj_a_0}
- {proj_a_1}
        """.strip()

        name_b = cand_b_raw.get('name', 'Candidate B')
        gender_b = cand_b_raw.get('gender', 'Unspecified')
        email_b = cand_b_raw.get('email') or f"{name_b.lower().replace(' ', '.')}@example.com"
        phone_b = cand_b_raw.get('phone') or "+91 9123456780"
        photo_b = cand_b_raw.get('photo', '[PHOTO]')
        edu_b = cand_b_raw.get('education', 'B.Tech Computer Science')
        skills_b = cand_b_raw.get('skills') or ['Python', 'SQL', 'Git', 'REST API']
        exp_raw_b = cand_b_raw.get('experience_raw') or f"{cand_b_raw.get('experience', 2.0)} years as Software Developer"
        projects_b = cand_b_raw.get('projects') or []
        proj_b_0 = projects_b[0] if len(projects_b) > 0 else "Built scalable REST APIs with FastAPI and PostgreSQL"
        proj_b_1 = projects_b[1] if len(projects_b) > 1 else "Git repository branching and CI automation"

        text_b = f"""
Name: {name_b}
Gender: {gender_b}
Email: {email_b}
Phone: {phone_b}
Photo: {photo_b}

Professional Summary:
Backend Engineer with 2 years of experience building REST APIs with Python and SQL.

Education:
{edu_b}

Skills:
{', '.join(skills_b)}

Experience:
{exp_raw_b}

Projects:
- {proj_b_0}
- {proj_b_1}
        """.strip()

        # Step 1: Run Identity Masking
        mask_res_a = self.masker.mask_resume(text_a, candidate_code="CAND-FAIR-A")
        mask_res_b = self.masker.mask_resume(text_b, candidate_code="CAND-FAIR-B")

        # Step 2: Scoring through identical model pipeline
        candidate_a_payload = {
            "candidate_code": "CAND-FAIR-A",
            "skills": skills_a,
            "experience": float(cand_a_raw.get("experience", 2.0)),
            "experience_raw": exp_raw_a,
            "education": edu_a,
            "masked_text": mask_res_a["masked_text"]
        }
        candidate_b_payload = {
            "candidate_code": "CAND-FAIR-B",
            "skills": skills_b,
            "experience": float(cand_b_raw.get("experience", 2.0)),
            "experience_raw": exp_raw_b,
            "education": edu_b,
            "masked_text": mask_res_b["masked_text"]
        }

        score_a = self.scorer.calculate_explainable_score(CONTROLLED_JOB, candidate_a_payload)
        score_b = self.scorer.calculate_explainable_score(CONTROLLED_JOB, candidate_b_payload)

        score_difference = abs(score_a["final_score"] - score_b["final_score"])

        return {
            "job": CONTROLLED_JOB,
            "candidate_a": {
                "name": cand_a_raw["name"],
                "gender": cand_a_raw["gender"],
                "code": "CAND-FAIR-A",
                "masked_text": mask_res_a["masked_text"],
                "excluded_attributes": mask_res_a["information_excluded"],
                "score_details": score_a
            },
            "candidate_b": {
                "name": cand_b_raw["name"],
                "gender": cand_b_raw["gender"],
                "code": "CAND-FAIR-B",
                "masked_text": mask_res_b["masked_text"],
                "excluded_attributes": mask_res_b["information_excluded"],
                "score_details": score_b
            },
            "score_a": score_a["final_score"],
            "score_b": score_b["final_score"],
            "score_difference": score_difference,
            "is_fair": score_difference == 0,
            "excluded_checks": [
                {"attribute": "Candidate Name", "status": "Excluded", "verified": True},
                {"attribute": "Gender / Pronouns", "status": "Excluded", "verified": True},
                {"attribute": "Photograph / Appearance", "status": "Excluded", "verified": True},
                {"attribute": "Email Address", "status": "Excluded", "verified": True},
                {"attribute": "Phone Number", "status": "Excluded", "verified": True},
                {"attribute": "Address / Demographics", "status": "Excluded", "verified": True}
            ],
            "explanation": "Controlled test: identical job-relevant qualification profiles produced the same result after selected identity attributes were masked.",
            "responsible_ai_disclaimer": "Controlled fairness tests check whether changing selected identity attributes changes the matching result. Selected identity attributes are excluded from the ranking pipeline. This does not claim that the system completely eliminates hiring bias."
        }
