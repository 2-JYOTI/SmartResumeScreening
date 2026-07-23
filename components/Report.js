export default function Report({ analysis, filename }) {
  const score = analysis.score;
  return <main className="report"><header className="header"><a className="brand" href="/">AI <span>Smart Resume Screening</span></a><nav><a href="/history">Saved analyses</a><a className="button small" href="/">New analysis</a></nav></header>
    <section className="report-hero"><p className="eyebrow">AI screening report</p><h1>Candidate Match Dashboard</h1><p>{filename}</p><div className="score"><strong>{score}%</strong><span>{score >= 90 ? 'Excellent fit' : score >= 70 ? 'Strong potential' : 'Needs improvement'}</span></div></section>
    <section className="grid">
      <Card title="Score breakdown"><div className="breakdown">{Object.entries(analysis.score_breakdown).map(([name, value]) => <p key={name}><span>{name}</span><b>{value}%</b></p>)}</div></Card>
      <Card title={`Skills found (${analysis.resume_skills.length})`}><Chips items={analysis.resume_skills} empty="No tracked skills detected in the resume." /></Card>
      <Card title={`Missing skills (${analysis.missing_skills_count})`}>{analysis.missing_skills.length ? analysis.missing_skills.map(item => <div className="gap" key={item.name}><b>{item.name}</b><small>{item.priority}</small><p>{item.recommendation}</p></div>) : <p>No tracked skill gaps were detected.</p>}</Card>
      <Card title="Job requirements"><Chips items={analysis.job_skills} empty="No tracked skills found in the job description." /></Card>
      <Card title="Recommendations"> <ul>{analysis.recommendations.map(item => <li key={item}>{item}</li>)}</ul></Card>
      <Card title="Recruiter feedback"><h3>Strengths</h3><ul>{analysis.strengths.map(item => <li key={item}>{item}</li>)}</ul><h3>Explore further</h3><ul>{analysis.weaknesses.map(item => <li key={item}>{item}</li>)}</ul></Card>
    </section>
  </main>;
}
function Card({ title, children }) { return <article className="card"><h2>{title}</h2>{children}</article>; }
function Chips({ items, empty }) { return items.length ? <div className="chips">{items.map(item => <span key={item}>{item}</span>)}</div> : <p>{empty}</p>; }
