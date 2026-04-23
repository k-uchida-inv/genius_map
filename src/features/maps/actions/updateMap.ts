'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const UpdateMapSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function updateMap(input: unknown): Promise<Result<void>> {
  const parsed = UpdateMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  const updates: Record<string, string> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;

  const { error } = await supabase
    .from('maps')
    .update(updates)
    .eq('id', parsed.data.id);

  if (error) return err(new Error(error.message));

  revalidatePath('/dashboard');
  return ok(undefined);
}
