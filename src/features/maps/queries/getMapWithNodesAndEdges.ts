import { createClient } from '@/lib/supabase/server';

export type NodeRow = {
  id: string;
  map_id: string;
  label: string;
  memo: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
};

export type EdgeRow = {
  id: string;
  map_id: string;
  source_node_id: string;
  target_node_id: string;
  created_at: string;
  updated_at: string;
};

export type MapData = {
  map: { id: string; title: string; description: string };
  nodes: NodeRow[];
  edges: EdgeRow[];
};

export async function getMapWithNodesAndEdges(mapId: string): Promise<MapData | null> {
  const supabase = await createClient();

  const [mapResult, nodesResult, edgesResult] = await Promise.all([
    supabase.from('maps').select('id, title, description').eq('id', mapId).single(),
    supabase.from('nodes').select('*').eq('map_id', mapId).order('created_at'),
    supabase.from('edges').select('*').eq('map_id', mapId).order('created_at'),
  ]);

  if (mapResult.error || !mapResult.data) return null;

  return {
    map: mapResult.data,
    nodes: nodesResult.data ?? [],
    edges: edgesResult.data ?? [],
  };
}
