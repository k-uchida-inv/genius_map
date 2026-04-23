'use client';

import { NodeDetailPanel } from './NodeDetailPanel';
import { AiAnalyzePanel } from './AiAnalyzePanel';
import { SummarizePanel } from './SummarizePanel';

type ConnectedNode = { id: string; label: string };
type SelectedNode = { id: string; label: string; memo: string; autoFocusTitle?: boolean };

type SidePanelProps = {
  mode: 'detail' | 'analyze' | 'summarize';
  mapId: string;
  selectedNode: SelectedNode | null;
  connectedNodes: ConnectedNode[];
  allNodeLabels: string[];
  markedLabels: string[];
  onClose: () => void;
  onAiAssociate?: (nodeId: string) => void;
  onAddChild?: (nodeId: string) => void;
  onNodeLabelChange?: (nodeId: string, label: string) => void;
  onMemoChange?: (nodeId: string, memo: string) => void;
  visible: boolean;
};

export function SidePanel({
  mode,
  mapId,
  selectedNode,
  connectedNodes,
  allNodeLabels,
  markedLabels,
  onClose,
  onAiAssociate,
  onAddChild,
  onNodeLabelChange,
  onMemoChange,
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
          mapId={mapId}
          nodeId={selectedNode.id}
          nodeLabel={selectedNode.label}
          nodeMemo={selectedNode.memo}
          connectedNodes={connectedNodes}
          onClose={onClose}
          onAiAssociate={onAiAssociate ? () => onAiAssociate(selectedNode.id) : undefined}
          onAddChild={onAddChild ? () => onAddChild(selectedNode.id) : undefined}
          onLabelChange={onNodeLabelChange ? (label: string) => onNodeLabelChange(selectedNode.id, label) : undefined}
          onMemoChange={onMemoChange ? (memo: string) => onMemoChange(selectedNode.id, memo) : undefined}
          autoFocusTitle={selectedNode.autoFocusTitle}
        />
      )}
      {mode === 'analyze' && (
        <AiAnalyzePanel mapId={mapId} targetNodeLabels={allNodeLabels} onClose={onClose} />
      )}
      {mode === 'summarize' && (
        <SummarizePanel mapId={mapId} markedLabels={markedLabels} onClose={onClose} />
      )}
    </div>
  );
}
