import json
import re
from pathlib import Path
from typing import List, Dict, Any, Set

SKILLS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "skills.json"

class SkillExtractor:
    def __init__(self, skills_path: Path = SKILLS_FILE):
        self.skills_db: List[Dict[str, Any]] = []
        self.skill_lookup: Dict[str, Dict[str, Any]] = {}
        self.pattern_map: Dict[str, re.Pattern] = {}
        self._load_skills(skills_path)

    def _load_skills(self, skills_path: Path):
        if not skills_path.exists():
            return
        with open(skills_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.skills_db = data.get("skills", [])
            
        for item in self.skills_db:
            canonical_name = item["name"]
            self.skill_lookup[canonical_name.lower()] = item
            
            # Map canonical name and all aliases
            all_forms = [canonical_name] + item.get("aliases", [])
            for form in all_forms:
                # Escape regex special characters like C++, C#, .NET
                escaped = re.escape(form)
                # Word boundaries: if it starts/ends with alphanumeric, require \b
                start_b = r'\b' if form[0].isalnum() else ''
                end_b = r'\b' if form[-1].isalnum() else ''
                pat = re.compile(rf"{start_b}{escaped}{end_b}", re.IGNORECASE)
                self.pattern_map[canonical_name] = pat

    def extract_skills(self, text: str) -> List[str]:
        """Extracts unique normalized canonical skill names found in the text."""
        found_skills: Set[str] = set()
        
        # Exact/alias pattern search
        for item in self.skills_db:
            canonical_name = item["name"]
            all_forms = [canonical_name] + item.get("aliases", [])
            for form in all_forms:
                escaped = re.escape(form)
                start_b = r'\b' if form[0].isalnum() else ''
                end_b = r'\b' if form[-1].isalnum() else ''
                pat = re.compile(rf"{start_b}{escaped}{end_b}", re.IGNORECASE)
                if pat.search(text):
                    found_skills.add(canonical_name)
                    break

        return sorted(list(found_skills))

    def get_skill_details(self, skill_name: str) -> Dict[str, Any]:
        """Returns details for a canonical skill, including category and learning suggestions."""
        key = skill_name.lower()
        if key in self.skill_lookup:
            return self.skill_lookup[key]
        return {
            "name": skill_name,
            "category": "Other",
            "aliases": [],
            "learning_suggestions": [
                f"{skill_name} Core Concepts & Best Practices",
                f"Hands-on Project with {skill_name}",
                f"{skill_name} Production Troubleshooting"
            ]
        }
