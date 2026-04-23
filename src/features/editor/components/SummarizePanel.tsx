'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { renderMarkdownSafe } from '@/lib/utils/sanitize';

type SummarizePanelProps = {
  mapId: string;
  markedLabels: string[];
  onClose: () => void;
};

export function SummarizePanel({ mapId, markedLabels, onClose }: SummarizePanelProps) {
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [done, setDone] = useState(false);

  const doFetch = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapId, labels: markedLabels }),
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
  }, [mapId, markedLabels]);

  // Auto-start streaming on mount — data fetching is a valid effect use case
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { doFetch(); }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="px-4 py-3 border-b flex justify-between items-center shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" style={{ color: 'var(--color-danger)' }} />
          <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Summary
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-1.5 mb-5">
          {markedLabels.map((label, i) => (
            <Badge
              key={i}
              className="animate-fade-in text-xs"
              style={{
                animationDelay: `${i * 40}ms`,
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                border: '1px solid var(--color-danger)',
              }}
            >
              {label}
            </Badge>
          ))}
        </div>

        {isStreaming && !streamText && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-brand)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Generating...</span>
          </div>
        )}

        {streamText && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(streamText) }}
          />
        )}

        {isStreaming && streamText && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Generating...</span>
          </div>
        )}

        {done && (
          <div className="mt-6 pt-4 border-t animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Generated from {markedLabels.length} marked nodes
            </p>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

