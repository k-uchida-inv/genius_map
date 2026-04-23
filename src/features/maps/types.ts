export type MapRow = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MapWithNodeCount = MapRow & {
  nodeCount: number;
};
