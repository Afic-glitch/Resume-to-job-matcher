import re
from typing import Dict, Any, List
from backend.skills.extractor import SkillExtractor

class ResumeParser:
    def __init__(self, skill_extractor: SkillExtractor = None):
        self.skill_extractor = skill_extractor or SkillExtractor()

    def parse_resume(self, text: str) -> Dict[str, Any]:
        """
        Parses candidate resume text into structured fields:
        skills, experience years, experience text, education, projects, and certifications.
        """
        # 1. Skills
        skills = self.skill_extractor.extract_skills(text)

        # 2. Experience Extraction
        experience_years = 0.0
        experience_raw = "Experience information could not be confidently extracted."
        confidence_flags = []

        # Check explicit experience mentions like "2.5 years", "3 years of experience"
        exp_match = re.search(r'(\d+[\.\d]*)\s*(?:years?|yrs?)(?:\s*of)?\s*(?:relevant\s*work\s*|software\s*|industry\s*)?experience', text, re.IGNORECASE)
        if exp_match:
            try:
                experience_years = float(exp_match.group(1))
                experience_raw = f"{experience_years} years"
            except ValueError:
                pass
        else:
            # Check year ranges e.g. "2022 - 2024", "2021 to Present"
            year_ranges = re.findall(r'\b(201\d|202\d)\s*[-–to]+\s*(201\d|202\d|present|current)\b', text, re.IGNORECASE)
            total_est_years = 0.0
            if year_ranges:
                from datetime import datetime
                current_year = datetime.now().year
                for start, end in year_ranges:
                    s_yr = int(start)
                    e_yr = current_year if end.lower() in ['present', 'current'] else int(end)
                    diff = max(0.5, float(e_yr - s_yr))
                    total_est_years += diff
                experience_years = min(round(total_est_years, 1), 15.0)
                experience_raw = f"~{experience_years} years (calculated from timeline)"
            else:
                if re.search(r'\b(fresher|intern|student|final\s*year)\b', text, re.IGNORECASE):
                    experience_years = 0.5
                    experience_raw = "0.5 years (Fresher / Academic projects)"
                else:
                    confidence_flags.append("Experience timeline not explicitly quantified.")

        # 3. Education Extraction
        education = "Not explicitly stated"
        edu_patterns = [
            r'\b(b\.?tech(?:\s*in)?\s*[a-zA-Z\s]+|b\.?e\.?(?:\s*in)?\s*[a-zA-Z\s]+)',
            r'\b(m\.?tech(?:\s*in)?\s*[a-zA-Z\s]+|m\.?e\.?(?:\s*in)?\s*[a-zA-Z\s]+)',
            r'\b(m\.?c\.?a\.?|b\.?c\.?a\.?|b\.?sc(?:\s*in)?\s*[a-zA-Z\s]+|m\.?sc(?:\s*in)?\s*[a-zA-Z\s]+)',
            r'\b(bachelor(?:[\'\s]*s)?\s*(?:of\s*science|of\s*engineering|degree)?\s*(?:in\s*[a-zA-Z\s]+)?)',
            r'\b(master(?:[\'\s]*s)?\s*(?:of\s*science|of\s*engineering|degree)?\s*(?:in\s*[a-zA-Z\s]+)?)'
        ]
        for pat in edu_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                extracted = m.group(0).strip()
                # Clean up multiple spaces or line breaks
                education = " ".join(extracted.split()[:7])
                break

        if education == "Not explicitly stated":
            if re.search(r'\b(computer science|information technology|software engineering)\b', text, re.IGNORECASE):
                education = "Degree in Computer Science / IT"

        # 4. Projects Extraction
        projects = []
        proj_section = re.search(r'(projects|academic projects|key projects|personal projects)[:\s\n]+(.*?)(?=\n\s*(skills|education|experience|certifications|achievements|\Z))', text, re.IGNORECASE | re.DOTALL)
        if proj_section:
            p_text = proj_section.group(2)
            # Find bullet points or short lines
            lines = [l.strip(" -*•") for l in p_text.splitlines() if len(l.strip()) > 15]
            projects = lines[:4]
        
        if not projects:
            # Fallback scan for project-like sentences
            matches = re.findall(r'(?:developed|built|designed|implemented|created)\s+[^.\n]+', text, re.IGNORECASE)
            projects = [m.strip() for m in matches[:3]]

        # 5. Certifications
        certifications = []
        cert_matches = re.findall(r'\b(?:aws|azure|gcp|docker|kubernetes|oracle|redhat|coursera|udemy)?\s*(?:certified|certification)\s*[^.\n,]+', text, re.IGNORECASE)
        for c in cert_matches:
            c_clean = c.strip()
            if len(c_clean) > 5 and c_clean not in certifications:
                certifications.append(c_clean[:50])

        return {
            "skills": skills,
            "experience": experience_years,
            "experience_raw": experience_raw,
            "education": education,
            "projects": projects,
            "certifications": certifications,
            "confidence_flags": confidence_flags
        }
