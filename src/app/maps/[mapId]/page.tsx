import { notFound } from 'next/navigation';
import { getMapWithNodesAndEdges } from '@/features/maps/queries/getMapWithNodesAndEdges';
import { MapEditor } from '@/features/editor/components/MapEditor';

type Params = Promise<{ mapId: string }>;

export default async function MapEditorPage({ params }: { params: Params }) {
  const { mapId } = await params;
  const data = await getMapWithNodesAndEdges(mapId);

  if (!data) notFound();

  const initialNodes = data.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    memo: n.memo ?? '',
    positionX: n.positionX,
    positionY: n.positionY,
  }));

  const initialEdges = data.edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
  }));

  return (
    <MapEditor
      mapId={mapId}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      mapTitle={data.map.title}
    />
  );
}
