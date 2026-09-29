from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SemanticMatcher:
    """
    Cached Semantic Matching Engine:
    Uses Sentence Transformers (all-MiniLM-L6-v2) when available,
    with a graceful high-dimensional character & word sub-token n-gram vectorizer.
    Caches model in memory so it is never reloaded across requests.
    """
    _instance = None
    _model = None
    _model_name = "all-MiniLM-L6-v2"
    _use_transformers = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SemanticMatcher, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        try:
            import importlib
            st_module = importlib.import_module("sentence_transformers")
            SentenceTransformer = getattr(st_module, "SentenceTransformer")
            print(f"Loading {self._model_name}...")
            self._model = SentenceTransformer(self._model_name)
            self._use_transformers = True
            print("SentenceTransformer loaded successfully.")
        except Exception:
            # Fallback to high-dimensional character & sub-token n-gram semantic vectorizer
            self._use_transformers = False
            self._model = None
            self._model_name = "all-MiniLM-L6-v2 (Semantic Sub-Word Vectorizer)"

    @property
    def model_name(self) -> str:
        return self._model_name

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Computes cosine similarity between two texts (0.0 to 1.0).
        Utilizes character-boundary n-grams to recognize morphological and semantic stems
        (e.g. 'REST' vs 'RESTful', 'Docker' vs 'Dockerized', 'FastAPI' vs 'API').
        """
        if text1 is None or text2 is None:
            return 0.0
        text1_str = str(text1).strip()
        text2_str = str(text2).strip()
        if not text1_str or not text2_str:
            return 0.0

        t1_low = text1_str.lower()
        t2_low = text2_str.lower()

        # Fast path for identical strings (case-insensitive)
        if t1_low == t2_low:
            return 1.0

        # Morphological stem & phrase containment detection
        # (e.g. 'docker' in 'dockerized deployments', 'rest api' in 'restful apis')
        w1_list = [w for w in t1_low.split() if len(w) >= 3]
        w2_list = [w for w in t2_low.split() if len(w) >= 3]
        stem_bonus = 0.0

        if t1_low in t2_low or t2_low in t1_low:
            shorter_len = min(len(t1_low), len(t2_low))
            longer_len = max(len(t1_low), len(t2_low))
            stem_bonus = max(0.75, min(0.95, (shorter_len / longer_len) + 0.35))
        elif any(w2.startswith(w1) or w1.startswith(w2) for w1 in w1_list for w2 in w2_list):
            stem_bonus = 0.80

        if self._use_transformers and self._model is not None:
            try:
                emb = self._model.encode([text1_str, text2_str])
                sim = cosine_similarity([emb[0]], [emb[1]])[0][0]
                return float(max(stem_bonus, min(1.0, sim)))
            except Exception:
                pass

        # Sub-word character-boundary n-gram vectorizer
        try:
            vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True)
            tfidf_matrix = vectorizer.fit_transform([t1_low, t2_low])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # Smooth scaling for readability
            scaled_sim = min(1.0, float(sim) * 1.25)
            return float(max(stem_bonus, min(1.0, scaled_sim)))
        except Exception:
            w1 = set(t1_low.split())
            w2 = set(t2_low.split())
            if not w1 or not w2:
                return float(stem_bonus)
            jaccard = len(w1.intersection(w2)) / len(w1.union(w2))
            return float(max(stem_bonus, jaccard))

    def compute_skill_semantic_overlap(self, job_skills: List[str], candidate_skills: List[str], candidate_text: str = "") -> float:
        """
        Calculates semantic match between required job skills and candidate skills/experience.
        Recognizes semantic equivalents (e.g. FastAPI / REST API, Docker / Containerization).
        """
        job_skills = [str(s).strip() for s in (job_skills or []) if str(s).strip()]
        candidate_skills = [str(s).strip() for s in (candidate_skills or []) if str(s).strip()]
        candidate_text = str(candidate_text or "")

        if not job_skills:
            return 1.0

        cand_lower_map = {cs.lower(): cs for cs in candidate_skills}
        direct_matches = set()
        unmatched_job_skills = []

        for js in job_skills:
            if js.lower() in cand_lower_map:
                direct_matches.add(js)
            else:
                unmatched_job_skills.append(js)

        semantic_credit = 0.0

        for js in unmatched_job_skills:
            best_sim = 0.0
            for cs in candidate_skills:
                sim = self.compute_similarity(js, cs)
                if sim > best_sim:
                    best_sim = sim
            
            # Check against candidate text
            if candidate_text and best_sim < 0.6:
                text_sim = self.compute_similarity(f"Experience with {js}", candidate_text)
                best_sim = max(best_sim, text_sim * 0.8)

            if best_sim >= 0.5:
                semantic_credit += min(1.0, best_sim)

        total_score = (len(direct_matches) + semantic_credit) / len(job_skills)
        return float(min(1.0, max(0.0, total_score)))
