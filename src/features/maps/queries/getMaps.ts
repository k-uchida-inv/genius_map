import { createClient } from '@/lib/supabase/server';
import type { MapWithNodeCount } from '../types';

export async function getMaps(): Promise<MapWithNodeCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('maps')
    .select('*, nodes(count)')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    node_count: (row.nodes as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}
