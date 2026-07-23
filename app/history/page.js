import Link from 'next/link';
import { getSupabaseAdmin } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = getSupabaseAdmin();
  let analyses = []; let message = '';
  if (!supabase) message = 'Supabase is not configured yet. Add the two environment variables before saving reports.';
  else {
    const { data, error } = await supabase.from('analyses').select('id, created_at, filename, score, matched_skills_count, missing_skills_count').order('id', { ascending: false });
    if (error) message = 'The analyses table is not ready yet. Run supabase-schema.sql in the Supabase SQL Editor.';
    else analyses = data;
  }
  return <main className="report"><header className="header"><Link className="brand" href="/">AI <span>Smart Resume Screening</span></Link><Link className="button small" href="/">New analysis</Link></header><section className="report-hero"><p className="eyebrow">Database</p><h1>Saved analyses</h1><p>Uploaded PDFs are never stored. Only the generated report is saved.</p></section><section className="card table-card">{message ? <p className="error">{message}</p> : analyses.length ? <table><thead><tr><th>Resume file</th><th>Score</th><th>Matched skills</th><th>Missing skills</th><th>Created</th><th></th></tr></thead><tbody>{analyses.map(row => <tr key={row.id}><td>{row.filename}</td><td>{row.score}%</td><td>{row.matched_skills_count}</td><td>{row.missing_skills_count}</td><td>{new Date(row.created_at).toLocaleString()}</td><td><Link href={`/analysis/${row.id}`}>Open report →</Link></td></tr>)}</tbody></table> : <p>No analyses saved yet. Run your first resume analysis.</p>}</section></main>;
}
