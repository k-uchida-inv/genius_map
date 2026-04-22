function SkeletonCard() {
  return (
    <div
      className="flex flex-col p-6 rounded-[var(--radius-lg)] border animate-pulse"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* タイトル行 */}
      <div className="flex justify-between items-start gap-2">
        <div
          className="h-5 rounded-[var(--radius-sm)] flex-1"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
        <div
          className="h-6 w-6 rounded-[var(--radius-sm)] shrink-0"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
      </div>

      {/* 説明文 */}
      <div className="mt-2 flex flex-col gap-1.5">
        <div
          className="h-4 rounded-[var(--radius-sm)] w-full"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
        <div
          className="h-4 rounded-[var(--radius-sm)] w-3/4"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
      </div>

      {/* フッター */}
      <div className="flex justify-between items-center mt-4">
        <div
          className="h-3 w-16 rounded-[var(--radius-sm)]"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
        <div
          className="h-3 w-20 rounded-[var(--radius-sm)]"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ヘッダースケルトン */}
      <header
        className="h-14 px-6 flex items-center justify-between border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div
          className="h-5 w-28 rounded-[var(--radius-sm)]"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
        <div
          className="h-8 w-8 rounded-full"
          style={{ backgroundColor: 'var(--color-bg-muted)' }}
        />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ページヘッダースケルトン */}
        <div className="flex justify-between items-center mb-8">
          <div
            className="h-7 w-32 rounded-[var(--radius-sm)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
          <div
            className="h-9 w-36 rounded-[var(--radius-md)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
        </div>

        {/* カードグリッドスケルトン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
