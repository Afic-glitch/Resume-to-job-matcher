import sqlite3
import json
import hashlib
import secrets
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "app.db"

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if ":" not in hashed_password:
        return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password
    salt, _ = hashed_password.split(":", 1)
    return hash_password(plain_password, salt=salt) == hashed_password

def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('recruiter', 'candidate', 'admin')),
        organization TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed default demo users if none exist
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] == 0:
        demo_users = [
            ("Sarah Jenkins (Lead Recruiter)", "recruiter@resumematch.ai", hash_password("recruiter123"), "recruiter", "Apex Talent Partners"),
            ("Alex Rivera (Software Engineer)", "candidate@resumematch.ai", hash_password("candidate123"), "candidate", "Full-Stack Developer"),
            ("Dr. Elena Vance (AI Ethics Auditor)", "auditor@resumematch.ai", hash_password("auditor123"), "admin", "AI Ethics & Compliance Board")
        ]
        for name, email, pwd_hash, role, org in demo_users:
            cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, organization)
            VALUES (?, ?, ?, ?, ?)
            """, (name, email.lower(), pwd_hash, role, org))
        conn.commit()

    # Jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT DEFAULT 'TechCorp Inc.',
        description TEXT NOT NULL,
        required_skills TEXT NOT NULL, -- JSON list
        preferred_skills TEXT DEFAULT '[]', -- JSON list
        experience_required TEXT NOT NULL,
        education_required TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Candidates table (Masked identity fields)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_code TEXT UNIQUE NOT NULL,
        original_text TEXT,
        masked_text TEXT NOT NULL,
        skills TEXT NOT NULL, -- JSON list
        experience REAL DEFAULT 0.0, -- years of experience
        experience_raw TEXT DEFAULT '',
        education TEXT NOT NULL,
        projects TEXT DEFAULT '[]', -- JSON list
        certifications TEXT DEFAULT '[]', -- JSON list
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Matches table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        candidate_id INTEGER NOT NULL,
        skill_score REAL NOT NULL,
        experience_score REAL NOT NULL,
        education_score REAL NOT NULL,
        final_score REAL NOT NULL,
        matched_skills TEXT NOT NULL, -- JSON list
        missing_skills TEXT NOT NULL, -- JSON list
        confidence TEXT DEFAULT 'High',
        confidence_reason TEXT DEFAULT '',
        explanation_summary TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(job_id) REFERENCES jobs(id),
        FOREIGN KEY(candidate_id) REFERENCES candidates(id)
    )
    """)

    # Audit logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        model_name TEXT NOT NULL,
        weights TEXT NOT NULL, -- JSON object
        information_used TEXT NOT NULL, -- JSON list
        information_excluded TEXT NOT NULL, -- JSON list
        final_score REAL NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(candidate_id) REFERENCES candidates(id),
        FOREIGN KEY(job_id) REFERENCES jobs(id)
    )
    """)

    conn.commit()
    conn.close()

# Helper DAO methods
def insert_job(title: str, company: str, description: str, required_skills: List[str],
               preferred_skills: List[str], experience_required: str, education_required: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO jobs (title, company, description, required_skills, preferred_skills, experience_required, education_required)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        title, company, description,
        json.dumps(required_skills),
        json.dumps(preferred_skills),
        experience_required,
        education_required
    ))
    job_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return job_id

def get_job(job_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["required_skills"] = json.loads(d["required_skills"])
    d["preferred_skills"] = json.loads(d["preferred_skills"])
    return d

def get_all_jobs() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["required_skills"] = json.loads(d["required_skills"])
        d["preferred_skills"] = json.loads(d["preferred_skills"])
        result.append(d)
    return result

def insert_candidate(candidate_code: str, original_text: str, masked_text: str,
                     skills: List[str], experience: float, experience_raw: str,
                     education: str, projects: List[str] = None, certifications: List[str] = None) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM candidates WHERE candidate_code = ?", (candidate_code,))
    existing = cursor.fetchone()
    if existing:
        cursor.execute("""
        UPDATE candidates SET
            original_text = ?, masked_text = ?, skills = ?, experience = ?,
            experience_raw = ?, education = ?, projects = ?, certifications = ?, created_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (
            original_text, masked_text,
            json.dumps(skills),
            experience,
            experience_raw,
            education,
            json.dumps(projects or []),
            json.dumps(certifications or []),
            existing["id"]
        ))
        cid = existing["id"]
    else:
        cursor.execute("""
        INSERT INTO candidates (candidate_code, original_text, masked_text, skills, experience, experience_raw, education, projects, certifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            candidate_code, original_text, masked_text,
            json.dumps(skills),
            experience,
            experience_raw,
            education,
            json.dumps(projects or []),
            json.dumps(certifications or [])
        ))
        cid = cursor.lastrowid
    conn.commit()
    conn.close()
    return cid

def get_candidate(candidate_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["skills"] = json.loads(d["skills"])
    d["projects"] = json.loads(d["projects"])
    d["certifications"] = json.loads(d["certifications"])
    return d

def get_candidate_by_code(code: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE candidate_code = ?", (code,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["skills"] = json.loads(d["skills"])
    d["projects"] = json.loads(d["projects"])
    d["certifications"] = json.loads(d["certifications"])
    return d

def insert_match(job_id: int, candidate_id: int, skill_score: float, experience_score: float,
                 education_score: float, final_score: float, matched_skills: List[str],
                 missing_skills: List[str], confidence: str = "High",
                 confidence_reason: str = "", explanation_summary: str = "") -> int:
    conn = get_connection()
    cursor = conn.cursor()
    # Check if match already exists for this candidate & job
    cursor.execute("SELECT id FROM matches WHERE job_id = ? AND candidate_id = ?", (job_id, candidate_id))
    existing = cursor.fetchone()
    if existing:
        cursor.execute("""
        UPDATE matches SET
            skill_score = ?, experience_score = ?, education_score = ?,
            final_score = ?, matched_skills = ?, missing_skills = ?,
            confidence = ?, confidence_reason = ?, explanation_summary = ?, created_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (
            skill_score, experience_score, education_score, final_score,
            json.dumps(matched_skills), json.dumps(missing_skills),
            confidence, confidence_reason, explanation_summary, existing["id"]
        ))
        mid = existing["id"]
    else:
        cursor.execute("""
        INSERT INTO matches (job_id, candidate_id, skill_score, experience_score, education_score, final_score, matched_skills, missing_skills, confidence, confidence_reason, explanation_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job_id, candidate_id, skill_score, experience_score, education_score, final_score,
            json.dumps(matched_skills), json.dumps(missing_skills),
            confidence, confidence_reason, explanation_summary
        ))
        mid = cursor.lastrowid
    conn.commit()
    conn.close()
    return mid

def get_matches_for_job(job_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT m.*, c.candidate_code, c.experience, c.experience_raw, c.education, c.skills, c.projects, c.certifications
    FROM matches m
    JOIN candidates c ON m.candidate_id = c.id
    WHERE m.job_id = ?
    ORDER BY m.final_score DESC
    """, (job_id,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["matched_skills"] = json.loads(d["matched_skills"])
        d["missing_skills"] = json.loads(d["missing_skills"])
        d["skills"] = json.loads(d["skills"])
        d["projects"] = json.loads(d["projects"])
        d["certifications"] = json.loads(d["certifications"])
        result.append(d)
    return result

def insert_audit_log(candidate_id: int, job_id: int, model_name: str, weights: Dict[str, float],
                     information_used: List[str], information_excluded: List[str], final_score: float) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO audit_logs (candidate_id, job_id, model_name, weights, information_used, information_excluded, final_score)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        candidate_id, job_id, model_name,
        json.dumps(weights),
        json.dumps(information_used),
        json.dumps(information_excluded),
        final_score
    ))
    aid = cursor.lastrowid
    conn.commit()
    conn.close()
    return aid

