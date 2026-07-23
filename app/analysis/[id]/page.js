import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '../../../lib/supabase';
import Report from '../../../components/Report';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage({ params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();
  const { data } = await supabase.from('analyses').select('filename, analysis_json').eq('id', id).single();
  if (!data) notFound();
  return <Report filename={data.filename} analysis={data.analysis_json} />;
}
