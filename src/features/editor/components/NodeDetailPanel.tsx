'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Search, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { renderMarkdownSafe } from '@/lib/utils/sanitize';

type ConnectedNode = {
  id: string;
  label: string;
};

type NodeDetailPanelProps = {
  mapId: string;
  nodeId: string;
  nodeLabel: string;
  nodeMemo: string;
  connectedNodes: ConnectedNode[];
  onClose: () => void;
  onAiAssociate?: (() => void) | undefined;
  onAddChild?: (() => void) | undefined;
  onLabelChange?: ((label: string) => void) | undefined;
  onMemoChange?: ((memo: string) => void) | undefined;
  autoFocusTitle?: boolean | undefined;
};

type ResearchSection = {
  heading: string;
  items: string[];
  canAddNode: boolean;
};

export function NodeDetailPanel({
  mapId,
  nodeId,
  nodeLabel,
  nodeMemo,
  connectedNodes,
  onClose,
  onAiAssociate,
  onAddChild,
  onLabelChange,
  onMemoChange,
  autoFocusTitle,
}: NodeDetailPanelProps) {
  const [researchResult, setResearchResult] = useState<ResearchSection[] | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchText, setResearchText] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: nodeMemo || '',
    editorProps: { attributes: { class: 'outline-none min-h-[200px]' } },
    onUpdate: ({ editor: ed }) => {
      onMemoChange?.(ed.getHTML());
    },
  });

  const startResearch = useCallback(() => {
    setIsResearching(true);
    setResearchResult(null);
    setResearchText('');

    // Stream from the AI research API
    fetch('/api/ai/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapId, nodeId, label: nodeLabel }),
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        setIsResearching(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setResearchText(full);
      }

      // Parse markdown into sections
      const sections = parseResearchSections(full);
      setResearchResult(sections);
      setIsResearching(false);
    }).catch(() => {
      setIsResearching(false);
    });
  }, [mapId, nodeId, nodeLabel]);

  useEffect(() => {
    if (autoFocusTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [autoFocusTitle]);

  // Reset when node changes
  const [prevLabel, setPrevLabel] = useState(nodeLabel);
  if (prevLabel !== nodeLabel) {
    setPrevLabel(nodeLabel);
    setResearchResult(null);
    setResearchText('');
    setIsResearching(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-1">
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

        <div className="tiptap-editor px-6 pb-4">
          <EditorContent editor={editor} />
        </div>

        <div className="mx-6 border-t pt-4 pb-6" style={{ borderColor: 'var(--color-border)' }}>
          {!researchResult && !isResearching && !researchText && (
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

          {isResearching && !researchText && (
            <div className="flex items-center justify-center gap-2 py-6 animate-fade-in">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-brand)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Researching...</span>
            </div>
          )}

          {/* Streaming text display */}
          {researchText && !researchResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Research Results
                </p>
              </div>
              <div
                className="text-sm prose prose-sm max-w-none"
                style={{ color: 'var(--color-text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(researchText) }}
              />
              {isResearching && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
                </div>
              )}
            </div>
          )}

          {/* Parsed sections display */}
          {researchResult && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wider animate-fade-in" style={{ color: 'var(--color-text-muted)' }}>
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

              {researchResult.map((section, si) => (
                <div key={section.heading} className="animate-fade-in-up" style={{ animationDelay: `${si * 60}ms` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {section.heading}
                    </h3>
                    {section.canAddNode && (
                      <button
                        className="text-xs px-2 py-0.5 rounded-[var(--radius-full)] transition-all duration-150"
                        style={{ color: 'var(--color-brand)', backgroundColor: 'var(--color-brand-subtle)' }}
                        onClick={() => onAddChild?.()}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand)'; e.currentTarget.style.color = '#ffffff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand-subtle)'; e.currentTarget.style.color = 'var(--color-brand)'; }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  {section.items.length === 1 ? (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {section.items[0]}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item} className="text-sm ml-4 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseResearchSections(text: string): ResearchSection[] {
  const lines = text.split('\n');
  const sections: ResearchSection[] = [];
  let current: ResearchSection | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: headingMatch[1]!, items: [], canAddNode: true };
    } else if (current) {
      const bulletMatch = line.match(/^[-*]\s+(.+)/);
      if (bulletMatch) {
        current.items.push(bulletMatch[1]!);
      } else if (line.trim()) {
        current.items.push(line.trim());
      }
    }
  }
  if (current) {
    if (sections.length === 0) current.canAddNode = false;
    sections.push(current);
  }
  return sections;
}

