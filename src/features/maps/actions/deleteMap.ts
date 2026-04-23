'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const DeleteMapSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteMap(input: unknown): Promise<Result<void>> {
  const parsed = DeleteMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  // Soft delete
  const { error } = await supabase
    .from('maps')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', parsed.data.id);

  if (error) return err(new Error(error.message));

  revalidatePath('/dashboard');
  return ok(undefined);
}
