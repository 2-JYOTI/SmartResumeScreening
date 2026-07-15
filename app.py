from flask import Flask, abort, g, render_template, request
import json
import os
import sqlite3
from contextlib import closing
from tempfile import gettempdir
from werkzeug.utils import secure_filename

from utils.pdf_extractor import extract_text_from_pdf
from utils.ats_analyzer import analyze_resume


app = Flask(__name__)

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", os.path.join(gettempdir(), "resumes"))
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
DATABASE_URL = os.environ.get("DATABASE_URL")
app.config["DATABASE"] = os.environ.get("DATABASE_PATH", os.path.join(app.instance_path, "resume_screening.db"))
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.instance_path, exist_ok=True)


def get_db():
    if "db" not in g:
        if DATABASE_URL:
            # Vercel uses short-lived serverless requests. Supabase's transaction
            # pooler is compatible when prepared statements are disabled.
            import psycopg
            from psycopg.rows import dict_row

            g.db = psycopg.connect(
                DATABASE_URL, row_factory=dict_row, prepare_threshold=None
            )
        else:
            g.db = sqlite3.connect(app.config["DATABASE"])
            g.db.row_factory = sqlite3.Row
    return g.db


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    statement = """
        CREATE TABLE IF NOT EXISTS analyses (
            id BIGSERIAL PRIMARY KEY,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            filename TEXT NOT NULL,
            score DOUBLE PRECISION NOT NULL,
            matched_skills_count INTEGER NOT NULL,
            missing_skills_count INTEGER NOT NULL,
            analysis_json TEXT NOT NULL
        )
    """ if DATABASE_URL else """
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            filename TEXT NOT NULL,
            score REAL NOT NULL,
            matched_skills_count INTEGER NOT NULL,
            missing_skills_count INTEGER NOT NULL,
            analysis_json TEXT NOT NULL
        )
    """
    with closing(db.cursor()) as cursor:
        cursor.execute(statement)
    db.commit()


@app.teardown_appcontext
def teardown_db(error=None):
    close_db(error)


with app.app_context():
    init_db()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/history")
def history():
    with closing(get_db().cursor()) as cursor:
        cursor.execute("""
            SELECT id, created_at, filename, score, matched_skills_count, missing_skills_count
            FROM analyses ORDER BY id DESC
        """)
        rows = cursor.fetchall()
    return render_template("history.html", analyses=rows)


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
    try:
        job_description = request.form.get("job_description", "")
        resume_text = extract_text_from_pdf(filepath)
        analysis = analyze_resume(resume_text, job_description)
    finally:
        # The PDF is required only while the report is generated.
        if os.path.exists(filepath):
            os.remove(filepath)

    values = (filename, analysis["score"], analysis["matched_skills_count"],
              analysis["missing_skills_count"], json.dumps(analysis))
    with closing(get_db().cursor()) as cursor:
        if DATABASE_URL:
            cursor.execute("""
                INSERT INTO analyses
                (filename, score, matched_skills_count, missing_skills_count, analysis_json)
                VALUES (%s, %s, %s, %s, %s) RETURNING id
            """, values)
            analysis_id = cursor.fetchone()["id"]
        else:
            cursor.execute("""
                INSERT INTO analyses
                (filename, score, matched_skills_count, missing_skills_count, analysis_json)
                VALUES (?, ?, ?, ?, ?)
            """, values)
            analysis_id = cursor.lastrowid
    get_db().commit()

    return render_template(
        "result.html",
        analysis_id=analysis_id,
        **analysis,
    )


@app.route("/analysis/<int:analysis_id>")
def view_analysis(analysis_id):
    with closing(get_db().cursor()) as cursor:
        placeholder = "%s" if DATABASE_URL else "?"
        cursor.execute(
            f"SELECT analysis_json FROM analyses WHERE id = {placeholder}", (analysis_id,)
        )
        row = cursor.fetchone()
    if row is None:
        abort(404)
    return render_template("result.html", analysis_id=analysis_id, **json.loads(row["analysis_json"]))


if __name__ == "__main__":
 app.run(debug=True)
