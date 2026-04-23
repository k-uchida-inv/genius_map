import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapList } from '@/features/maps/components/MapList';
import { CreateMapDialog } from '@/features/maps/components/CreateMapDialog';
import { DashboardUserMenu } from '@/features/maps/components/DashboardUserMenu';
import { getMaps } from '@/features/maps/queries/getMaps';

export default async function DashboardPage() {
  const maps = await getMaps();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Header */}
      <header
        className="h-14 px-6 flex items-center justify-between border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <Link
          href="/dashboard"
          className="text-lg font-semibold transition-opacity duration-150 hover:opacity-80"
          style={{ color: 'var(--color-brand)' }}
        >
          GeniusMap
        </Link>
        <DashboardUserMenu />
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            My Maps
          </h1>
          <CreateMapDialog>
            <Button
              style={{
                backgroundColor: 'var(--color-brand)',
                color: '#ffffff',
              }}
            >
              <Plus />
              New Map
            </Button>
          </CreateMapDialog>
        </div>

        <MapList maps={maps} />
      </main>
    </div>
  );
}
