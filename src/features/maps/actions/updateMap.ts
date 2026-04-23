'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const UpdateMapSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function updateMap(input: unknown): Promise<Result<void>> {
  const parsed = UpdateMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;

  await db.update(maps).set(updates).where(eq(maps.id, parsed.data.id));

  revalidatePath('/dashboard');
  return ok(undefined);
}
