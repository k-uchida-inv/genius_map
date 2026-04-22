'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Search, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

type ConnectedNode = {
  id: string;
  label: string;
};

type NodeDetailPanelProps = {
  nodeLabel: string;
  nodeMemo: string;
  connectedNodes: ConnectedNode[];
  onClose: () => void;
  onAiAssociate?: (() => void) | undefined;
  onAddChild?: (() => void) | undefined;
  onLabelChange?: ((label: string) => void) | undefined;
  autoFocusTitle?: boolean | undefined;
};

type ResearchSection = {
  heading: string;
  items: string[];
  canAddNode: boolean;
};

const MOCK_RESEARCH: Record<string, ResearchSection[]> = {
  default: [
    { heading: '概要', items: ['このトピックは幅広い応用を持つ分野です。近年のAI技術の発展により、新たな可能性が広がっています。'], canAddNode: false },
    { heading: '主要なポイント', items: ['最新の研究動向と実用化の進展', 'ビジネスへの応用事例の増加', '技術的な課題と解決アプローチ', 'オープンソースエコシステムの成熟'], canAddNode: true },
    { heading: '関連トピック', items: ['機械学習の基礎理論', 'データエンジニアリング', 'MLOps と本番運用'], canAddNode: true },
  ],
  'AI活用': [
    { heading: '概要', items: ['AI活用とは、人工知能技術をビジネスや社会の課題解決に応用することです。2024年以降、生成AIの普及により活用領域が急速に拡大しています。'], canAddNode: false },
    { heading: '主要な活用領域', items: ['業務自動化（RPA + AI）', 'カスタマーサポート（チャットボット）', 'データ分析・予測', 'コンテンツ生成（文章・画像・動画）', 'コード生成・開発支援'], canAddNode: true },
    { heading: '導入のステップ', items: ['課題の特定とAI適性評価', 'PoC（概念実証）の実施', 'データ基盤の整備', '本番環境への段階的展開'], canAddNode: true },
    { heading: '注意すべきリスク', items: ['ハルシネーション（誤情報生成）', 'データプライバシーの問題', 'バイアスの混入', '過度な依存によるスキル低下'], canAddNode: true },
  ],
  '自然言語処理': [
    { heading: '概要', items: ['自然言語処理（NLP）は、コンピュータが人間の言語を理解・生成する技術分野です。大規模言語モデルの登場により急速に発展しています。'], canAddNode: false },
    { heading: '主要な技術トレンド', items: ['大規模言語モデル（LLM）の進化', 'RAG（検索拡張生成）の普及', 'マルチ言語対応の進展', 'ファインチューニングの民主化'], canAddNode: true },
    { heading: '活用事例', items: ['カスタマーサポートの自動化', '文書要約と情報抽出', '感情分析とブランドモニタリング', 'コード生成と開発支援'], canAddNode: true },
    { heading: '関連トピック', items: ['トランスフォーマーアーキテクチャ', 'プロンプトエンジニアリング', 'AI倫理とバイアス'], canAddNode: true },
  ],
};

export function NodeDetailPanel({
  nodeLabel,
  nodeMemo,
  connectedNodes,
  onClose,
  onAiAssociate,
  onAddChild,
  onLabelChange,
  autoFocusTitle,
}: NodeDetailPanelProps) {
  const [researchResult, setResearchResult] = useState<ResearchSection[] | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);
  const titleRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: nodeMemo || '',
    editorProps: { attributes: { class: 'outline-none min-h-[200px]' } },
  });

  const startResearch = () => {
    setIsResearching(true);
    setResearchResult(null);
    setVisibleSections(0);

    const sections = MOCK_RESEARCH[nodeLabel] ?? MOCK_RESEARCH['default']!;

    // simulate streaming delay
    setTimeout(() => {
      setResearchResult(sections);
      setIsResearching(false);
      // stagger sections
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleSections(i);
        if (i >= sections.length) clearInterval(interval);
      }, 350);
    }, 800);
  };

  // Auto-focus title for new nodes
  useEffect(() => {
    if (autoFocusTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [autoFocusTitle]);

  // reset when node changes (React-recommended "adjusting state on prop change" pattern)
  const [prevLabel, setPrevLabel] = useState(nodeLabel);
  if (prevLabel !== nodeLabel) {
    setPrevLabel(nodeLabel);
    setResearchResult(null);
    setVisibleSections(0);
    setIsResearching(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header: title + close */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-2 shrink-0">
        <input
          ref={titleRef}
          defaultValue={nodeLabel}
          placeholder="Enter title..."
          onChange={(e) => onLabelChange?.(e.target.value)}
          className="text-2xl font-bold bg-transparent outline-none w-full min-w-0"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
          <X />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-1">
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 mb-4">
            {onAddChild && (
              <button
                onClick={onAddChild}
                title="Add child node"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'transform 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Plus style={{ width: 15, height: 15, color: 'var(--color-text-secondary)' }} />
              </button>
            )}
            {onAiAssociate && (
              <button
                onClick={onAiAssociate}
                title="AI Associate"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: '#6366f1', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'transform 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Sparkles style={{ width: 15, height: 15, color: '#ffffff' }} />
              </button>
            )}
          </div>

          {/* Connected nodes as tags */}
          {connectedNodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
              {connectedNodes.map((node, i) => (
                <button
                  key={node.id}
                  className="animate-fade-in-up px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs transition-colors duration-150"
                  style={{
                    backgroundColor: 'var(--color-bg-muted)',
                    color: 'var(--color-text-secondary)',
                    animationDelay: `${i * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-brand-subtle)';
                    e.currentTarget.style.color = 'var(--color-brand)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {node.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rich editor */}
        <div className="tiptap-editor px-6 pb-4">
          <EditorContent editor={editor} />
        </div>

        {/* Divider + AI Research section */}
        <div
          className="mx-6 border-t pt-4 pb-6"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {!researchResult && !isResearching && (
            <Button
              size="sm"
              className="w-full animate-fade-in"
              onClick={startResearch}
              style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              AI Research
            </Button>
          )}

          {isResearching && (
            <div className="flex items-center justify-center gap-2 py-6 animate-fade-in">
              <Loader2
                className="h-4 w-4 animate-spin"
                style={{ color: 'var(--color-brand)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Researching...
              </span>
            </div>
          )}

          {researchResult && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-medium uppercase tracking-wider animate-fade-in"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Research Results
                </p>
                <button
                  className="text-xs transition-colors duration-150 animate-fade-in"
                  style={{ color: 'var(--color-brand)' }}
                  onClick={startResearch}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = ''; }}
                >
                  Retry
                </button>
              </div>

              {researchResult.slice(0, visibleSections).map((section, si) => (
                <div
                  key={section.heading}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${si * 60}ms` }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {section.heading}
                    </h3>
                    {section.canAddNode && (
                      <button
                        className="text-xs px-2 py-0.5 rounded-[var(--radius-full)] transition-all duration-150"
                        style={{
                          color: 'var(--color-brand)',
                          backgroundColor: 'var(--color-brand-subtle)',
                        }}
                        onClick={() => alert(`Node added: ${section.heading}`)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-brand)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-brand-subtle)';
                          e.currentTarget.style.color = 'var(--color-brand)';
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  {section.items.length === 1 ? (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {section.items[0]}
                    </p>
                  ) : (
                    <ul className="space-y-1">
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

              {visibleSections < researchResult.length && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--color-brand)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Loading...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
