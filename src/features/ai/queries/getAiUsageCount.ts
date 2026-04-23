import { eq, gte, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { aiUsageLogs } from '@/lib/db/schema';

const DAILY_LIMIT = 50;

export async function getAiUsageCount(): Promise<{ count: number; limit: number; remaining: number }> {
  const session = await auth();
  if (!session?.user?.id) return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };

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
  return { count: used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) };
}
