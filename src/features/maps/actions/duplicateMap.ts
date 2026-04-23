'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps, nodes, edges } from '@/lib/db/schema';
import { ok, err, type Result } from '@/lib/types/result';
import { revalidatePath } from 'next/cache';

const DuplicateMapSchema = z.object({
  id: z.string(),
});

export async function duplicateMap(input: unknown): Promise<Result<{ id: string }>> {
  const parsed = DuplicateMapSchema.safeParse(input);
  if (!parsed.success) return err(new Error('Invalid input'));

  const session = await auth();
  if (!session?.user?.id) return err(new Error('Unauthorized'));

  const original = await db.query.maps.findFirst({
    where: eq(maps.id, parsed.data.id),
    columns: { title: true, description: true },
  });
  if (!original) return err(new Error('Map not found'));

  const [newMap] = await db.insert(maps).values({
    title: `${original.title}のコピー`,
    description: original.description,
    userId: session.user.id,
  }).returning({ id: maps.id });

  if (!newMap) return err(new Error('Failed to create map'));

  const origNodes = await db.query.nodes.findMany({
    where: eq(nodes.mapId, parsed.data.id),
  });

  if (origNodes.length > 0) {
    const idMap = new Map<string, string>();

    // Insert nodes one by one to build ID mapping
    for (const n of origNodes) {
      const [inserted] = await db.insert(nodes).values({
        mapId: newMap.id,
        label: n.label,
        memo: n.memo,
        positionX: n.positionX,
        positionY: n.positionY,
      }).returning({ id: nodes.id });
      if (inserted) {
        idMap.set(n.id, inserted.id);
      }
    }

    const origEdges = await db.query.edges.findMany({
      where: eq(edges.mapId, parsed.data.id),
    });

    if (origEdges.length > 0) {
      const newEdges = origEdges
        .map((e) => ({
          mapId: newMap.id,
          sourceNodeId: idMap.get(e.sourceNodeId)!,
          targetNodeId: idMap.get(e.targetNodeId)!,
        }))
        .filter((e) => e.sourceNodeId && e.targetNodeId);

      if (newEdges.length > 0) {
        await db.insert(edges).values(newEdges);
      }
    }
  }

  revalidatePath('/dashboard');
  return ok({ id: newMap.id });
}
