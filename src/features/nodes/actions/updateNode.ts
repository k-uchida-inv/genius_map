'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';

const UpdateNodeSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(200).optional(),
  memo: z.string().max(5000).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export async function updateNode(input: unknown): Promise<Result<void>> {
  const parsed = UpdateNodeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  const updates: Record<string, unknown> = {};
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.memo !== undefined) updates.memo = parsed.data.memo;
  if (parsed.data.positionX !== undefined) updates.position_x = parsed.data.positionX;
  if (parsed.data.positionY !== undefined) updates.position_y = parsed.data.positionY;

  if (Object.keys(updates).length === 0) return ok(undefined);

  const { error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', parsed.data.id);

  if (error) return err(new Error(error.message));
  return ok(undefined);
}
