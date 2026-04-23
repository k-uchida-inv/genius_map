'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';

const CreateNodeSchema = z.object({
  mapId: z.string().uuid(),
  label: z.string().min(1).max(200).default('新しいノード'),
  positionX: z.number(),
  positionY: z.number(),
  memo: z.string().max(5000).default(''),
});

export async function createNode(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = CreateNodeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  const { data, error } = await supabase
    .from('nodes')
    .insert({
      map_id: parsed.data.mapId,
      label: parsed.data.label,
      memo: parsed.data.memo,
      position_x: parsed.data.positionX,
      position_y: parsed.data.positionY,
    })
    .select('id')
    .single();

  if (error) return err(new Error(error.message));
  return ok({ id: data.id });
}
