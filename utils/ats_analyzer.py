import re
from collections import Counter, defaultdict
from math import log, sqrt


STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "have", "in", "into", "is", "it", "its", "of", "on", "or", "our", "that",
    "the", "their", "this", "to", "using", "with", "will", "you", "your"
}

SECTION_HEADERS = {
    "summary": ("summary", "profile", "objective", "about"),
    "skills": ("skills", "technical skills", "core skills", "technologies"),
    "experience": ("experience", "work experience", "employment", "professional experience"),
    "projects": ("projects", "project experience", "academic projects"),
    "education": ("education", "academics", "qualification", "qualifications"),
    "certifications": ("certifications", "certificates", "licenses", "training"),
}

SKILL_CATALOG = {
    "Python": {
        "aliases": ("python", "py"),
        "category": "Technical Skills",
        "recommendation": "Build Python projects that show clean code, APIs, data handling, and testing.",
    },
    "Java": {"aliases": ("java",), "category": "Technical Skills"},
    "C": {"aliases": (" c ", "c language"), "category": "Technical Skills"},
    "C++": {"aliases": ("c++", "cpp"), "category": "Technical Skills"},
    "JavaScript": {"aliases": ("javascript", "java script", "js", "ecmascript"), "category": "Technical Skills"},
    "TypeScript": {"aliases": ("typescript", "ts"), "category": "Technical Skills"},
    "HTML": {"aliases": ("html", "html5"), "category": "Technical Skills"},
    "CSS": {"aliases": ("css", "css3"), "category": "Technical Skills"},
    "React": {"aliases": ("react", "reactjs", "react.js"), "category": "Frameworks"},
    "Node.js": {"aliases": ("node.js", "nodejs", "node js", "node"), "category": "Frameworks"},
    "Express.js": {"aliases": ("express.js", "expressjs", "express"), "category": "Frameworks"},
    "Flask": {"aliases": ("flask",), "category": "Frameworks", "recommendation": "Practice Flask routing, Jinja templates, blueprints, and REST API design."},
    "FastAPI": {"aliases": ("fastapi", "fast api"), "category": "Frameworks"},
    "Django": {"aliases": ("django",), "category": "Frameworks"},
    "REST API": {"aliases": ("rest api", "rest apis", "restful api", "api development"), "category": "Technical Skills"},
    "Machine Learning": {"aliases": ("machine learning", "ml", "machine-learning"), "category": "Technical Skills"},
    "Artificial Intelligence": {"aliases": ("artificial intelligence", "ai"), "category": "Technical Skills"},
    "Deep Learning": {"aliases": ("deep learning", "dl"), "category": "Technical Skills"},
    "NLP": {"aliases": ("nlp", "natural language processing"), "category": "Technical Skills"},
    "Data Science": {"aliases": ("data science", "data scientist"), "category": "Technical Skills"},
    "Pandas": {"aliases": ("pandas",), "category": "Technical Skills"},
    "NumPy": {"aliases": ("numpy", "num py"), "category": "Technical Skills"},
    "Scikit-learn": {"aliases": ("scikit-learn", "scikit learn", "sklearn"), "category": "Technical Skills"},
    "TensorFlow": {"aliases": ("tensorflow", "tensor flow"), "category": "Frameworks"},
    "PyTorch": {"aliases": ("pytorch", "py torch"), "category": "Frameworks"},
    "SQL": {"aliases": ("sql", "structured query language"), "category": "Databases", "recommendation": "Refresh SQL joins, grouping, indexing basics, and query optimization."},
    "MySQL": {"aliases": ("mysql", "my sql"), "category": "Databases"},
    "PostgreSQL": {"aliases": ("postgresql", "postgres", "postgre sql"), "category": "Databases"},
    "MongoDB": {"aliases": ("mongodb", "mongo db", "mongo"), "category": "Databases"},
    "Git": {"aliases": ("git", "version control"), "category": "Tools"},
    "GitHub": {"aliases": ("github", "git hub"), "category": "Tools"},
    "Docker": {"aliases": ("docker", "dockerfile", "containers", "containerization"), "category": "Tools", "recommendation": "Learn Docker Fundamentals: images, containers, Dockerfile, volumes, and Docker Compose."},
    "Kubernetes": {"aliases": ("kubernetes", "k8s"), "category": "Tools", "recommendation": "Learn Kubernetes basics: pods, deployments, services, config maps, and scaling."},
    "AWS": {"aliases": ("aws", "amazon web services"), "category": "Cloud", "recommendation": "Earn AWS Cloud Practitioner or build a small EC2, S3, IAM deployment project."},
    "AWS Lambda": {"aliases": ("aws lambda", "lambda functions", "serverless lambda"), "category": "Cloud"},
    "Azure": {"aliases": ("azure", "microsoft azure"), "category": "Cloud"},
    "Google Cloud": {"aliases": ("google cloud", "gcp", "google cloud platform"), "category": "Cloud"},
    "Communication": {"aliases": ("communication", "communicator", "presentation"), "category": "Soft Skills"},
    "Teamwork": {"aliases": ("teamwork", "collaboration", "collaborative"), "category": "Soft Skills"},
    "Leadership": {"aliases": ("leadership", "led team", "team lead"), "category": "Soft Skills"},
    "Problem Solving": {"aliases": ("problem solving", "analytical thinking", "debugging"), "category": "Soft Skills"},
}

