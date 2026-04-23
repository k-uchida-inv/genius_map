'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { edges } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';

const DeleteEdgeSchema = z.object({
  id: z.string(),
});

export async function deleteEdge(input: unknown): Promise<Result<void>> {
  const parsed = DeleteEdgeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  await db.delete(edges).where(eq(edges.id, parsed.data.id));

  return ok(undefined);
}
