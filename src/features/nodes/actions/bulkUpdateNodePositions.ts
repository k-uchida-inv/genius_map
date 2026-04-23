'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';

const BulkUpdateSchema = z.object({
  nodes: z.array(z.object({
    id: z.string().uuid(),
    positionX: z.number(),
    positionY: z.number(),
  })),
});

export async function bulkUpdateNodePositions(input: unknown): Promise<Result<void>> {
  const parsed = BulkUpdateSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  // Batch update using individual queries (Supabase doesn't support upsert by non-PK easily)
  const promises = parsed.data.nodes.map((n) =>
    supabase
      .from('nodes')
      .update({ position_x: n.positionX, position_y: n.positionY })
      .eq('id', n.id),
  );

  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) return err(new Error(failed.error.message));

  return ok(undefined);
}
