import { eq, and, isNull, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps, nodes, edges } from '@/lib/db/schema';

export type NodeRow = {
  id: string;
  mapId: string;
  label: string;
  memo: string | null;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
};

export type EdgeRow = {
  id: string;
  mapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  createdAt: Date;
};

export type MapData = {
  map: { id: string; title: string; description: string | null };
  nodes: NodeRow[];
  edges: EdgeRow[];
};

export async function getMapWithNodesAndEdges(mapId: string): Promise<MapData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const map = await db.query.maps.findFirst({
    where: and(
      eq(maps.id, mapId),
      eq(maps.userId, session.user.id),
      isNull(maps.deletedAt),
    ),
    columns: { id: true, title: true, description: true },
  });

  if (!map) return null;

  const [nodeRows, edgeRows] = await Promise.all([
    db.query.nodes.findMany({
      where: eq(nodes.mapId, mapId),
      orderBy: asc(nodes.createdAt),
    }),
    db.query.edges.findMany({
      where: eq(edges.mapId, mapId),
      orderBy: asc(edges.createdAt),
    }),
  ]);

  return { map, nodes: nodeRows, edges: edgeRows };
}