def get_audit_logs(candidate_id: Optional[int] = None, job_id: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = """
    SELECT a.*, c.candidate_code, j.title as job_title
    FROM audit_logs a
    JOIN candidates c ON a.candidate_id = c.id
    JOIN jobs j ON a.job_id = j.id
    """
    params = []
    conditions = []
    if candidate_id:
        conditions.append("a.candidate_id = ?")
        params.append(candidate_id)
    if job_id:
        conditions.append("a.job_id = ?")
        params.append(job_id)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY a.id DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["weights"] = json.loads(d["weights"])
        d["information_used"] = json.loads(d["information_used"])
        d["information_excluded"] = json.loads(d["information_excluded"])
        result.append(d)
    return result

def get_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM jobs")
    total_jobs = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM candidates")
    total_candidates = cursor.fetchone()["count"]

    cursor.execute("SELECT AVG(final_score) as avg_score FROM matches")
    avg_score = cursor.fetchone()["avg_score"]
    avg_score = round(avg_score, 1) if avg_score is not None else 0.0

    cursor.execute("SELECT missing_skills FROM matches")
    all_missing = cursor.fetchall()
    skill_gaps_count = 0
    for row in all_missing:
        try:
            skill_gaps_count += len(json.loads(row["missing_skills"]))
        except Exception:
            pass

    conn.close()
    return {
        "total_jobs": total_jobs,
        "total_candidates": total_candidates,
        "average_match_score": avg_score,
        "skill_gaps_detected": skill_gaps_count
    }

# User DAO Methods
def create_user(name: str, email: str, password_hash: str, role: str, organization: str = "", avatar_url: str = "") -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (name, email, password_hash, role, organization, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (name.strip(), email.strip().lower(), password_hash, role.strip().lower(), organization.strip(), avatar_url.strip()))
    uid = cursor.lastrowid
    conn.commit()
    conn.close()
    return uid

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def get_all_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, organization, avatar_url, created_at FROM users ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

