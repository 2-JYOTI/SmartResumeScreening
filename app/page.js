'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const Icon = ({ children, size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
const UploadIcon = () => <Icon size={35}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>;
const CheckIcon = () => <Icon size={17}><path d="m5 12 4 4L19 6"/></Icon>;

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  function chooseFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.name.toLowerCase().endsWith('.pdf')) {
      setError('For now, please upload a text-based PDF resume.');
      return;
    }
    setFile(nextFile); setError('');
  }

  async function submit(event) {
    event.preventDefault(); setError('');
    if (!file) return setError('Please choose a PDF resume.');
    if (!jobDescription.trim()) return setError('Please paste a job description.');
    setLoading(true);
    const start = Date.now();
    const data = new FormData(); data.append('resume', file); data.append('job_description', jobDescription);
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: data });
      const body = await response.json();
      const remaining = 2000 - (Date.now() - start);
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
      if (!response.ok) throw new Error(body.error || 'Analysis could not be completed.');
      router.push(`/analysis/${body.id}`);
    } catch (err) { setError(err.message); setLoading(false); }
  }

  return <main>
    <header className="site-header">
      <a className="brand" href="/"><span className="brand-mark"><CheckIcon /></span><span>AI Smart Resume Screening</span></a>
      <nav className="nav-links"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
      <div className="nav-actions"><a className="signin" href="/history">Sign In</a><a className="button small" href="#analyse">Create Free Account</a></div>
    </header>

    <section className="hero">
      <p className="eyebrow">⚡ AI-POWERED RECRUITMENT</p>
      <h1>Find the Right Fit,<br /><span>90% Faster.</span></h1>
      <p className="hero-copy">Upload a resume and job description to instantly generate a role-match score, deep skill-gap analysis, and practical interview questions. Your first 5 analyses are free.</p>
      <div className="trust-row"><span>🔒 100% GDPR Compliant</span><span>⏱️ Instant 30-Sec Analysis</span><span>⭐ 4.9/5 Recruiter Rating</span></div>
      <a className="hero-cta" href="#analyse">Analyse a Resume for Free <span>→</span></a>
    </section>

    <section id="how" className="how-section section-wrap">
      <div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>From resume to confident decision.</h2></div>
      <div className="steps">
        <article><b>01</b><div className="step-icon"><UploadIcon /></div><h3>Add a Resume</h3><p>Drag and drop a PDF or Word document. Securely parsed in seconds.</p></article>
        <article><b>02</b><div className="step-icon"><Icon><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h6"/></Icon></div><h3>Paste Job Requirements</h3><p>Add the key responsibilities, qualifications, and must-have skills for the role.</p></article>
        <article><b>03</b><div className="step-icon"><Icon><path d="M20 6 9 17l-5-5"/></Icon></div><h3>Get Your Actionable Report</h3><p>Receive a detailed match score, strengths, gaps, and tailor-made interview prompts.</p></article>
      </div>
    </section>

    <section id="analyse" className="analysis-area section-wrap">
      <div className="form-card">
        <div className="form-heading"><p className="eyebrow">FREE AI ANALYSIS</p><h2>See the Candidate-to-Role Fit</h2><p>Start your free analysis—no credit card required.</p></div>
        <form onSubmit={submit}>
          <label className="field-label">Candidate Resume</label>
          <input ref={inputRef} className="file-input" type="file" accept="application/pdf,.pdf" onChange={e => chooseFile(e.target.files?.[0])} />
          <div className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`} role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()} onDragEnter={e => { e.preventDefault(); setDragging(true); }} onDragOver={e => e.preventDefault()} onDragLeave={e => { e.preventDefault(); setDragging(false); }} onDrop={e => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files?.[0]); }}>
            <span className="upload-icon"><UploadIcon /></span>
            {file ? <><strong>{file.name}</strong><span className="file-change">Click or drop another file to replace</span></> : <><strong>Drag &amp; drop candidate resume here</strong><span className="browse">or click to browse files</span></>}
            <small>Supports PDF up to 5MB <span>•</span> 🔒 Files are deleted after analysis</small>
          </div>
          <label className="field-label" htmlFor="description">Job Description &amp; Requirements</label>
          <textarea id="description" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the job requirements, key responsibilities, and required skills here..." />
          {error && <p className="error">{error}</p>}
          <button className="button analyze-button" disabled={loading}>{loading ? <><span className="spinner" />Analyzing candidate fit...</> : <>Analyze Resume for Free <span>→</span></>}</button>
          <p className="form-trust">✦ Includes Match Score, Top 3 Gaps &amp; Custom Interview Prompts.</p>
        </form>
      </div>
    </section>

    <section className="preview section-wrap">
      <div className="section-heading centered"><p className="eyebrow">INSTANT, ACTIONABLE INSIGHTS</p><h2>What Your Report Will Look Like</h2></div>
      <div className="report-preview">
        <div className="preview-top"><span>Candidate Analysis Report</span><span className="report-status">● Complete</span></div>
        <div className="preview-grid">
          <div className="preview-card score-card"><p>ROLE MATCH</p><div className="score-ring"><strong>88%</strong><span>Role Match</span></div><small>Strong candidate for this role</small></div>
          <div className="preview-card"><p>SKILL GAPS</p><span className="gap-tag">Missing: Kubernetes experience</span><span className="gap-tag">Missing: Terraform</span><small>2 priority areas to explore</small></div>
          <div className="preview-card prompt-card"><p>INTERVIEW PROMPT</p><blockquote>“Tell me about a time you scaled a production service under pressure.”</blockquote><small>Tailored to this candidate</small></div>
        </div>
      </div>
    </section>

    <section id="features" className="features section-wrap"><div className="feature-card"><span className="feature-icon">⌁</span><div><h3>Skip the Manual CV Scanning</h3><p>Automatically evaluate candidate qualifications against job requirements without spending hours reading resumes.</p></div></div><div className="feature-card"><span className="feature-icon">✦</span><div><h3>Targeted Interview Questions</h3><p>Stop asking generic questions. Get specific prompts tailored to each candidate’s exact resume gaps.</p></div></div></section>

    <section id="pricing" className="cta-wrap"><div className="bottom-cta"><p className="eyebrow">GET STARTED TODAY</p><h2>Ready to Automate Your<br />Screening Process?</h2><p>Join hundreds of recruiters saving 10+ hours a week. Save your analyses and compare candidates side-by-side.</p><div><a className="button" href="#analyse">Create Free Account (5 Free Credits)</a><a className="demo-button" href="mailto:support@example.com">Schedule Demo</a></div></div></section>
    <footer id="faq"><span>© 2026 AI Smart Resume Screening. All rights reserved.</span><div><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Security</a><a href="mailto:support@example.com">Contact Support</a></div></footer>
  </main>;
}
