import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { OAuthButton } from '@/features/auth/components/OAuthButton';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-lg)] border p-6 space-y-6"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div className="text-center">
          <Link
            href="/"
            className="text-lg font-semibold"
            style={{ color: 'var(--color-brand)' }}
          >
            GeniusMap
          </Link>
          <h1
            className="text-xl font-semibold mt-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            ログイン
          </h1>
        </div>

        <OAuthButton label="Googleでログイン" />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            または
          </span>
          <Separator className="flex-1" />
        </div>

        <LoginForm />

        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          アカウントをお持ちでない方は{' '}
          <Link
            href="/signup"
            className="font-medium underline"
            style={{ color: 'var(--color-brand)' }}
          >
            こちら
          </Link>
        </p>
      </div>
    </div>
  );
}
