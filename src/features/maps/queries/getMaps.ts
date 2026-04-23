import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps, nodes } from '@/lib/db/schema';
import type { MapWithNodeCount } from '../types';

export async function getMaps(): Promise<MapWithNodeCount[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const rows = await db
    .select({
      id: maps.id,
      userId: maps.userId,
      title: maps.title,
      description: maps.description,
      deletedAt: maps.deletedAt,
      createdAt: maps.createdAt,
      updatedAt: maps.updatedAt,
      nodeCount: sql<number>`count(${nodes.id})`.as('node_count'),
    })
    .from(maps)
    .leftJoin(nodes, eq(nodes.mapId, maps.id))
    .where(and(eq(maps.userId, session.user.id), isNull(maps.deletedAt)))
    .groupBy(maps.id)
    .orderBy(desc(maps.updatedAt));

  return rows;
}
