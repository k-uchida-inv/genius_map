import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapList } from '@/features/maps/components/MapList';
import { CreateMapDialog } from '@/features/maps/components/CreateMapDialog';
import { DashboardUserMenu } from '@/features/maps/components/DashboardUserMenu';

const mockMaps = [
  {
    id: '1',
    title: 'Product Strategy 2026',
    description: '今期の事業戦略とロードマップの整理',
    nodeCount: 24,
    updatedAt: '3 hours ago',
  },
  {
    id: '2',
    title: 'React Architecture Research',
    description: 'Server Components と RSC パターンの比較分析',
    nodeCount: 18,
    updatedAt: '1 day ago',
  },
  {
    id: '3',
    title: 'Marketing Initiatives',
    description: 'Q2 のマーケティングキャンペーン企画',
    nodeCount: 12,
    updatedAt: '2 days ago',
  },
  {
    id: '4',
    title: 'Book Notes: Thinking Fast and Slow',
    description: '',
    nodeCount: 8,
    updatedAt: '5 days ago',
  },
  {
    id: '5',
    title: 'AI Use Cases Collection',
    description: '業務効率化のためのAI活用方法をブレインストーミング',
    nodeCount: 31,
    updatedAt: '1 week ago',
  },
];

export default function DashboardPage() {
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

        <MapList maps={mockMaps} />
      </main>
    </div>
  );
}
