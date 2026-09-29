from typing import List, Dict, Any
from backend.skills.extractor import SkillExtractor

def generate_learning_roadmap(missing_skills: List[str], extractor: SkillExtractor = None) -> List[Dict[str, Any]]:
    """
    Builds a week-by-week actionable learning roadmap based on missing skills.
    Each week provides a structured milestone and recommended resources/actions.
    """
    if not extractor:
        extractor = SkillExtractor()

    roadmap = []
    if not missing_skills:
        return [
            {
                "week": 1,
                "title": "Skill Mastery & Advanced Architecture",
                "focus": "Full Stack / Backend Deep Dive",
                "milestone": "Build an end-to-end benchmark or production-grade microservice incorporating your matched skill set.",
                "topics": ["Architecture patterns", "Performance profiling", "Automated integration testing"]
            }
        ]

    # Gather learning suggestions for all missing skills
    aggregated_topics = []
    for skill in missing_skills:
        details = extractor.get_skill_details(skill)
        suggestions = details.get("learning_suggestions", [])
        for s in suggestions:
            aggregated_topics.append({"skill": skill, "topic": s})

    # Distribute topics over 4 weeks
    week_plans = [
        {"week": 1, "title": "Core Foundations & Fundamentals", "topics": []},
        {"week": 2, "title": "Practical Implementation & Workflows", "topics": []},
        {"week": 3, "title": "Integration & Cloud Architecture", "topics": []},
        {"week": 4, "title": "Capstone Deployment & Production Readiness", "topics": []},
    ]

    for idx, item in enumerate(aggregated_topics):
        week_idx = idx % 4
        week_plans[week_idx]["topics"].append(f"{item['skill']}: {item['topic']}")

    # Formulate milestones
    for plan in week_plans:
        if not plan["topics"]:
            plan["topics"] = ["Review edge cases & industry standards", "Practice hands-on coding challenges"]
        plan["focus"] = ", ".join(list(set([t.split(":")[0] for t in plan["topics"] if ":" in t]))[:3])
        plan["milestone"] = f"Complete hands-on exercise focused on {plan['focus'] or 'target competencies'}."
        roadmap.append(plan)

    return roadmap

def generate_resume_suggestions(matched_skills: List[str], missing_skills: List[str],
                                experience_score: float, education_score: float) -> List[str]:
    """
    Produces actionable, honest recommendations to improve resume alignment
    without ever inventing facts or fabricating credentials.
    """
    suggestions = []

    if missing_skills:
        top_missing = missing_skills[:3]
        suggestions.append(
            f"Address missing key requirements ({', '.join(top_missing)}): If you have informal or project-based exposure to these, explicitly add them with concrete metrics in your project descriptions."
        )

    if "REST API" in missing_skills or "REST API" in matched_skills:
        suggestions.append(
            "Clearly describe REST API endpoints, request/response models, and status code handling you designed in your backend projects."
        )

    if any(s in missing_skills for s in ["Docker", "Kubernetes", "AWS", "Azure", "GCP"]):
        suggestions.append(
            "Highlight containerization or cloud deployment experience (e.g., Dockerfile configuration, AWS S3/EC2 setup) if you have hands-on practice with them."
        )

    if experience_score < 80:
        suggestions.append(
            "Quantify your project outcomes: Mention duration, throughput, user base, or system scale to provide clearer context for your work timeline."
        )

    if education_score < 100:
        suggestions.append(
            "Ensure your degree title, specialization (e.g., Computer Science, IT, Engineering), and relevant coursework are clearly formatted at the top of your resume."
        )

    suggestions.append(
        "Make relevant technical skills easy for recruiters to identify by grouping them into standard categories: Languages, Frameworks, Databases, and Cloud/DevOps tools."
    )

    return suggestions
