'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { nodes } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';

const UpdateNodeSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(200).optional(),
  memo: z.string().max(5000).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export async function updateNode(input: unknown): Promise<Result<void>> {
  const parsed = UpdateNodeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.memo !== undefined) updates.memo = parsed.data.memo;
  if (parsed.data.positionX !== undefined) updates.positionX = parsed.data.positionX;
  if (parsed.data.positionY !== undefined) updates.positionY = parsed.data.positionY;

  await db.update(nodes).set(updates).where(eq(nodes.id, parsed.data.id));

  return ok(undefined);
}
