import { NextResponse } from 'next/server';
import { analyseResume } from '../../../lib/analyzer';
import { getSupabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const form = await request.formData();
    const resume = form.get('resume');
    const jobDescription = String(form.get('job_description') || '');
    if (!(resume instanceof File) || !resume.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Please upload a PDF resume.' }, { status: 400 });
    if (resume.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'The PDF must be 5 MB or smaller.' }, { status: 400 });
    if (!jobDescription.trim()) return NextResponse.json({ error: 'Please enter a job description.' }, { status: 400 });
    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(Buffer.from(await resume.arrayBuffer()));
    if (!parsed.text?.trim()) return NextResponse.json({ error: 'This PDF contains no readable text. Please use a text-based PDF.' }, { status: 400 });
    const analysis = analyseResume(parsed.text, jobDescription);
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Supabase keys are not configured on Vercel yet.' }, { status: 503 });
    const { data, error } = await supabase.from('analyses').insert({ filename: resume.name, score: analysis.score, matched_skills_count: analysis.matched_skills_count, missing_skills_count: analysis.missing_skills_count, analysis_json: analysis }).select('id').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Unable to save the analysis. Check the Supabase table and Vercel environment variables.' }, { status: 500 });
  }
}
