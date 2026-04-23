import { createClient } from '@/lib/supabase/server';

const DAILY_LIMIT = 50;

export async function getAiUsageCount(): Promise<{ count: number; limit: number; remaining: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString());

  const used = error ? 0 : (count ?? 0);
  return { count: used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) };
}
