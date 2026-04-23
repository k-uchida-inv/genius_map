'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { nodes } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';

const CreateNodeSchema = z.object({
  mapId: z.string(),
  label: z.string().min(1).max(200).default('新しいノード'),
  positionX: z.number(),
  positionY: z.number(),
  memo: z.string().max(5000).default(''),
});

export async function createNode(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = CreateNodeSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const [row] = await db.insert(nodes).values({
    mapId: parsed.data.mapId,
    label: parsed.data.label,
    memo: parsed.data.memo,
    positionX: parsed.data.positionX,
    positionY: parsed.data.positionY,
  }).returning({ id: nodes.id });

  if (!row) return err(new Error('Failed to create node'));
  return ok({ id: row.id });
}
