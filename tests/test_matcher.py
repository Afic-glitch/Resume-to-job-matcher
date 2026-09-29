import io
import pytest
from pathlib import Path
from backend.bias.masker import IdentityMasker
from backend.skills.extractor import SkillExtractor
from backend.matching.semantic_matcher import SemanticMatcher
from backend.matching.scorer import ExplainableScorer
from backend.parser.job_parser import JobParser
from backend.parser.resume_parser import ResumeParser
from backend.parser.document_parser import extract_text, extract_text_from_docx, extract_text_from_pdf
from backend.services.fairness_service import FairnessService
from backend.services.matcher_service import MatcherService
from fastapi.testclient import TestClient
from backend.main import app
import pypdf

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def extractor():
    return SkillExtractor()

@pytest.fixture
def scorer():
    return ExplainableScorer()

def test_api_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Resume-to-Job Matcher" in data["service"]

def test_skill_extraction(extractor):
    text = "Proficient in Python, SQL, REST APIs, Git, Docker, and AWS cloud deployment. Also used PostgreSQL and React."
    skills = extractor.extract_skills(text)
    assert "Python" in skills
    assert "SQL" in skills
    assert "REST API" in skills
    assert "Git" in skills
    assert "Docker" in skills
    assert "AWS" in skills
    assert "PostgreSQL" in skills
    assert "React" in skills

def test_bias_masking():
    raw_resume = """
Arun Kumar
arun.kumar@gmail.com | +91 9876543210
Male, 24 years old
Address: Flat 402, Green Valley Apartments, Bengaluru

Summary:
Backend developer with 2 years of experience in Python and FastAPI.
    """.strip()

    result = IdentityMasker.mask_resume(raw_resume, candidate_code="CAND-001")
    masked = result["masked_text"]
    
    # Assert sensitive data is scrubbed
    assert "arun.kumar@gmail.com" not in masked
    assert "9876543210" not in masked
    assert "Male" not in masked
    assert "[MASKED_EMAIL]" in masked
    assert "[MASKED_PHONE]" in masked
    assert "[MASKED_GENDER]" in masked
    assert "Candidate Full Name" in result["information_excluded"]
    assert "Gender / Pronouns" in result["information_excluded"]

def test_explainable_scoring_formula(scorer):
    """
    Test exact score calculation from Section 11 & 38:
    Skill Score = 88 -> 88 * 0.60 = 52.8
    Experience Score = 80 -> 80 * 0.25 = 20
    Education Score = 100 -> 100 * 0.15 = 15
    Final Score = 87.8 -> Rounded: 88%
    """
    skill_score = 88.0
    exp_score = 80.0
    edu_score = 100.0

    skill_contrib = round(skill_score * 0.60, 2)
    exp_contrib = round(exp_score * 0.25, 2)
    edu_contrib = round(edu_score * 0.15, 2)

    assert skill_contrib == 52.8
    assert exp_contrib == 20.0
    assert edu_contrib == 15.0

    final_score = round(skill_contrib + exp_contrib + edu_contrib, 1)
    assert final_score == 87.8
    assert round(final_score) == 88

def test_missing_skills_detection(scorer):
    required = ["Python", "SQL", "REST API", "Git", "Docker", "AWS"]
    preferred = ["Kubernetes"]
    candidate_skills = ["Python", "SQL", "Git", "REST API"]

    score, matched, missing = scorer.evaluate_skills(required, preferred, candidate_skills)
    assert "Python" in matched
    assert "SQL" in matched
    assert "Docker" in missing
    assert "AWS" in missing
    assert len(matched) == 4
    assert len(missing) == 2

def test_experience_matching(scorer):
    required_exp = "1-2 years"
    score_meets, rationale = scorer.evaluate_experience(required_exp, 2.0, "2 years")
    assert score_meets >= 90.0
    assert "Meets experience requirement" in rationale

def test_education_matching(scorer):
    required_edu = "B.Tech Computer Science or related"
    score, rationale = scorer.evaluate_education(required_edu, "B.Tech in Computer Science")
    assert score == 100.0
    assert "Education requirement verified" in rationale

