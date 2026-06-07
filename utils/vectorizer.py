from collections import Counter
from math import log
from utils.ats_analyzer import tokenize

def create_vectors(resume_text, job_description):
    documents = [
        tokenize(resume_text),
        tokenize(job_description)
    ]
    vocabulary = sorted(set(documents[0]) | set(documents[1]))
    document_count = len(documents)
    vectors = []

    for document in documents:
        term_counts = Counter(document)
        total_terms = len(document) or 1
        vector = []

        for term in vocabulary:
            term_frequency = term_counts[term] / total_terms
            containing_docs = sum(1 for doc in documents if term in doc)
            inverse_doc_frequency = log((document_count + 1) / (containing_docs + 1)) + 1
            vector.append(term_frequency * inverse_doc_frequency)

        vectors.append(vector)

    return vectors
