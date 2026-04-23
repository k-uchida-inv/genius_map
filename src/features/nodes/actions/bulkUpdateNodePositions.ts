'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { nodes } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';

const BulkUpdateSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    positionX: z.number(),
    positionY: z.number(),
  })),
});

export async function bulkUpdateNodePositions(input: unknown): Promise<Result<void>> {
  const parsed = BulkUpdateSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const now = new Date();
  await Promise.all(
    parsed.data.nodes.map((n) =>
      db.update(nodes)
        .set({ positionX: n.positionX, positionY: n.positionY, updatedAt: now })
        .where(eq(nodes.id, n.id)),
    ),
  );

  return ok(undefined);
}
