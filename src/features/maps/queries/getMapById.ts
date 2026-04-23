import { createClient } from '@/lib/supabase/server';
import type { MapRow } from '../types';

export async function getMapById(mapId: string): Promise<MapRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('id', mapId)
    .single();

  if (error) return null;
  return data;
}
