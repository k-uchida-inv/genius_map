'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MapEditorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <p
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          エラーが発生しました
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          マップの読み込み中に問題が発生しました。
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            再読み込み
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
            style={{ backgroundColor: 'var(--color-brand)', color: '#ffffff' }}
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
