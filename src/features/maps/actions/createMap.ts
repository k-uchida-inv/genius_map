'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const CreateMapSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100),
  description: z.string().max(500).default(''),
});

export async function createMap(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = CreateMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error(parsed.error.issues[0]?.message ?? 'Invalid input'));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err(new Error('Unauthorized'));

  const { data, error } = await supabase
    .from('maps')
    .insert({ title: parsed.data.title, description: parsed.data.description, user_id: user.id })
    .select('id')
    .single();

  if (error) return err(new Error(error.message));

  revalidatePath('/dashboard');
  return ok({ id: data.id });
}
