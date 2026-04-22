'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <AlertCircle
        style={{ color: 'var(--color-danger)', width: 48, height: 48 }}
      />
      <h2
        className="text-lg font-semibold mt-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        エラーが発生しました
      </h2>
      <p
        className="text-sm mt-2"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        マップの読み込みに失敗しました。もう一度お試しください。
      </p>
      <Button
        onClick={reset}
        className="mt-6"
        style={{
          backgroundColor: 'var(--color-brand)',
          color: '#ffffff',
        }}
      >
        再読み込み
      </Button>
    </div>
  );
}
