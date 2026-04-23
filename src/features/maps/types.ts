export type MapRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MapWithNodeCount = MapRow & {
  node_count: number;
};
