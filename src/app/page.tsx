import Link from 'next/link';
import { Sparkles, Brain, Search } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI連想',
    description:
      'ノードから関連キーワードを自動生成。発想を広げるAIアシスタント。',
  },
  {
    icon: Brain,
    title: 'AI分析',
    description: '複数ノードの関係性を分析。隠れたパターンを発見。',
  },
  {
    icon: Search,
    title: 'AI調査',
    description: 'Web検索で情報を自動収集。リサーチを加速。',
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Landing Header */}
      <header
        className="h-14 px-6 flex items-center justify-between border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <span
          className="text-lg font-semibold"
          style={{ color: 'var(--color-brand)' }}
        >
          GeniusMap
        </span>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: '#ffffff',
          }}
        >
          始める
        </Link>
      </header>

      {/* Hero */}
      <section className="py-24 text-center px-6">
        <h1
          className="text-3xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          AIが思考を拡張する、次世代マインドマップ
        </h1>
        <p
          className="text-lg mt-4 max-w-xl mx-auto"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          連想・分析・調査をAIが自動化。あなたのアイデアを無限に広げる。
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-9 px-4 mt-8 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: '#ffffff',
          }}
        >
          始める
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border rounded-[var(--radius-lg)] p-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Icon
                className="mb-4"
                style={{ color: 'var(--color-brand)', width: 40, height: 40 }}
              />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-center text-sm border-t mt-auto"
        style={{
          color: 'var(--color-text-muted)',
          borderColor: 'var(--color-border)',
        }}
      >
        © 2026 GeniusMap
      </footer>
    </div>
  );
}
