'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const DeleteMapSchema = z.object({
  id: z.string(),
});

export async function deleteMap(input: unknown): Promise<Result<void>> {
  const parsed = DeleteMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  await db.update(maps).set({ deletedAt: new Date() }).where(eq(maps.id, parsed.data.id));

  revalidatePath('/dashboard');
  return ok(undefined);
}
