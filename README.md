# RESUME-TO-JOB MATCHER

> **"Match Skills. Explain Gaps. Reduce Identity Bias."**
> 
> *An AI-powered, explainable, and identity-aware candidate matching platform for recruiters, placement cells, and job seekers.*

---

## 1. Project Overview & Problem Statement

Traditional resume screening systems often rely on either rigid keyword matching (rejecting qualified candidates because of phrasing discrepancies) or opaque "black-box" machine learning models that lack explainability and risk amplifying demographic biases.

**Resume-to-Job Matcher** introduces a transparent, skill-centric recruitment platform where:
1. **Selected Identity Attributes Are Masked**: Personally Identifiable Information (name, gender pronouns, contact numbers, email, physical addresses, photographs, demographic markers) are scrubbed before evaluation.
2. **Semantic Matching Replaces Brittle Keywords**: Sentence transformers and high-dimensional semantic n-gram vector embeddings recognize conceptual equivalence (e.g. *FastAPI* and *REST API*, *Docker* and *Containerization*).
3. **Every Score is Mathematically Explainable**: Match scores are decomposed into explicit contributions:
   $$\text{Final Score} = (\text{Skill Score} \times 0.60) + (\text{Experience Score} \times 0.25) + (\text{Education Score} \times 0.15)$$
4. **Actionable Growth Roadmaps are Provided**: Missing skills automatically link to structured 4-week learning roadmaps and honest resume improvement feedback.
5. **Audited Fairness Invariance**: Built-in controlled testing proves identical qualification profiles receive identical match scores regardless of identity.

---

## 2. Core Responsible-AI Principles

> [!IMPORTANT]
> **Responsible-AI Disclaimer**:
> "Selected identity attributes are excluded from the ranking pipeline. Controlled fairness tests check whether changing selected identity attributes changes the matching result."
> *The system supports human hiring teams; it does not claim to eliminate all hiring bias or guarantee employment outcomes.*

### Excluded vs. Job-Relevant Information

| Excluded Sensitive Attributes (Masked) | Job-Relevant Attributes (Used) |
| :--- | :--- |
| Candidate Full Name | Technical & Professional Skills |
| Gender, Honorifics & Pronouns | Quantified Years of Work Experience |
| Photograph / Visual Appearance | Verified Education Degrees & Majors |
| Email Address & Phone Number | Technical Projects & System Scale |
| Physical Home Address / Location | Industry Certifications & Credentials |
| Caste, Religion & Demographic Flags | Relevant Domain Work History |

---

## 3. Technology Stack

- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS + Custom Dark-Theme Glassmorphism
  - Lucide React Iconography
  - Responsive layout for Desktop, Laptop, and Tablet
- **Backend**:
  - Python 3.13 + FastAPI + Uvicorn
  - Pydantic V2 for schema validation & serialization
- **AI / NLP & Document Processing**:
  - Sentence Transformers (`all-MiniLM-L6-v2`) & Cosine Similarity
  - Scikit-learn sub-token character & word n-gram vectorizer
  - PyPDF (`pypdf`) for PDF resume & job extraction
  - `python-docx` for Microsoft Word DOCX resume extraction
- **Database**:
  - SQLite (`data/app.db`) with tables: `jobs`, `candidates`, `matches`, `audit_logs`
- **Testing**:
  - PyTest test suite (`tests/test_matcher.py`)

---

## 4. Architecture & Pipeline

```
Candidate Resume (PDF/DOCX) or Job Description
                       │
                       ▼
       [ Document Parser (PDF / DOCX) ]
                       │
                       ▼
     [ IdentityMasker (PII & Demographic Scrubbing) ]
        ── Strips Name, Gender, Photo, Phone, Email
        ── Generates Anonymous Code (e.g. CAND-014)
                       │
                       ▼
    [ Structured Resume & Job Description Parser ]
        ── Canonical Skills Extraction & Aliases
        ── Experience Duration & Education Degree
                       │
                       ▼
   [ Semantic Matcher (Cosine Similarity & Embeddings) ]
                       │
                       ▼
   [ Explainable Scorer (60% Skill + 25% Exp + 15% Edu) ]
        ── Calculates exact mathematical contributions
        ── Derives Data Completeness Confidence (High / Med)
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[ Recruiter View ]           [ Candidate View ]
- Blind Candidate Rankings   - Alignment & Gap Score
- "Why Scored X%" Breakdown - 4-Week Learning Roadmap
- Side-by-Side Comparison    - Honest Resume Tips
- Audit Transparency Log     - Controlled Fairness Test
```

