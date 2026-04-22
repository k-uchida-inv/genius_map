import Link from 'next/link';
import { UserMenu } from './UserMenu';

export function Header() {
  return (
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
      <UserMenu />
    </header>
  );
}
