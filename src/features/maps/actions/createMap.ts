'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const CreateMapSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100),
  description: z.string().max(500).default(''),
});

export async function createMap(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = CreateMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error(parsed.error.issues[0]?.message ?? 'Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const [row] = await db.insert(maps).values({
    title: parsed.data.title,
    description: parsed.data.description,
    userId: session.user.id,
  }).returning({ id: maps.id });

  if (!row) return err(new Error('Failed to create map'));

  revalidatePath('/dashboard');
  return ok({ id: row.id });
}
