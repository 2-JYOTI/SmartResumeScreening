from utils.pdf_extractor import extract_text_from_pdf
from utils.preprocessor import clean_text
from utils.vectorizer import create_vectors
from utils.matcher import calculate_similarity

pdf_path = "resumes/sample_resume.pdf"

job_description = """
Looking for a Python Developer with Flask,
Machine Learning, SQL, APIs, React and MongoDB.
"""

raw_text = extract_text_from_pdf(pdf_path)

cleaned_resume = clean_text(raw_text)
cleaned_job = clean_text(job_description)

vectors = create_vectors(
    cleaned_resume,
    cleaned_job
)

score = calculate_similarity(vectors)

print("===== MATCH SCORE =====")
print(f"Resume Match Score: {score:.2f}%")

