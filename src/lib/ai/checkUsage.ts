import { createClient } from '@/lib/supabase/server';

const DAILY_LIMIT = 50;

export async function checkAndRecordUsage(
  mapId: string,
  actionType: 'associate' | 'analyze' | 'research' | 'summarize',
): Promise<{ allowed: boolean; remaining: number; unauthenticated?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, remaining: 0, unauthenticated: true };

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString());

  const used = count ?? 0;
  if (used >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Record usage
  const { error: insertError } = await supabase.from('ai_usage_logs').insert({
    user_id: user.id,
    action_type: actionType,
    map_id: mapId,
  });

  if (insertError) {
    return { allowed: false, remaining: DAILY_LIMIT - used };
  }

  return { allowed: true, remaining: DAILY_LIMIT - used - 1 };
}
