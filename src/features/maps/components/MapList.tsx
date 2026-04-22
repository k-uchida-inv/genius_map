import { Map } from 'lucide-react';
import { MapCard } from './MapCard';

type MapItem = {
  id: string;
  title: string;
  description: string;
  nodeCount: number;
  updatedAt: string;
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
          No maps yet
        </p>
        <button
          className="mt-4 inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-brand-hover)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-brand)';
          }}
          onClick={() => console.log('create first map')}
        >
          Create your first map
        </button>
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
