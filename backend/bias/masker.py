import re
from typing import Dict, Any, List, Tuple

# Sensitive attribute regex patterns
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', re.IGNORECASE)
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b|\b\+?\d{1,4}[-.\s]?\d{6,12}\b')
URL_REGEX = re.compile(r'https?://[^\s]+|www\.[^\s]+|linkedin\.com/in/[^\s]+|github\.com/[^\s]+', re.IGNORECASE)
GENDER_REGEX = re.compile(r'\b(male|female|non-binary|genderqueer|man|woman|he/him|she/her|they/them|mr\.|mrs\.|ms\.|miss)\b', re.IGNORECASE)
DEMOGRAPHIC_REGEX = re.compile(r'\b(caste|hindu|muslim|christian|sikh|jain|buddhist|sc/st|obc|general category|brahmin|dalit|marital status|unmarried|married|single|dob|date of birth)\b', re.IGNORECASE)
PHOTO_REGEX = re.compile(r'(\[photo\]|\[image\]|\[headshot\]|photograph|profile picture)', re.IGNORECASE)
ADDRESS_REGEX = re.compile(r'\b(address|residence|house no|flat no|street|pincode|zip code|postal code|apt \d+)\b[:\s\-]+[^\n,]+', re.IGNORECASE)

class IdentityMasker:
    """
    Core Responsible-AI Masking Component:
    Detects and scrubs personally identifiable information (PII) and demographic markers
    to ensure matching is strictly based on job-relevant qualification signals.
    """

    @classmethod
    def mask_resume(cls, text: str, candidate_code: str = "CAND-001") -> Dict[str, Any]:
        """
        Masks identity-related information and produces a job-relevant candidate profile.
        """
        excluded_info = []
        masked_text = text

        # 1. Mask Email
        if EMAIL_REGEX.search(masked_text):
            masked_text = EMAIL_REGEX.sub("[MASKED_EMAIL]", masked_text)
            excluded_info.append("Email Address")

        # 2. Mask Phone Number
        if PHONE_REGEX.search(masked_text):
            masked_text = PHONE_REGEX.sub("[MASKED_PHONE]", masked_text)
            excluded_info.append("Phone Number")

        # 3. Mask URLs (LinkedIn, personal portfolios, social)
        if URL_REGEX.search(masked_text):
            masked_text = URL_REGEX.sub("[MASKED_URL]", masked_text)
            excluded_info.append("Personal URLs & Social Links")

        # 4. Mask Photo indicators
        if PHOTO_REGEX.search(masked_text):
            masked_text = PHOTO_REGEX.sub("[MASKED_PHOTO]", masked_text)
            excluded_info.append("Photograph / Visual Appearance")

        # 5. Mask Gender & Honorifics
        if GENDER_REGEX.search(masked_text):
            masked_text = GENDER_REGEX.sub("[MASKED_GENDER]", masked_text)
            excluded_info.append("Gender / Pronouns")

        # 6. Mask Demographic / Caste / Religion / Marital indicators
        if DEMOGRAPHIC_REGEX.search(masked_text):
            masked_text = DEMOGRAPHIC_REGEX.sub("[MASKED_DEMOGRAPHIC]", masked_text)
            excluded_info.append("Caste / Religion / Demographic Indicators")

        # 7. Mask Physical Address / Location specifics
        if ADDRESS_REGEX.search(masked_text):
            masked_text = ADDRESS_REGEX.sub("[MASKED_LOCATION]", masked_text)
            excluded_info.append("Home Address / Location")

        # 8. Name Masking
        # Resumes typically have the candidate's name on line 1 or under 'Name:'
        lines = [line.strip() for line in masked_text.splitlines() if line.strip()]
        candidate_name_detected = None
        
        if lines:
            first_line = lines[0]
            # Check if first line resembles a name (e.g. 2-4 words, no special punctuation, short)
            if (len(first_line.split()) in [1, 2, 3, 4] and 
                not any(kw in first_line.lower() for kw in ['resume', 'curriculum', 'cv', 'summary', 'profile', 'experience', 'education'])):
                candidate_name_detected = first_line
                masked_text = masked_text.replace(first_line, f"[CANDIDATE_ID: {candidate_code}]")
                excluded_info.append("Candidate Full Name")

        # Also check for explicit "Name:" labels
        name_match = re.search(r'\b(name|full name)\s*:\s*([A-Za-z\s]+)', masked_text, re.IGNORECASE)
        if name_match:
            detected = name_match.group(2).strip()
            if detected and detected not in [candidate_code, f"[CANDIDATE_ID: {candidate_code}]"]:
                candidate_name_detected = detected
                masked_text = masked_text.replace(detected, f"[CANDIDATE_ID: {candidate_code}]")
                if "Candidate Full Name" not in excluded_info:
                    excluded_info.append("Candidate Full Name")

        # Always ensure standard excluded list has core categories if applicable
        if "Candidate Full Name" not in excluded_info:
            excluded_info.append("Candidate Full Name")
        if "Photograph / Visual Appearance" not in excluded_info:
            excluded_info.append("Photograph / Visual Appearance")

        information_used = [
            "Technical & Professional Skills",
            "Years of Work Experience",
            "Educational Background & Degrees",
            "Project Descriptions & Achievements",
            "Certifications & Accreditations"
        ]

        return {
            "candidate_code": candidate_code,
            "detected_name": candidate_name_detected,
            "masked_text": masked_text,
            "information_used": information_used,
            "information_excluded": sorted(list(set(excluded_info))),
            "fairness_policy": "Selected identity attributes are excluded from the ranking pipeline."
        }
