'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const DuplicateMapSchema = z.object({
  id: z.string().uuid(),
});

export async function duplicateMap(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = DuplicateMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  // Fetch original map
  const { data: original, error: mapErr } = await supabase
    .from('maps')
    .select('title, description')
    .eq('id', parsed.data.id)
    .single();

  if (mapErr || !original) return err(new Error('Map not found'));

  // Create new map
  const { data: newMap, error: createErr } = await supabase
    .from('maps')
    .insert({
      title: `${original.title}のコピー`,
      description: original.description,
      user_id: user.id,
    })
    .select('id')
    .single();

  if (createErr || !newMap) return err(new Error('Failed to create map'));

  // Copy nodes
  const { data: origNodes } = await supabase
    .from('nodes')
    .select('label, memo, position_x, position_y')
    .eq('map_id', parsed.data.id);

  if (origNodes && origNodes.length > 0) {
    // Fetch original nodes with IDs to build edge mapping
    const { data: origNodesWithId } = await supabase
      .from('nodes')
      .select('id, label, memo, position_x, position_y')
      .eq('map_id', parsed.data.id);

    const newNodes = origNodes.map((n) => ({
      map_id: newMap.id,
      label: n.label,
      memo: n.memo,
      position_x: n.position_x,
      position_y: n.position_y,
    }));

    const { data: insertedNodes } = await supabase
      .from('nodes')
      .insert(newNodes)
      .select('id');

    // Copy edges using ID mapping
    if (origNodesWithId && insertedNodes && origNodesWithId.length === insertedNodes.length) {
      const idMap = new Map<string, string>();
      origNodesWithId.forEach((orig, i) => {
        const inserted = insertedNodes[i];
        if (inserted) {
          idMap.set(orig.id, inserted.id);
        }
      });

      const { data: origEdges } = await supabase
        .from('edges')
        .select('source_node_id, target_node_id')
        .eq('map_id', parsed.data.id);

      if (origEdges && origEdges.length > 0) {
        const newEdges = origEdges
          .map((e) => ({
            map_id: newMap.id,
            source_node_id: idMap.get(e.source_node_id)!,
            target_node_id: idMap.get(e.target_node_id)!,
          }))
          .filter((e) => e.source_node_id && e.target_node_id);

        if (newEdges.length > 0) {
          await supabase.from('edges').insert(newEdges);
        }
      }
    }
  }

  revalidatePath('/dashboard');
  return ok({ id: newMap.id });
}
