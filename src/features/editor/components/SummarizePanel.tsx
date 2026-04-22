'use client';

import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type SummarizePanelProps = {
  markedLabels: string[];
  onClose: () => void;
};

const MOCK_SUMMARY_LINES = [
  { type: 'h2', text: 'Idea Summary' },
  { type: 'p', text: 'Based on the marked concepts, a cohesive strategy emerges around **AI-driven automation for knowledge work**.' },
  { type: 'h2', text: 'Core Insight' },
  { type: 'p', text: 'The selected topics converge on a single theme: augmenting human cognition with AI. Rather than replacing manual processes, these concepts form a pipeline where each stage feeds into the next.' },
  { type: 'h2', text: 'Actionable Ideas' },
  { type: 'li', text: 'Build an internal knowledge base powered by NLP to auto-categorize and surface relevant documents' },
  { type: 'li', text: 'Create an AI assistant that monitors data patterns and proactively suggests optimizations' },
  { type: 'li', text: 'Develop a prototype combining image recognition with automated quality reporting' },
  { type: 'li', text: 'Design a feedback loop where automation outcomes refine the AI models over time' },
  { type: 'h2', text: 'Next Steps' },
  { type: 'li', text: 'Prioritize the highest-impact use case based on current team capabilities' },
  { type: 'li', text: 'Set up a 2-week proof of concept with measurable success criteria' },
  { type: 'li', text: 'Document learnings in this map and expand outward from validated ideas' },
];

export function SummarizePanel({ markedLabels, onClose }: SummarizePanelProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= MOCK_SUMMARY_LINES.length) clearInterval(interval);
    }, 160);
    return () => clearInterval(interval);
  }, []);

  function renderLine(line: { type: string; text: string }, idx: number) {
    const html = line.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (line.type === 'h2') {
      return (
        <h2
          key={idx}
          className="animate-fade-in-up text-base font-semibold mt-5 mb-2 first:mt-0"
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
          className="animate-fade-in-up text-sm ml-4 mb-1.5 list-disc leading-relaxed"
          style={{ color: 'var(--color-text-secondary)', animationDelay: `${idx * 30}ms` }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return (
      <p
        key={idx}
        className="animate-fade-in-up text-sm mb-2 leading-relaxed"
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

        <div>
          {MOCK_SUMMARY_LINES.slice(0, visibleCount).map((line, i) => renderLine(line, i))}
          {visibleCount < MOCK_SUMMARY_LINES.length && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Generating...</span>
            </div>
          )}
        </div>

        {visibleCount >= MOCK_SUMMARY_LINES.length && (
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
