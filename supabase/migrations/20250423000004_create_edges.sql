CREATE TABLE edges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  source_node_id  uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id  uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edges_no_self_loop CHECK (source_node_id != target_node_id),
  CONSTRAINT edges_unique_pair UNIQUE (map_id, source_node_id, target_node_id)
);

ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edges select via map ownership"
ON edges FOR SELECT TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "edges insert via map ownership"
ON edges FOR INSERT TO authenticated
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "edges delete via map ownership"
ON edges FOR DELETE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE INDEX idx_edges_map_id ON edges(map_id);
CREATE INDEX idx_edges_source_node_id ON edges(source_node_id);
CREATE INDEX idx_edges_target_node_id ON edges(target_node_id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON edges
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
