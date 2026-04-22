'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Brain, LayoutGrid, Highlighter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type MapToolbarProps = {
  title: string;
  markMode: boolean;
  markedCount: number;
  onAiAssociate: () => void;
  onAiAnalyze: () => void;
  onAutoLayout: () => void;
  onToggleMarkMode: () => void;
  onSummarize: () => void;
};

export function MapToolbar({
  title,
  markMode,
  markedCount,
  onAiAssociate,
  onAiAnalyze,
  onAutoLayout,
  onToggleMarkMode,
  onSummarize,
}: MapToolbarProps) {
  const aiRemaining = 42;
  const aiLimit = 50;

  return (
    <div
      className="h-14 border-b px-4 flex items-center justify-between shrink-0"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] transition-colors duration-150 hover:bg-[var(--color-bg-muted)]"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
        </Link>
        <span
          className="text-lg font-normal ml-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={onAutoLayout}
          title="Auto Layout"
        >
          <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
          Layout
        </Button>

        <div
          className="w-px h-5 mx-1"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        <Button
          size="sm"
          className="w-[130px] justify-center"
          onClick={onAiAssociate}
          style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          AI Associate
        </Button>

        <Button
          size="sm"
          className="w-[130px] justify-center"
          onClick={onAiAnalyze}
          style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
        >
          <Brain className="h-3.5 w-3.5 mr-1.5" />
          AI Analyze
        </Button>

        <div
          className="w-px h-5 mx-1"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        <Button
          size="sm"
          variant={markMode ? 'default' : 'outline'}
          onClick={onToggleMarkMode}
          style={markMode ? { backgroundColor: 'var(--color-danger)', color: '#ffffff' } : undefined}
        >
          <Highlighter className="h-3.5 w-3.5 mr-1.5" />
          Mark
          {markedCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1.5 text-[10px] px-1.5 py-0"
              style={markMode ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' } : undefined}
            >
              {markedCount}
            </Badge>
          )}
        </Button>

        {markedCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSummarize}
            className="animate-fade-in"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Summarize
          </Button>
        )}

        <div
          className="w-px h-5 mx-1"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {aiRemaining}/{aiLimit}
        </span>
      </div>
    </div>
  );
}
