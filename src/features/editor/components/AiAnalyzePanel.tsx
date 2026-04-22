'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AiAnalyzePanelProps = {
  targetNodeLabels: string[];
  onClose: () => void;
};

const MOCK_LINES = [
  { type: 'h2', text: '共通テーマ' },
  { type: 'p', text: '全てのキーワードは**人工知能の実用化**という文脈で結ばれています。特にビジネス応用と技術研究の接点に位置するトピックが中心です。' },
  { type: 'h2', text: '関係性の分析' },
  { type: 'li', text: '「AI活用」は上位概念であり、他のキーワードはその具体的な技術領域・手法です' },
  { type: 'li', text: '自然言語処理はテキストデータ、画像認識は視覚データを対象としており、入力データの種類で棲み分けされています' },
  { type: 'li', text: '自動化は技術というよりも目的・ゴールであり、他の全技術の応用先として機能しています' },
  { type: 'h2', text: '新しい視点' },
  { type: 'li', text: 'マルチモーダルAI — テキストと画像を統合的に処理する技術が急速に発展しており、NLPと画像認識の境界は曖昧になりつつあります' },
  { type: 'li', text: 'エッジAI — クラウドではなくデバイス上で実行する流れが加速し、リアルタイム処理の需要が増加しています' },
  { type: 'li', text: 'AI Agent — 単一タスクの自動化から、複数ステップを自律的に遂行するエージェントへの発展が注目されています' },
];

export function AiAnalyzePanel({ targetNodeLabels, onClose }: AiAnalyzePanelProps) {
  const labels = targetNodeLabels.length > 0 ? targetNodeLabels : ['AI活用'];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= MOCK_LINES.length) clearInterval(interval);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  function renderLine(line: { type: string; text: string }, idx: number) {
    const html = line.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (line.type === 'h2') {
      return (
        <h2
          key={idx}
          className="animate-fade-in-up text-base font-semibold mt-4 mb-2 first:mt-0"
          style={{ color: 'var(--color-text-primary)', animationDelay: `${idx * 30}ms` }}
        >
          {line.text}
        </h2>
      );
    }
    if (line.type === 'li') {
      return (
        <li
          key={idx}
          className="animate-fade-in-up text-sm ml-4 mb-1.5 list-disc"
          style={{ color: 'var(--color-text-secondary)', animationDelay: `${idx * 30}ms` }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return (
      <p
        key={idx}
        className="animate-fade-in-up text-sm mb-2"
        style={{ color: 'var(--color-text-secondary)', animationDelay: `${idx * 30}ms` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-4 py-3 border-b flex justify-between items-center shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Analysis
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-1 mb-4">
          {labels.slice(0, 6).map((label, i) => (
            <Badge key={i} variant="secondary" className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              {label}
            </Badge>
          ))}
          {labels.length > 6 && (
            <Badge variant="secondary" className="animate-fade-in">
              +{labels.length - 6}
            </Badge>
          )}
        </div>

        <div>
          {MOCK_LINES.slice(0, visibleCount).map((line, i) => renderLine(line, i))}
          {visibleCount < MOCK_LINES.length && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Analyzing...</span>
            </div>
          )}
        </div>

        {visibleCount >= MOCK_LINES.length && (
          <Button variant="outline" className="w-full mt-4 animate-fade-in">
            Run again
          </Button>
        )}
      </div>
    </div>
  );
}