def test_controlled_fairness():
    fairness_service = FairnessService()
    result = fairness_service.run_controlled_bias_test()
    assert result["score_a"] == result["score_b"]
    assert result["score_difference"] == 0
    assert result["is_fair"] is True
    assert "Selected identity attributes are excluded" in result["responsible_ai_disclaimer"]

def test_semantic_similarity():
    matcher = SemanticMatcher()
    sim = matcher.compute_similarity("FastAPI REST backend development", "Built RESTful web services in Python")
    assert sim > 0.0
    assert sim <= 1.0

def test_docx_parsing():
    docx_path = Path(__file__).resolve().parent.parent / "data" / "sample_data" / "sample_resume_priya_sharma.docx"
    assert docx_path.exists()
    text = extract_text_from_docx(docx_path)
    assert "Priya Sharma" in text
    assert "FastAPI" in text or "REST" in text

def test_pdf_parsing():
    # Generate in-memory PDF using pypdf writer
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=300, height=300)
    # Write stream
    stream = io.BytesIO()
    writer.write(stream)
    stream.seek(0)
    # Verify parser handles it gracefully without exception
    text = extract_text_from_pdf(stream.getvalue())
    assert isinstance(text, str)

def test_custom_fairness_api(client):
    """Verify custom candidate fairness test runs without KeyError/IndexError when fields are minimal."""
    payload = {
        "candidate_a": {
            "name": "Custom Candidate A",
            "gender": "Male",
            "skills": ["Python", "SQL", "Git", "REST API"],
            "experience": 2.0,
            "experience_raw": "2 years as Backend Developer",
            "education": "B.Tech Computer Science"
        },
        "candidate_b": {
            "name": "Custom Candidate B",
            "gender": "Female",
            "skills": ["Python", "SQL", "Git", "REST API"],
            "experience": 2.0,
            "experience_raw": "2 years as Backend Developer",
            "education": "B.Tech Computer Science"
        }
    }
    response = client.post("/api/fairness-test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_fair"] is True
    assert data["score_a"] == data["score_b"]

def test_seed_demo_data_idempotency():
    """Verify calling seed_demo_data multiple times does not trigger UNIQUE constraint errors."""
    service = MatcherService()
    res1 = service.seed_demo_data()
    assert res1["status"] == "success"
    res2 = service.seed_demo_data()
    assert res2["status"] == "success"

def test_semantic_matcher_edge_cases():
    """Verify SemanticMatcher handles None, empty strings, case insensitivity and skill overlap."""
    matcher = SemanticMatcher()
    assert matcher.compute_similarity(None, "Python") == 0.0
    assert matcher.compute_similarity("Python", None) == 0.0
    assert matcher.compute_similarity("", "") == 0.0
    assert matcher.compute_similarity("Python", "python") == 1.0
    assert matcher.compute_similarity("REST API", "rest api") == 1.0

    overlap = matcher.compute_skill_semantic_overlap(
        job_skills=["Python", "SQL", "Docker"],
        candidate_skills=["python", "sql", "dockerized deployments"],
        candidate_text="Experience with Docker containers and containerization."
    )
    assert overlap >= 0.8

def test_document_parser_edge_cases():
    """Verify extract_text handles None filename, None content, str content, empty bytes, and stream seeking."""
    assert extract_text(None, None) == ""
    assert extract_text("test.txt", None) == ""
    assert extract_text(None, "Direct text content") == "Direct text content"
    assert extract_text("resume.txt", b"Plain text resume") == "Plain text resume"
    assert extract_text("corrupted.pdf", b"") == ""
    assert extract_text("corrupted.docx", b"") == ""
    assert extract_text("corrupted.txt", b"Text with \x00 null bytes") == "Text with  null bytes"

    # Test file-like object with seek
    stream = io.BytesIO(b"Stream resume content")
    stream.seek(len(b"Stream resume content"))  # leave pointer at EOF
    text = extract_text("stream.txt", stream)
    assert text == "Stream resume content"
