from math import sqrt

def calculate_similarity(vectors):
    resume_vector, job_vector = vectors
    dot_product = sum(a * b for a, b in zip(resume_vector, job_vector))
    resume_magnitude = sqrt(sum(value * value for value in resume_vector))
    job_magnitude = sqrt(sum(value * value for value in job_vector))

    if resume_magnitude == 0 or job_magnitude == 0:
        return 0

    return (dot_product / (resume_magnitude * job_magnitude)) * 100
