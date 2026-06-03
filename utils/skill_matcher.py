def find_missing_skills(resume_skills, job_skills):

    missing = []

    for skill in job_skills:
        if skill not in resume_skills:
            missing.append(skill)

    return missing

