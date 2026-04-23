import { eq, gte, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { aiUsageLogs } from '@/lib/db/schema';

const DAILY_LIMIT = 50;

export async function checkAndRecordUsage(
  mapId: string,
  actionType: 'associate' | 'analyze' | 'research' | 'summarize',
): Promise<{ allowed: boolean; remaining: number; unauthenticated?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { allowed: false, remaining: 0, unauthenticated: true };

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiUsageLogs)
    .where(and(
      eq(aiUsageLogs.userId, session.user.id),
      gte(aiUsageLogs.createdAt, todayStart),
    ));

  const used = result?.count ?? 0;
  if (used >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await db.insert(aiUsageLogs).values({
    userId: session.user.id,
    actionType,
    mapId,
  });

  return { allowed: true, remaining: DAILY_LIMIT - used - 1 };
}
