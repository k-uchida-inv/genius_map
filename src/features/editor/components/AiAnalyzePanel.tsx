'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { renderMarkdownSafe } from '@/lib/utils/sanitize';

type AiAnalyzePanelProps = {
  mapId: string;
  targetNodeLabels: string[];
  onClose: () => void;
};

export function AiAnalyzePanel({ mapId, targetNodeLabels, onClose }: AiAnalyzePanelProps) {
  const labels = useMemo(() => targetNodeLabels.length > 0 ? targetNodeLabels : [], [targetNodeLabels]);
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [done, setDone] = useState(false);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapId, labels }),
      });
      if (!res.ok || !res.body) { setIsStreaming(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;
        full += decoder.decode(value, { stream: true });
        setStreamText(full);
      }

      setIsStreaming(false);
      setDone(true);
    } catch {
      setIsStreaming(false);
    }
  }, [mapId, labels]);

  const runAnalysis = useCallback(() => {
    setStreamText('');
    setIsStreaming(true);
    setDone(false);
    doFetch();
  }, [doFetch]);

  // Auto-start streaming on mount — data fetching is a valid effect use case
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { doFetch(); }, []);

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

        {isStreaming && !streamText && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-brand)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Analyzing...</span>
          </div>
        )}

        {streamText && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(streamText) }}
          />
        )}

        {isStreaming && streamText && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Analyzing...</span>
          </div>
        )}

        {done && (
          <Button variant="outline" className="w-full mt-4 animate-fade-in" onClick={runAnalysis}>
            Run again
          </Button>
        )}
      </div>
    </div>
  );
}