---

## 5. Explainable Scoring Model

The default scoring model applies deterministic weights:
- **Skill Match (60%)**: Evaluates canonical and semantic coverage of required job skills, with a bonus for preferred skills.
- **Experience Match (25%)**: Compares verified candidate work years against job requirements.
- **Education Match (15%)**: Validates relevant technical degree backgrounds.

### Worked Example:
- **Skill Score**: $88\% \times 0.60 = 52.8 / 60$
- **Experience Score**: $80\% \times 0.25 = 20.0 / 25$
- **Education Score**: $100\% \times 0.15 = 15.0 / 15$
- **Exact Final Score**: $52.8 + 20.0 + 15.0 = 87.8\%$
- **Displayed Score**: **88%**

---

## 6. Installation & Quickstart

### Prerequisites
- Python 3.11+ (Python 3.13 tested and working)
- Node.js v20.18+ & npm

### 1. Backend Setup
```bash
# Navigate to project root
cd "Resume to job matcher"

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend Swagger Docs will be accessible at: `http://127.0.0.1:8000/docs`*

### 2. Frontend Setup
```bash
# In a new terminal:
cd "Resume to job matcher/frontend"

# Install frontend packages
npm install

# Start Vite development server
npm run dev
```
*Frontend will be accessible at: `http://localhost:5173`*

---

## 7. Demo Mode (One-Click Judge Experience)

Judges and evaluators can immediately evaluate the system without manual uploads:
1. Open the application at `http://localhost:5173`.
2. Click the green **[Load Demo Data]** button in the header navbar or hero section.
3. The system instantly pre-seeds:
   - **Demo Job**: *Python Backend Developer* at *Nexora AI Solutions*
   - **5 Realistic Candidates**: `CAND-014` (91%), `CAND-027` (84%), `CAND-031` (76%), `CAND-045` (68%), `CAND-052` (72%)
   - Pre-computed explainable scores, matched & missing skills, and audit trails.
4. Navigate through **Candidates**, click **View Candidate** to inspect the *"Why this candidate scored X%"* breakdown, or select candidates and click **Compare Selected**.
5. Switch to **Candidate Mode** to experience the 4-week learning roadmap and resume improvement advisor.
6. Visit **Fairness Check** to view the Arun Kumar vs Ananya Kumar controlled parity test.

---

## 8. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & model status |
| `GET` | `/api/stats` | Dashboard statistics |
| `POST` | `/api/jobs` | Create a job posting |
| `POST` | `/api/jobs/parse` | Parse raw JD text for requirements & quality warnings |
| `POST` | `/api/jobs/upload-file` | Extract and parse JD from PDF/DOCX |
| `GET` | `/api/jobs` | List all active jobs |
| `POST` | `/api/resumes/upload` | Upload multiple PDF/DOCX resumes for a job |
| `POST` | `/api/match` | Ad-hoc single resume match against any JD |
| `GET` | `/api/jobs/{id}/candidates` | Get ranked candidates for a specific job |
| `GET` | `/api/candidates/{id}` | Full explainable candidate evaluation |
| `POST` | `/api/fairness-test` | Run controlled identity masking test |
| `GET` | `/api/audit` | Retrieve transparency audit records |
| `POST` | `/api/demo-data` | Seed demo job and 5 sample candidates |

---

## 9. Automated Test Suite

Run the full automated test suite:
```bash
PYTHONPATH=. .venv/bin/pytest -v tests/
```

Test coverage includes:
- API health check (`test_api_health`)
- Skill extraction with aliases (`test_skill_extraction`)
- Identity & PII bias masking (`test_bias_masking`)
- Exact 60/25/15 explainable score formula verification (`test_explainable_scoring_formula`)
- Missing skills and gap identification (`test_missing_skills_detection`)
- Work experience timeline matching (`test_experience_matching`)
- Education credential matching (`test_education_matching`)
- Controlled identity invariance benchmark (`test_controlled_fairness`)
- Semantic similarity sub-word vectorization (`test_semantic_similarity`)
- Microsoft Word DOCX extraction (`test_docx_parsing`)
- PDF resume extraction (`test_pdf_parsing`)

---

## 10. Limitations & Future Work

- **OCR for Scanned Resumes**: Current parser handles native text PDF and DOCX files; integrating Tesseract OCR will support image-scanned resumes.
- **Multilingual Masking**: Expanding regex and NER models to recognize non-English demographic markers.
- **Placement Cell ATS Integration**: Adding direct export to college enterprise ERPs and candidate notification systems.
