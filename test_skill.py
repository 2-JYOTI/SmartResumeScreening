from utils.skill_extractor import extract_skills

sample_text = """
I know Python, Flask, React, MongoDB and Machine Learning.
"""

skills = extract_skills(sample_text)

print(skills)
