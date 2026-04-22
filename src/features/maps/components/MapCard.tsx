import Link from 'next/link';
import { MapCardMenu } from './MapCardMenu';

type MapCardProps = {
  map: {
    id: string;
    title: string;
    description: string;
    nodeCount: number;
    updatedAt: string;
  };
};

export function MapCard({ map }: MapCardProps) {
  return (
    <Link href={`/maps/${map.id}`} className="block group cursor-pointer">
      <div
        className="relative flex flex-col p-6 rounded-[var(--radius-lg)] border transition-shadow duration-150 hover:shadow-md h-[160px]"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div className="flex justify-between items-start gap-2">
          <h2
            className="text-base font-semibold truncate flex-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {map.title}
          </h2>
          <MapCardMenu mapId={map.id} />
        </div>

        {map.description ? (
          <p
            className="text-sm mt-2 line-clamp-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {map.description}
          </p>
        ) : (
          <p
            className="text-sm mt-2 italic"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No description
          </p>
        )}

        <div className="flex justify-between items-center mt-auto pt-4">
          <span
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {map.nodeCount} nodes
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {map.updatedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}
