SKILLS_DB = [
    "python",
    "java",
    "c",
    "c++",
    "javascript",
    "html",
    "css",
    "react",
    "node.js",
    "mongodb",
    "sql",
    "mysql",
    "flask",
    "fastapi",
    "django",
    "machine learning",
    "deep learning",
    "nlp",
    "data science",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "git",
    "github"
]

def extract_skills(text):
    text = text.lower()

    found_skills = []

    for skill in SKILLS_DB:
        if skill.lower() in text:
            found_skills.append(skill)

    return list(set(found_skills))
