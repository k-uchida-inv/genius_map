'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { edges } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';

const CreateEdgeSchema = z.object({
  mapId: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
});

export async function createEdge(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = CreateEdgeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const [row] = await db.insert(edges).values({
    mapId: parsed.data.mapId,
    sourceNodeId: parsed.data.sourceNodeId,
    targetNodeId: parsed.data.targetNodeId,
  }).returning({ id: edges.id });

  if (!row) return err(new Error('Failed to create edge'));
  return ok({ id: row.id });
}
