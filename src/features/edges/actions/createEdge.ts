'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';

const CreateEdgeSchema = z.object({
  mapId: z.string().uuid(),
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
});

export async function createEdge(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = CreateEdgeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  const { data, error } = await supabase
    .from('edges')
    .insert({
      map_id: parsed.data.mapId,
      source_node_id: parsed.data.sourceNodeId,
      target_node_id: parsed.data.targetNodeId,
    })
    .select('id')
    .single();

  if (error) return err(new Error(error.message));
  return ok({ id: data.id });
}
