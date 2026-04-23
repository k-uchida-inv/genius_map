import { Map } from 'lucide-react';
import { MapCard } from './MapCard';

type MapItem = {
  id: string;
  title: string;
  description: string | null;
  nodeCount: number;
  updatedAt: Date;
};

type MapListProps = {
  maps: MapItem[];
};

export function MapList({ maps }: MapListProps) {
  if (maps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Map
          style={{ color: 'var(--color-text-muted)', width: 64, height: 64 }}
        />
        <p
          className="text-lg font-medium mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          マップがまだありません
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          最初のマップを作成しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {maps.map((map) => (
        <MapCard key={map.id} map={map} />
      ))}
    </div>
  );
}
