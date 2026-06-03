from sklearn.feature_extraction.text import TfidfVectorizer

def create_vectors(resume_text, job_description):
    vectorizer = TfidfVectorizer()

    vectors = vectorizer.fit_transform(
        [resume_text, job_description]
    )

    return vectors
