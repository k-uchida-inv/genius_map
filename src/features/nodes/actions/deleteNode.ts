'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';

const DeleteNodeSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteNode(input: unknown): Promise<Result<void>> {
  const parsed = DeleteNodeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  const { error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', parsed.data.id);

  if (error) return err(new Error(error.message));
  return ok(undefined);
}
