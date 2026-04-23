'use client';

import { useState, useRef, useEffect } from 'react';
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
  onTitleChange?: (title: string) => void;
  aiRemaining?: number;
  aiLimit?: number;
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
  onTitleChange,
  aiRemaining = 50,
  aiLimit = 50,
}: MapToolbarProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTitle]);

  const commitTitle = () => {
    setEditingTitle(false);
    const final = titleValue.trim() || '無題のマップ';
    setTitleValue(final);
    onTitleChange?.(final);
  };

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
        {editingTitle ? (
          <input
            ref={inputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setTitleValue(title); setEditingTitle(false); } }}
            className="text-lg font-normal ml-2 bg-transparent outline-none border-b"
            style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-brand)' }}
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-lg font-normal ml-2 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {titleValue}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="outline" onClick={onAutoLayout} title="Auto Layout">
          <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
          Layout
        </Button>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

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

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

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
          <Button size="sm" variant="outline" onClick={onSummarize} className="animate-fade-in">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Summarize
          </Button>
        )}

        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {aiRemaining}/{aiLimit}
        </span>
      </div>
    </div>
  );
}
