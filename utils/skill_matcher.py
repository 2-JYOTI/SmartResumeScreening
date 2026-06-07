from utils.ats_analyzer import normalize_text


def find_missing_skills(resume_skills, job_skills):
    resume_lookup = {normalize_text(skill) for skill in resume_skills}
    missing = []

    for skill in job_skills:
        if normalize_text(skill) not in resume_lookup:
            missing.append(skill)

    return sorted(set(missing))
