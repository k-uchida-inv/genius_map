export default function MapEditorLoading() {
  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ツールバースケルトン */}
      <div
        className="h-14 border-b px-4 flex items-center justify-between"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-[var(--radius-md)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
          <div
            className="w-40 h-5 rounded-[var(--radius-md)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-24 h-8 rounded-[var(--radius-md)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
          <div
            className="w-24 h-8 rounded-[var(--radius-md)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
          <div
            className="w-24 h-8 rounded-[var(--radius-md)]"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          />
        </div>
      </div>

      {/* キャンバスローディング */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
          />
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            読み込み中...
          </p>
        </div>
      </div>
    </div>
  );
}
