from flask import Flask, render_template, request
import os
from tempfile import gettempdir
from werkzeug.utils import secure_filename

from utils.pdf_extractor import extract_text_from_pdf
from utils.ats_analyzer import analyze_resume


app = Flask(__name__)

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join(gettempdir(), "resumes"))
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


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

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    file.save(filepath)



    job_description = request.form.get("job_description", "")
    resume_text = extract_text_from_pdf(filepath)
    analysis = analyze_resume(resume_text, job_description)

    return render_template(
     "result.html",
      **analysis,
    )


if __name__ == "__main__":
 app.run(debug=True)
