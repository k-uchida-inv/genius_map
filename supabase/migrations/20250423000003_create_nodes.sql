CREATE TABLE nodes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id      uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT '新しいノード',
  memo        text NOT NULL DEFAULT '',
  position_x  double precision NOT NULL DEFAULT 0,
  position_y  double precision NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nodes select via map ownership"
ON nodes FOR SELECT TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "nodes insert via map ownership"
ON nodes FOR INSERT TO authenticated
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "nodes update via map ownership"
ON nodes FOR UPDATE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
)
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "nodes delete via map ownership"
ON nodes FOR DELETE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE INDEX idx_nodes_map_id ON nodes(map_id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON nodes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
