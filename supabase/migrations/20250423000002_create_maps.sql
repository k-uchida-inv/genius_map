CREATE TABLE maps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT '無題のマップ',
  description text NOT NULL DEFAULT '',
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maps select own rows"
ON maps FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "maps insert own rows"
ON maps FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "maps update own rows"
ON maps FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "maps delete own rows"
ON maps FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE INDEX idx_maps_user_id ON maps(user_id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON maps
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