CONCEPT_GROUPS = {
    "api": {"rest api", "api development", "endpoint", "flask", "fastapi", "django"},
    "machine_learning_framework": {"tensorflow", "pytorch", "scikit learn", "sklearn", "machine learning framework"},
    "cloud": {"aws", "amazon web services", "azure", "gcp", "google cloud", "lambda"},
    "database": {"sql", "mysql", "postgresql", "mongodb", "database"},
    "container": {"docker", "kubernetes", "container", "containerization"},
}

DEGREE_LEVELS = {
    "phd": 5,
    "doctorate": 5,
    "master": 4,
    "m.tech": 4,
    "mca": 4,
    "mba": 4,
    "bachelor": 3,
    "b.tech": 3,
    "bca": 3,
    "b.sc": 3,
    "degree": 2,
    "diploma": 1,
}


def normalize_text(text):
    text = (text or "").lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9+#.\s-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokenize(text):
    tokens = re.findall(r"[a-z0-9+#.-]+", normalize_text(text))
    return [stem_token(token) for token in tokens if token not in STOPWORDS and len(token) > 1]


def stem_token(token):
    if len(token) > 5 and token.endswith("ing"):
        return token[:-3]
    if len(token) > 4 and token.endswith("ed"):
        return token[:-2]
    if len(token) > 4 and token.endswith("es"):
        return token[:-2]
    if len(token) > 3 and token.endswith("s") and token not in {"aws", "css"}:
        return token[:-1]
    return token


def split_sections(text):
    normalized = text or ""
    lines = normalized.splitlines()
    sections = defaultdict(list)
    current = "summary"

    for line in lines:
        clean_line = normalize_text(line).strip(" :-")
        matched_section = None
        for section, headers in SECTION_HEADERS.items():
            if clean_line in headers or any(clean_line.startswith(header + " ") for header in headers):
                matched_section = section
                break
        if matched_section:
            current = matched_section
            continue
        sections[current].append(line)

    return {name: "\n".join(values).strip() for name, values in sections.items()}


