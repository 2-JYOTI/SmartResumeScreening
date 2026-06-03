from utils.skill_matcher import find_missing_skills

resume_skills = [
    "python",
    "flask",
    "mongodb"
]

job_skills = [
    "python",
    "flask",
    "mongodb",
    "docker",
    "aws"
]

missing = find_missing_skills(
    resume_skills,
    job_skills
)

print(missing)
