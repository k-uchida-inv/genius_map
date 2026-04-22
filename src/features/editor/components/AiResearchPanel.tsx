'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AiResearchPanelProps = {
  targetNodeLabel: string;
  onClose: () => void;
};

type ResearchSection = {
  heading: string;
  items: string[];
  canAddNode: boolean;
};

const MOCK_SECTIONS: ResearchSection[] = [
  {
    heading: '概要',
    items: [
      '自然言語処理（NLP）は、コンピュータが人間の言語を理解・生成する技術分野です。近年は大規模言語モデルの登場により急速な発展を遂げています。',
    ],
    canAddNode: false,
  },
  {
    heading: '主要な技術トレンド',
    items: [
      '大規模言語モデル（LLM）の進化',
      'RAG（検索拡張生成）の普及',
      'マルチ言語対応の進展',
      'ファインチューニングの民主化',
    ],
    canAddNode: true,
  },
  {
    heading: '活用事例',
    items: [
      'カスタマーサポートの自動化',
      '文書要約と情報抽出',
      '感情分析とブランドモニタリング',
      'コード生成と開発支援',
    ],
    canAddNode: true,
  },
  {
    heading: '関連トピック',
    items: [
      'トランスフォーマーアーキテクチャ',
      'プロンプトエンジニアリング',
      'AI倫理とバイアス',
    ],
    canAddNode: true,
  },
];

export function AiResearchPanel({ targetNodeLabel, onClose }: AiResearchPanelProps) {
  const label = targetNodeLabel || '自然言語処理';
  const [visibleSections, setVisibleSections] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleSections(i);
      if (i >= MOCK_SECTIONS.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-4 py-3 border-b flex justify-between items-center shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          AI調査
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4 animate-fade-in">
          <Badge variant="secondary">{label}</Badge>
        </div>

        <div className="space-y-5">
          {MOCK_SECTIONS.slice(0, visibleSections).map((section, si) => (
            <div key={section.heading} className="animate-fade-in-up" style={{ animationDelay: `${si * 60}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {section.heading}
                </h2>
                {section.canAddNode && (
                  <button
                    className="text-xs px-2 py-0.5 rounded-[var(--radius-full)] transition-all duration-150"
                    style={{
                      color: 'var(--color-brand)',
                      backgroundColor: 'var(--color-brand-subtle)',
                    }}
                    onClick={() => alert(`ノードを追加しました: ${section.heading}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-brand)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-brand-subtle)';
                      e.currentTarget.style.color = 'var(--color-brand)';
                    }}
                  >
                    + ノード追加
                  </button>
                )}
              </div>
              {section.items.length === 1 ? (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {section.items[0]}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {section.items.map((item, ii) => (
                    <li
                      key={item}
                      className="animate-fade-in-up text-sm ml-4 list-disc"
                      style={{
                        color: 'var(--color-text-secondary)',
                        animationDelay: `${si * 60 + ii * 80}ms`,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {visibleSections < MOCK_SECTIONS.length && (
          <div className="flex items-center gap-2 mt-4">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>調査中...</span>
          </div>
        )}

        {visibleSections >= MOCK_SECTIONS.length && (
          <Button variant="outline" className="w-full mt-4 animate-fade-in">
            再調査する
          </Button>
        )}
      </div>
    </div>
  );
}