def _contains_alias(text, alias):
    if alias.startswith(" ") or alias.endswith(" "):
        return alias in f" {text} "
    escaped = re.escape(alias).replace(r"\ ", r"\s+")
    return re.search(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", text) is not None


def extract_skill_details(text):
    normalized = normalize_text(text)
    sections = split_sections(text)
    found = {}

    for skill, meta in SKILL_CATALOG.items():
        aliases = meta.get("aliases", ())
        if any(_contains_alias(normalized, alias) for alias in aliases):
            evidence_sections = []
            for section, section_text in sections.items():
                section_normalized = normalize_text(section_text)
                if any(_contains_alias(section_normalized, alias) for alias in aliases):
                    evidence_sections.append(section)
            found[skill] = {
                "name": skill,
                "category": meta.get("category", "Technical Skills"),
                "sections": evidence_sections or ["summary"],
                "recommendation": meta.get("recommendation", f"Learn {skill} fundamentals and add a practical project."),
            }

    return found


def extract_skills(text):
    return sorted(extract_skill_details(text))


def categorize_skills(skills):
    categories = {
        "Technical Skills": [],
        "Frameworks": [],
        "Tools": [],
        "Cloud": [],
        "Databases": [],
        "Soft Skills": [],
    }
    for skill in skills:
        category = SKILL_CATALOG.get(skill, {}).get("category", "Technical Skills")
        categories.setdefault(category, []).append(skill)
    return {category: sorted(values) for category, values in categories.items() if values}


def tfidf_vectors(text_a, text_b):
    documents = [tokenize(text_a), tokenize(text_b)]
    vocabulary = sorted(set(documents[0]) | set(documents[1]))
    vectors = []

    for document in documents:
        counts = Counter(document)
        total = len(document) or 1
        vector = []
        for term in vocabulary:
            tf = counts[term] / total
            containing_docs = sum(1 for doc in documents if term in doc)
            idf = log((len(documents) + 1) / (containing_docs + 1)) + 1
            vector.append(tf * idf)
        vectors.append(vector)

    return vectors


def cosine_similarity(vector_a, vector_b):
    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
    magnitude_a = sqrt(sum(value * value for value in vector_a))
    magnitude_b = sqrt(sum(value * value for value in vector_b))
    if magnitude_a == 0 or magnitude_b == 0:
        return 0
    return dot_product / (magnitude_a * magnitude_b)


def text_similarity(text_a, text_b):
    vectors = tfidf_vectors(text_a, text_b)
    lexical_score = cosine_similarity(vectors[0], vectors[1])
    concept_score = concept_similarity(text_a, text_b)
    return round((lexical_score * 0.72 + concept_score * 0.28) * 100, 2)


def concept_similarity(text_a, text_b):
    text_a = normalize_text(text_a)
    text_b = normalize_text(text_b)
    matched = 0
    possible = 0

    for aliases in CONCEPT_GROUPS.values():
        in_a = any(alias in text_a for alias in aliases)
        in_b = any(alias in text_b for alias in aliases)
        if in_a or in_b:
            possible += 1
        if in_a and in_b:
            matched += 1

    return matched / possible if possible else 0


def skill_match_score(resume_skills, job_skills):
    if not job_skills:
        return 0
    exact_matches = set(resume_skills) & set(job_skills)
    partial = 0
    for job_skill in set(job_skills) - exact_matches:
        job_category = SKILL_CATALOG.get(job_skill, {}).get("category")
        if any(SKILL_CATALOG.get(skill, {}).get("category") == job_category for skill in resume_skills):
            partial += 0.35
    return round(min(100, ((len(exact_matches) + partial) / len(set(job_skills))) * 100), 2)


def extract_years(text):
    normalized = normalize_text(text)
    values = [float(match) for match in re.findall(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)", normalized)]
    return max(values) if values else 0


def experience_score(resume_text, job_text):
    required_years = extract_years(job_text)
    resume_years = extract_years(resume_text)
    if required_years:
        years_score = min(1, resume_years / required_years)
    else:
        years_score = 0.65 if resume_years else 0.45
    semantic = text_similarity(split_sections(resume_text).get("experience", resume_text), job_text) / 100
    return round((years_score * 0.58 + semantic * 0.42) * 100, 2)


def education_level(text):
    normalized = normalize_text(text)
    return max((level for keyword, level in DEGREE_LEVELS.items() if keyword in normalized), default=0)


def education_score(resume_text, job_text):
    required = education_level(job_text)
    candidate = education_level(resume_text)
    if not required:
        return 100 if candidate else 75
    if candidate >= required:
        return 100
    if candidate == 0:
        return 35
    return round((candidate / required) * 100, 2)


def section_score(resume_text, job_text, section_name, fallback):
    section = split_sections(resume_text).get(section_name, "")
    if not section:
        return fallback
    return max(fallback, text_similarity(section, job_text))


def certification_score(resume_text, job_text):
    resume_section = split_sections(resume_text).get("certifications", "")
    job_mentions_cert = bool(re.search(r"\b(certification|certified|certificate|aws practitioner|azure fundamentals)\b", normalize_text(job_text)))
    resume_has_cert = bool(resume_section or re.search(r"\b(certification|certified|certificate)\b", normalize_text(resume_text)))
    if job_mentions_cert and resume_has_cert:
        return max(70, text_similarity(resume_section or resume_text, job_text))
    if job_mentions_cert:
        return 35
    return 100 if resume_has_cert else 70


def priority_for_missing(skill, job_text):
    normalized = normalize_text(job_text)
    aliases = SKILL_CATALOG.get(skill, {}).get("aliases", ())
    mentions = sum(normalized.count(alias) for alias in aliases)
    if mentions >= 2 or re.search(rf"(required|must have|mandatory).{{0,45}}{re.escape(normalize_text(skill))}", normalized):
        return "High Priority"
    category = SKILL_CATALOG.get(skill, {}).get("category")
    if category in {"Technical Skills", "Frameworks", "Cloud", "Databases", "Tools"}:
        return "Medium Priority"
    return "Low Priority"


def build_missing_skills(resume_skills, job_skills, job_text):
    missing = []
    for skill in sorted(set(job_skills) - set(resume_skills)):
        meta = SKILL_CATALOG.get(skill, {})
        missing.append({
            "name": skill,
            "priority": priority_for_missing(skill, job_text),
            "recommendation": meta.get("recommendation", f"Learn {skill} fundamentals and add evidence of hands-on use."),
        })
    priority_order = {"High Priority": 0, "Medium Priority": 1, "Low Priority": 2}
    return sorted(missing, key=lambda item: (priority_order[item["priority"]], item["name"]))


def build_recruiter_feedback(resume_skills, job_skills, missing_skills, score_breakdown):
    matched = sorted(set(resume_skills) & set(job_skills))
    strengths = []
    weaknesses = []

    if matched:
        strengths.append(f"Strong alignment on {', '.join(matched[:4])}.")
    if score_breakdown["Projects Match"] >= 70:
        strengths.append("Projects show relevant experience for the target role.")
    if score_breakdown["Education Match"] >= 90:
        strengths.append("Education profile satisfies the role expectations.")

    high_priority = [item["name"] for item in missing_skills if item["priority"] == "High Priority"]
    if high_priority:
        weaknesses.append(f"Missing high-priority skills: {', '.join(high_priority[:4])}.")
    if score_breakdown["Certifications"] < 60:
        weaknesses.append("Certifications are weak or not clearly visible for this role.")
    if score_breakdown["Experience Match"] < 60:
        weaknesses.append("Experience section needs clearer role-specific evidence and measurable impact.")

    return {
        "strengths": strengths or ["Resume includes relevant baseline information for screening."],
        "weaknesses": weaknesses or ["No major weakness detected from tracked ATS criteria."],
    }


def analyze_resume(resume_text, job_text):
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)
    missing_skills = build_missing_skills(resume_skills, job_skills, job_text)
    matched_skills = sorted(set(resume_skills) & set(job_skills))

    scores = {
        "Skills Match": skill_match_score(resume_skills, job_skills),
        "Experience Match": experience_score(resume_text, job_text),
        "Education Match": education_score(resume_text, job_text),
        "Projects Match": section_score(resume_text, job_text, "projects", text_similarity(resume_text, job_text) * 0.72),
        "Certifications": certification_score(resume_text, job_text),
    }
    weights = {
        "Skills Match": 0.40,
        "Experience Match": 0.20,
        "Education Match": 0.15,
        "Projects Match": 0.15,
        "Certifications": 0.10,
    }
    final_score = round(sum(scores[name] * weight for name, weight in weights.items()), 2)
    recruiter_feedback = build_recruiter_feedback(resume_skills, job_skills, missing_skills, scores)

    recommendations = [item["recommendation"] for item in missing_skills[:5]]
    if final_score < 70:
        recommendations.insert(0, "Add role-specific keywords from the job description in the summary, skills, and project bullets.")
    if scores["Experience Match"] < 65:
        recommendations.append("Rewrite experience bullets with metrics, tools used, and direct outcomes.")
    if scores["Projects Match"] < 65:
        recommendations.append("Add projects that mirror the job responsibilities and mention the target tech stack.")
    if not recommendations:
        recommendations.append("Resume is well aligned; keep achievements quantified and tailored to the job description.")

    return {
        "score": final_score,
        "score_breakdown": scores,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "job_categories": categorize_skills(job_skills),
        "resume_categories": categorize_skills(resume_skills),
        "recommendations": list(dict.fromkeys(recommendations)),
        "strengths": recruiter_feedback["strengths"],
        "weaknesses": recruiter_feedback["weaknesses"],
        "ats_compatibility_score": round((scores["Skills Match"] * 0.45 + scores["Experience Match"] * 0.35 + scores["Education Match"] * 0.20), 2),
        "keyword_optimization_score": scores["Skills Match"],
        "required_skills_count": len(job_skills),
        "matched_skills_count": len(matched_skills),
        "missing_skills_count": len(missing_skills),
    }
