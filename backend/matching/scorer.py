import re
from typing import Dict, Any, List, Tuple
from backend.matching.semantic_matcher import SemanticMatcher

SKILL_WEIGHT = 0.60
EXPERIENCE_WEIGHT = 0.25
EDUCATION_WEIGHT = 0.15

class ExplainableScorer:
    def __init__(self, semantic_matcher: SemanticMatcher = None):
        self.semantic_matcher = semantic_matcher or SemanticMatcher()

    def evaluate_skills(self, required_skills: List[str], preferred_skills: List[str],
                        candidate_skills: List[str], candidate_text: str = "") -> Tuple[float, List[str], List[str]]:
        """
        Calculates skill match percentage and returns (score, matched_skills, missing_skills).
        """
        if not required_skills:
            return 100.0, candidate_skills, []

        candidate_skills_set = set(candidate_skills)
        matched = []
        missing = []

        for skill in required_skills:
            if skill in candidate_skills_set:
                matched.append(skill)
            else:
                # Check semantic similarity (e.g. FastAPI for REST API)
                sim = 0.0
                for cs in candidate_skills:
                    s = self.semantic_matcher.compute_similarity(skill, cs)
                    if s > sim:
                        sim = s
                
                # Check within candidate text
                if sim < 0.65 and candidate_text:
                    text_sim = self.semantic_matcher.compute_similarity(f"Experience with {skill}", candidate_text)
                    sim = max(sim, text_sim * 0.8)

                if sim >= 0.70:
                    matched.append(skill)
                else:
                    missing.append(skill)

        # Baseline ratio of required skills matched
        req_ratio = len(matched) / len(required_skills)
        base_score = req_ratio * 100.0

        # Preferred skills give a bonus up to +10 points (capped at 100)
        if preferred_skills:
            pref_matched = set(preferred_skills).intersection(candidate_skills_set)
            bonus = (len(pref_matched) / len(preferred_skills)) * 10.0
            base_score = min(100.0, base_score + bonus)

        return round(base_score, 1), matched, missing

    def evaluate_experience(self, required_exp_text: str, candidate_exp_years: float, candidate_exp_raw: str) -> Tuple[float, str]:
        """
        Calculates experience alignment percentage (0-100) and rationale.
        """
        required_exp_text = str(required_exp_text or "1-2 years")
        candidate_exp_raw = str(candidate_exp_raw or "")
        try:
            candidate_exp_years = float(candidate_exp_years)
        except (ValueError, TypeError):
            candidate_exp_years = 0.0

        # Parse target years from required_exp_text (e.g. "1-2 years", "2+ years", "3 years")
        min_years = 1.0
        max_years = 3.0

        range_match = re.search(r'(\d+[\.\d]*)\s*[-–to]+\s*(\d+[\.\d]*)', required_exp_text)
        if range_match:
            min_years = float(range_match.group(1))
            max_years = float(range_match.group(2))
        else:
            single_match = re.search(r'(\d+[\.\d]*)', required_exp_text)
            if single_match:
                min_years = float(single_match.group(1))
                max_years = min_years + 2.0
            elif "fresher" in required_exp_text.lower() or "entry" in required_exp_text.lower():
                min_years = 0.0
                max_years = 1.0

        if candidate_exp_years >= min_years:
            if candidate_exp_years <= max_years + 3.0:
                score = 100.0
                rationale = f"Meets experience requirement ({candidate_exp_years} yrs vs required {required_exp_text})."
            else:
                score = 95.0
                rationale = f"Senior experience level ({candidate_exp_years} yrs vs required {required_exp_text})."
        elif candidate_exp_years >= (min_years * 0.75):
            score = 80.0
            rationale = f"Close to target requirement ({candidate_exp_years} yrs vs required {required_exp_text})."
        elif candidate_exp_years > 0:
            ratio = max(0.4, candidate_exp_years / min_years)
            score = round(ratio * 75.0, 1)
            rationale = f"Below preferred requirement ({candidate_exp_years} yrs vs required {required_exp_text})."
        else:
            score = 65.0
            rationale = "Experience timeline could not be confidently determined from resume text."

        return score, rationale

    def evaluate_education(self, required_edu_text: str, candidate_edu_text: str) -> Tuple[float, str]:
        """
        Calculates education alignment percentage (0-100) and rationale.
        """
        required_edu_text = str(required_edu_text or "Not specified")
        candidate_edu_text = str(candidate_edu_text or "Not specified")

        if not required_edu_text or "not specified" in required_edu_text.lower():
            return 100.0, "No specific degree enforced; full credit granted."

        cand_lower = candidate_edu_text.lower()
        req_lower = required_edu_text.lower()

        # Check direct engineering/CS overlap
        cs_terms = ["computer science", "information technology", "cse", "it", "software engineering"]
        deg_terms = ["b.tech", "b.e", "m.tech", "bachelor", "master", "mca", "bca", "bs", "ms"]

        cand_has_cs = any(t in cand_lower for t in cs_terms)
        cand_has_deg = any(t in cand_lower for t in deg_terms)

        if cand_has_cs and cand_has_deg:
            return 100.0, f"Education requirement verified ({candidate_edu_text})."
        elif cand_has_deg:
            return 90.0, f"Degree in relevant technical discipline ({candidate_edu_text})."
        elif cand_has_cs:
            return 85.0, f"Relevant technical coursework present ({candidate_edu_text})."
        elif "not explicitly stated" in cand_lower:
            return 70.0, "Education credential not clearly labeled in resume."
        else:
            return 75.0, f"Alternative educational background ({candidate_edu_text})."

    def calculate_explainable_score(self, job: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates the complete explainable score with exact 60 / 25 / 15 weight breakdown.
        Formula: Final = (Skill * 0.60) + (Experience * 0.25) + (Education * 0.15)
        """
        required_skills = job.get("required_skills", [])
        preferred_skills = job.get("preferred_skills", [])
        candidate_skills = candidate.get("skills", [])
        candidate_text = candidate.get("masked_text", "")

        # 1. Skill evaluation (60%)
        skill_score, matched_skills, missing_skills = self.evaluate_skills(
            required_skills, preferred_skills, candidate_skills, candidate_text
        )
        skill_contribution = round(skill_score * SKILL_WEIGHT, 2)

        # 2. Experience evaluation (25%)
        exp_required_str = job.get("experience_required", "1-2 years")
        cand_exp_val = float(candidate.get("experience", 0.0))
        cand_exp_raw = candidate.get("experience_raw", "")
        exp_score, exp_rationale = self.evaluate_experience(exp_required_str, cand_exp_val, cand_exp_raw)
        exp_contribution = round(exp_score * EXPERIENCE_WEIGHT, 2)

        # 3. Education evaluation (15%)
        edu_required_str = job.get("education_required", "B.Tech Computer Science")
        cand_edu_str = candidate.get("education", "Not specified")
        edu_score, edu_rationale = self.evaluate_education(edu_required_str, cand_edu_str)
        edu_contribution = round(edu_score * EDUCATION_WEIGHT, 2)

        # 4. Final Score & Rounding
        final_score_exact = round(skill_contribution + exp_contribution + edu_contribution, 1)
        final_score_rounded = int(round(final_score_exact))

        # 5. Confidence Indicator
        confidence = "High"
        confidence_reasons = []
        if cand_exp_val == 0.0 or "could not be confidently" in cand_exp_raw.lower():
            confidence = "Medium"
            confidence_reasons.append("Experience timeline was incomplete or inferred.")
        if "not explicitly stated" in cand_edu_str.lower():
            if confidence == "High":
                confidence = "Medium"
            confidence_reasons.append("Education credential was not explicitly declared.")

        confidence_reason_str = " ".join(confidence_reasons) if confidence_reasons else "All key qualification dimensions were clearly identified."

        # 6. Detailed summary explanation
        explanation_summary = (
            f"Candidate achieved an overall score of {final_score_rounded}% "
            f"(Exact: {final_score_exact}%). "
            f"Skill match contributed {skill_contribution}/60 ({skill_score}%), "
            f"Experience contributed {exp_contribution}/25 ({exp_score}%), and "
            f"Education contributed {edu_contribution}/15 ({edu_score}%)."
        )

        return {
            "final_score": final_score_rounded,
            "final_score_exact": final_score_exact,
            "skill_score": skill_score,
            "skill_contribution": skill_contribution,
            "skill_max": 60,
            "experience_score": exp_score,
            "experience_contribution": exp_contribution,
            "experience_max": 25,
            "experience_rationale": exp_rationale,
            "education_score": edu_score,
            "education_contribution": edu_contribution,
            "education_max": 15,
            "education_rationale": edu_rationale,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "confidence": confidence,
            "confidence_reason": confidence_reason_str,
            "explanation_summary": explanation_summary,
            "scoring_formula": "Final Score = (Skill Score × 0.60) + (Experience Score × 0.25) + (Education Score × 0.15)",
            "weights": {
                "skill": 0.60,
                "experience": 0.25,
                "education": 0.15
            }
        }
