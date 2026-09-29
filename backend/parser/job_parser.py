import re
from typing import Dict, Any, List
from backend.skills.extractor import SkillExtractor

UNCLEAR_PATTERNS = [
    (re.compile(r'\b(good|excellent|strong)\s+communication\s+skills?\b', re.IGNORECASE),
     "Communication skills mentioned without objective evaluation criteria."),
    (re.compile(r'\b(fast\s+learner|self-starter|go-getter|rockstar|ninja|guru)\b', re.IGNORECASE),
     "Subjective buzzword found; job description could specify verifiable technical outcomes instead."),
    (re.compile(r'\b(years?\s+of\s+experience\s+with\s+various\s+technologies)\b', re.IGNORECASE),
     "Broad unquantified technology experience requested."),
    (re.compile(r'\b(handle\s+multiple\s+responsibilities|wear\s+many\s+hats)\b', re.IGNORECASE),
     "Role responsibilities may be overly broad; consider specifying primary daily deliverables.")
]

class JobParser:
    def __init__(self, skill_extractor: SkillExtractor = None):
        self.skill_extractor = skill_extractor or SkillExtractor()

    def parse_job_description(self, text: str) -> Dict[str, Any]:
        """
        Parses raw job description text into structured requirements:
        required skills, preferred skills, experience, education, and quality flags.
        """
        all_skills = self.skill_extractor.extract_skills(text)

        # Distinguish between preferred and required skills if preferred section exists
        preferred_skills = []
        required_skills = []

        preferred_match = re.search(r'(preferred|nice to have|bonus|good to have|desired skills?|optional)[:\s\n]+(.*?)(?=\n\s*(requirements|qualifications|about|responsibilities|\Z))', text, re.IGNORECASE | re.DOTALL)
        if preferred_match:
            pref_text = preferred_match.group(2)
            preferred_skills = self.skill_extractor.extract_skills(pref_text)
            required_skills = [s for s in all_skills if s not in preferred_skills]
        else:
            required_skills = all_skills

        # If required_skills is empty but all_skills has items
        if not required_skills and all_skills:
            required_skills = all_skills

        # Experience extraction
        exp_match = re.search(r'(\d+[\.\d]*\s*[-–to]+\s*\d+[\.\d]*|\d+\+?|\d+)\s*(?:years?|yrs?)(?:\s*of)?\s*(?:relevant\s*)?experience', text, re.IGNORECASE)
        if exp_match:
            exp_required = exp_match.group(0).strip()
        else:
            if re.search(r'\b(fresher|intern|entry\s*level|graduate|0\s*years?)\b', text, re.IGNORECASE):
                exp_required = "0-1 years (Entry level / Fresher)"
            else:
                exp_required = "1-3 years (Standard)"

        # Education extraction
        edu_match = re.search(r'\b(b\.?tech|b\.?e\.?|m\.?tech|m\.?c\.?a\.?|b\.?c\.?a\.?|bachelor|master|b\.?s\.?|m\.?s\.?|degree|diploma)\b[^\n,.]*', text, re.IGNORECASE)
        if edu_match:
            edu_required = edu_match.group(0).strip()
            # Clean up trailing words
            if len(edu_required) > 60:
                edu_required = edu_required[:60] + "..."
        else:
            edu_required = "B.Tech/B.E. Computer Science, IT, or related engineering degree"

        # Check for unclear requirements
        quality_warnings = []
        for pattern, warning in UNCLEAR_PATTERNS:
            if pattern.search(text):
                quality_warnings.append(warning)

        return {
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "experience_required": exp_required,
            "education_required": edu_required,
            "quality_warnings": quality_warnings
        }
