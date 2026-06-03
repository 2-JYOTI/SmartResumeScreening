from utils.skill_matcher import find_missing_skills
from utils.skill_extractor import extract_skills
from flask import Flask, render_template, request
import os

from utils.pdf_extractor import extract_text_from_pdf
from utils.preprocessor import clean_text
from utils.vectorizer import create_vectors
from utils.matcher import calculate_similarity


app = Flask(__name__)

UPLOAD_FOLDER = "resumes"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/match", methods=["POST"])
def match_resume():

    if "resume" not in request.files:
        return "No file uploaded"

    file = request.files["resume"]

    if file.filename == "":
        return "No selected file"

    filepath = os.path.join(
      app.config["UPLOAD_FOLDER"],
        file.filename
    )

    file.save(filepath)



    job_description = request.form["job_description"]
    resume_text = extract_text_from_pdf(filepath)
    cleaned_resume = clean_text(resume_text)
    cleaned_job = clean_text(job_description)

    vectors = create_vectors(
      cleaned_resume,
        cleaned_job
    )

    score = calculate_similarity(vectors)
    resume_skills = extract_skills(cleaned_resume)
    job_skills = extract_skills(cleaned_job)
    missing_skills = find_missing_skills(
      resume_skills,
        job_skills
    )


    roadmap = {}

    if "flask" in missing_skills:
        roadmap["Flask"] = [
         "Flask Routing",
          "Jinja Templates",
           "REST APIs"
        ]

    if "sql" in missing_skills:
        roadmap["SQL"] = [
         "SELECT Queries",
          "JOIN",
           "GROUP BY"
        ]

    if "aws" in missing_skills:
        roadmap["AWS"] = [
         "EC2",
          "S3",
          "IAM"
        ]

    if "docker" in missing_skills:
        roadmap["Docker"] = [
         "Containers",
          "Dockerfile",
           "Docker Compose"
        ]
    

    recommendations = []

    if score < 40:
        recommendations.append("Your resume has a low match score. Add more keywords from the job description.")

    if len(missing_skills) > 0:
        recommendations.append("Consider learning or adding these skills: " +   ", ".join(missing_skills))

    if score >= 70:
        recommendations.append("Great match! Your resume aligns well with the job description.")

    return render_template(
     "result.html",
      score=round(score, 2),
       resume_skills=resume_skills,
        job_skills=job_skills,
         missing_skills=missing_skills,
          recommendations=recommendations,
           roadmap=roadmap,
    )


if __name__ == "__main__":
 app.run(debug=True)
