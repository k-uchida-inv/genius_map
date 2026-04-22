'use client';

import { NodeDetailPanel } from './NodeDetailPanel';
import { AiAnalyzePanel } from './AiAnalyzePanel';
import { SummarizePanel } from './SummarizePanel';

type ConnectedNode = { id: string; label: string };
type SelectedNode = { id: string; label: string; memo: string; autoFocusTitle?: boolean };

type SidePanelProps = {
  mode: 'detail' | 'analyze' | 'summarize';
  selectedNode: SelectedNode | null;
  connectedNodes: ConnectedNode[];
  allNodeLabels: string[];
  markedLabels: string[];
  onClose: () => void;
  onAiAssociate?: (nodeId: string) => void;
  onAddChild?: (nodeId: string) => void;
  onNodeLabelChange?: (nodeId: string, label: string) => void;
  visible: boolean;
};

export function SidePanel({
  mode,
  selectedNode,
  connectedNodes,
  allNodeLabels,
  markedLabels,
  onClose,
  onAiAssociate,
  onAddChild,
  onNodeLabelChange,
  visible,
}: SidePanelProps) {
  return (
    <div
      className={`w-[400px] border-l flex flex-col overflow-hidden shrink-0 ${visible ? 'animate-slide-in-right' : ''}`}
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        ...(visible ? {} : { animation: 'slide-out-right 200ms ease forwards' }),
      }}
    >
      {mode === 'detail' && selectedNode && (
        <NodeDetailPanel
          nodeLabel={selectedNode.label}
          nodeMemo={selectedNode.memo}
          connectedNodes={connectedNodes}
          onClose={onClose}
          onAiAssociate={onAiAssociate ? () => onAiAssociate(selectedNode.id) : undefined}
          onAddChild={onAddChild ? () => onAddChild(selectedNode.id) : undefined}
          onLabelChange={onNodeLabelChange ? (label: string) => onNodeLabelChange(selectedNode.id, label) : undefined}
          autoFocusTitle={selectedNode.autoFocusTitle}
        />
      )}
      {mode === 'analyze' && (
        <AiAnalyzePanel targetNodeLabels={allNodeLabels} onClose={onClose} />
      )}
      {mode === 'summarize' && (
        <SummarizePanel markedLabels={markedLabels} onClose={onClose} />
      )}
    </div>
  );
}
