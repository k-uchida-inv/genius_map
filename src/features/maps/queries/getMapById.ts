import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { maps } from '@/lib/db/schema';
import type { MapRow } from '../types';

export async function getMapById(mapId: string): Promise<MapRow | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await db.query.maps.findFirst({
    where: and(
      eq(maps.id, mapId),
      eq(maps.userId, session.user.id),
      isNull(maps.deletedAt),
    ),
  });

  return row ?? null;
}
