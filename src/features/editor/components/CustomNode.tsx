'use client';

import { useState, useRef, useCallback, useContext, createContext } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Plus, Sparkles } from 'lucide-react';

export type CustomNodeData = {
  label: string;
  memo: string;
  isNew?: boolean;
  marked?: boolean;
  isAiGenerated?: boolean;
  isRoot?: boolean;
  isEditing?: boolean;
};

export type CustomNodeType = Node<CustomNodeData, 'custom'>;

type NodeActionsContextType = {
  onAddChild: (nodeId: string) => void;
  onAiAssociate: (nodeId: string) => void;
  onToggleMark: (nodeId: string) => void;
  onLabelChange: (nodeId: string, label: string) => void;
  markMode: boolean;
};

export const NodeActionsContext = createContext<NodeActionsContextType>({
  onAddChild: () => {},
  onAiAssociate: () => {},
  onToggleMark: () => {},
  onLabelChange: () => {},
  markMode: false,
});

export function CustomNode({ id, data, selected }: NodeProps<CustomNodeType>) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(data.isEditing ?? false);
  const { onAddChild, onAiAssociate, onToggleMark, onLabelChange, markMode } = useContext(NodeActionsContext);

  // Auto-focus input via callback ref (setTimeout to beat React Flow's focus grab)
  const inputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (el) {
      // React Flow reclaims focus after node mount; delay ensures we win
      setTimeout(() => { el.focus(); }, 50);
    }
  }, []);

  const [prevIsEditing, setPrevIsEditing] = useState(data.isEditing);
  if (data.isEditing !== prevIsEditing) {
    setPrevIsEditing(data.isEditing);
    if (data.isEditing) setEditing(true);
  }

  const marked = data.marked ?? false;
  const aiGen = data.isAiGenerated ?? false;
  const isRoot = data.isRoot ?? false;

  const borderColor = marked
    ? 'var(--color-danger)'
    : selected
      ? 'var(--color-brand)'
      : isRoot
        ? '#6366f1'
        : aiGen
          ? 'rgba(99,102,241,0.3)'
          : 'var(--color-border)';

  const shadow = marked
    ? '0 0 0 3px var(--color-danger-bg)'
    : isRoot
      ? '0 0 0 3px rgba(99,102,241,0.15)'
      : selected
        ? '0 0 0 3px var(--color-brand-subtle)'
        : 'var(--shadow-sm)';

  return (
    <div
      style={{ position: 'relative', paddingBottom: 40 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={data.isNew ? 'animate-node-pop-in' : ''}
        onClick={(e) => {
          if (markMode) {
            e.stopPropagation();
            onToggleMark(id);
          }
        }}
        style={{
          position: 'relative',
          backgroundColor: marked ? 'var(--color-danger-bg)' : isRoot ? '#6366f1' : aiGen ? '#eef0ff' : 'var(--color-bg)',
          borderColor,
          borderWidth: selected || marked ? '2px' : '1px',
          borderStyle: 'solid',
          borderRadius: 'var(--radius-lg)',
          boxShadow: shadow,
          padding: '8px 16px',
          minWidth: '120px',
          cursor: markMode ? 'pointer' : 'default',
          transition: 'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
        }}
      >
        {editing ? (
          <input
            ref={setInputRef}
            defaultValue={data.label}
            placeholder="Enter name..."
            className="nodrag nopan nowheel"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onLabelChange(id, e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); }}
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: marked ? 'var(--color-danger)' : isRoot ? '#ffffff' : 'var(--color-text-primary)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              textAlign: 'center',
              width: '100%',
              minWidth: 80,
            }}
          />
        ) : (
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: marked ? 'var(--color-danger)' : isRoot ? '#ffffff' : 'var(--color-text-primary)',
              display: 'block',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease',
            }}
          >
            {data.label || 'New node'}
          </span>
        )}

        <Handle
          type="target"
          position={Position.Top}
          style={{ width: 1, height: 1, opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
        <Handle
          type="source"
          position={Position.Top}
          style={{ width: 1, height: 1, opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Hover action buttons */}
      {!markMode && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            marginTop: 4,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 150ms ease, transform 150ms ease',
            transform: hovered ? 'translateY(0)' : 'translateY(-4px)',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(id); }}
            style={{
              width: 28, height: 28, borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            title="Add node"
          >
            <Plus style={{ width: 14, height: 14, color: 'var(--color-text-secondary)' }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAiAssociate(id); }}
            style={{
              width: 28, height: 28, borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            title="AI Associate"
          >
            <Sparkles style={{ width: 14, height: 14, color: '#ffffff' }} />
          </button>
        </div>
      )}
    </div>
  );
}
