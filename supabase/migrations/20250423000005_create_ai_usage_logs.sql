CREATE TABLE ai_usage_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('associate', 'analyze', 'research', 'summarize')),
  map_id      uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_logs select own rows"
ON ai_usage_logs FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "ai_usage_logs insert own rows"
ON ai_usage_logs FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX idx_ai_usage_logs_user_id_created_at ON ai_usage_logs(user_id, created_at);
