'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError('');
    if (!file) return setError('Please choose a PDF resume.');
    if (!jobDescription.trim()) return setError('Please paste a job description.');
    setLoading(true);
    const data = new FormData(); data.append('resume', file); data.append('job_description', jobDescription);
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Analysis could not be completed.');
      router.push(`/analysis/${body.id}`);
    } catch (err) { setError(err.message); setLoading(false); }
  }

  return <main>
    <header className="header"><a className="brand" href="/">AI <span>Smart Resume Screening</span></a><nav><a href="#how">How it works</a><a href="/history">Saved analyses</a></nav></header>
    <section className="hero"><p className="eyebrow">Recruiter-focused screening</p><h1>Shortlist the right candidates in minutes.</h1><p>Upload a resume and job description to see a role-match score, skills, gaps, and practical interview guidance.</p><a className="button" href="#analyse">Analyse a resume for free</a></section>
    <section id="how" className="three"><article><b>01</b><h2>Add a resume</h2><p>Upload a text-based PDF. It is used only for this analysis.</p></article><article><b>02</b><h2>Paste the job description</h2><p>Add the key role requirements and must-have skills.</p></article><article><b>03</b><h2>Review the report</h2><p>See the match score, strengths, gaps, and recommendations.</p></article></section>
    <section id="analyse" className="form-card"><p className="eyebrow">Start your free analysis</p><h2>See the candidate-to-role fit.</h2><form onSubmit={submit}>
      <label>Resume (PDF only)<input type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      {file && <p className="selected">Selected: {file.name}</p>}
      <label>Job description<textarea rows="12" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the job requirements, responsibilities, and must-have skills here…" /></label>
      {error && <p className="error">{error}</p>}
      <button className="button" disabled={loading}>{loading ? 'Analysing resume…' : 'Analyse resume for free'}</button>
    </form></section>
  </main>;
}
