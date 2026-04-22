'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode, NodeActionsContext, type CustomNodeType } from './CustomNode';
import { MapToolbar } from './MapToolbar';
import { SidePanel } from './SidePanel';

type SidePanelMode = 'detail' | 'analyze' | 'summarize' | null;

type MockNode = { id: string; label: string; memo: string; positionX: number; positionY: number };
type MockEdge = { id: string; source: string; target: string };
type MapEditorProps = { initialNodes: MockNode[]; initialEdges: MockEdge[]; mapTitle: string };

const nodeTypes = { custom: CustomNode };
const edgeStyle = { stroke: 'var(--color-border-strong)', strokeWidth: 1.5 };
const markedEdgeStyle = { stroke: 'var(--color-danger)', strokeWidth: 2.5 };

function convertToRfNodes(mockNodes: MockNode[]): CustomNodeType[] {
  return mockNodes.map((n) => ({
    id: n.id, type: 'custom' as const,
    position: { x: n.positionX, y: n.positionY },
    data: { label: n.label, memo: n.memo },
  }));
}
function convertToRfEdges(mockEdges: MockEdge[]): Edge[] {
  return mockEdges.map((e) => ({
    id: e.id, source: e.source, target: e.target, type: 'straight', style: edgeStyle,
  }));
}

function calcChildPositions(px: number, py: number, existing: number, count: number) {
  const r = 180;
  const total = existing + count;
  const spread = Math.min(total * 35, 180);
  const start = 90 - spread / 2;
  const step = total > 1 ? spread / (total - 1) : 0;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const idx = existing + i;
    const rad = ((start + step * idx) * Math.PI) / 180;
    out.push({ x: px + r * Math.cos(rad), y: py + r * Math.sin(rad) });
  }
  return out;
}

// --- Radial Tree Layout (each node fans out its children) ---
function radialLayout(nodes: CustomNodeType[], edges: Edge[]): CustomNodeType[] {
  if (nodes.length === 0) return nodes;

  // Build adjacency
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
    adj.get(e.target)?.push(e.source);
  }

  // Find most-connected node as root (always placed at center)
  let rootId = nodes[0]!.id;
  let maxConn = 0;
  for (const [id, neighbors] of adj) {
    if (neighbors.length > maxConn) { maxConn = neighbors.length; rootId = id; }
  }

  // BFS to build a tree structure (parent → children)
  const childrenMap = new Map<string, string[]>();
  const visited = new Set<string>();
  visited.add(rootId);
  childrenMap.set(rootId, []);
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const nb of adj.get(id) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        if (!childrenMap.has(id)) childrenMap.set(id, []);
        childrenMap.get(id)!.push(nb);
        childrenMap.set(nb, []);
        queue.push(nb);
      }
    }
  }

  // Subtree sizes for proportional angle allocation
  const subtreeSize = new Map<string, number>();
  function calcSize(id: string): number {
    let size = 1;
    for (const c of childrenMap.get(id) ?? []) size += calcSize(c);
    subtreeSize.set(id, size);
    return size;
  }
  calcSize(rootId);

  // Place nodes: root at (0,0), children fan out from each parent
  const ringGap = 200;
  const posMap = new Map<string, { x: number; y: number }>();
  posMap.set(rootId, { x: 0, y: 0 });

  function place(id: string, depth: number, angleStart: number, angleEnd: number) {
    const kids = childrenMap.get(id) ?? [];
    if (kids.length === 0) return;
    const totalSize = kids.reduce((s, c) => s + (subtreeSize.get(c) ?? 1), 0);
    let cur = angleStart;
    for (const child of kids) {
      const span = ((angleEnd - angleStart) * (subtreeSize.get(child) ?? 1)) / totalSize;
      const angle = cur + span / 2;
      const r = ringGap * (depth + 1);
      posMap.set(child, { x: r * Math.cos(angle), y: r * Math.sin(angle) });
      place(child, depth + 1, cur, cur + span);
      cur += span;
    }
  }
  place(rootId, 0, 0, 2 * Math.PI);

  // Disconnected nodes in an outer ring
  const disconnected = nodes.filter((n) => !visited.has(n.id));
  if (disconnected.length > 0) {
    let maxR = 0;
    for (const p of posMap.values()) {
      const d = Math.sqrt(p.x ** 2 + p.y ** 2);
      if (d > maxR) maxR = d;
    }
    const outerR = maxR + ringGap;
    disconnected.forEach((n, i) => {
      const angle = (i / disconnected.length) * 2 * Math.PI;
      posMap.set(n.id, { x: outerR * Math.cos(angle), y: outerR * Math.sin(angle) });
    });
  }

  return nodes.map((n) => {
    const p = posMap.get(n.id) ?? { x: 0, y: 0 };
    return { ...n, position: p, data: { ...n.data, isRoot: n.id === rootId } };
  });
}

const AI_KEYWORDS: Record<string, string[]> = {
  'AI活用': ['機械学習', '深層学習', '生成AI', 'プロンプト設計'],
  '自然言語処理': ['大規模言語モデル', 'RAG', '感情分析', 'テキストマイニング'],
  '画像認識': ['物体検出', 'セグメンテーション', 'OCR', '顔認識'],
  '自動化': ['RPA', 'CI/CD', 'ワークフロー', 'ノーコード'],
  'チャットボット': ['FAQ自動応答', 'カスタマーサポート', '対話管理', 'インテント分析'],
  '文書要約': ['抽出型要約', '生成型要約', 'キーフレーズ', '構造化'],
  '品質検査': ['異常検知', '欠陥分類', 'インライン検査', '予知保全'],
  'データ分析': ['可視化', '統計モデル', '予測分析', 'ダッシュボード'],
};
const DEFAULT_KW = ['関連トピック1', '関連トピック2', '関連トピック3', '新しい視点'];

let nid = 100;
let eid = 100;

function MapEditorInner({ initialNodes, initialEdges, mapTitle }: MapEditorProps) {
  const rfInit = useMemo(() => convertToRfNodes(initialNodes), [initialNodes]);
  const rfEdgeInit = useMemo(() => convertToRfEdges(initialEdges), [initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeType>(rfInit);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdgeInit);
  const { fitView, setCenter, getZoom } = useReactFlow();

  const [selectedNode, setSelectedNode] = useState<CustomNodeType | null>(null);
  const [sidePanelMode, setSidePanelMode] = useState<SidePanelMode>(null);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const [autoFocusTitle, setAutoFocusTitle] = useState(false);

  // Marking
  const [markMode, setMarkMode] = useState(false);
  const [markedNodeIds, setMarkedNodeIds] = useState<Set<string>>(new Set());
  const [markedEdgeIds, setMarkedEdgeIds] = useState<Set<string>>(new Set());

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // --- Side panel ---
  const openPanel = useCallback((mode: SidePanelMode) => {
    setPanelKey((k) => k + 1);
    setSidePanelMode(mode);
    setSidePanelVisible(true);
  }, []);
  const closePanel = useCallback(() => {
    setSidePanelVisible(false);
    setTimeout(() => { setSidePanelMode(null); setSelectedNode(null); }, 250);
  }, []);

  // --- Connections ---
  const onConnect = useCallback((c: Connection) => {
    setEdges((eds) => addEdge({ ...c, type: 'straight', style: edgeStyle }, eds));
  }, [setEdges]);

  const onNodeClick: NodeMouseHandler<Node> = useCallback((_e, node) => {
    if (markMode) return; // handled by CustomNode onClick
    setSelectedNode(node as CustomNodeType);
    setAutoFocusTitle(false);
    openPanel('detail');
    // Center viewport on clicked node
    const zoom = getZoom();
    setCenter(node.position.x, node.position.y, { zoom, duration: 300 });
  }, [markMode, openPanel, getZoom, setCenter]);

  const onEdgeClick: EdgeMouseHandler<Edge> = useCallback((_e, edge) => {
    if (!markMode) return;
    setMarkedEdgeIds((prev) => {
      const next = new Set(prev);
      if (next.has(edge.id)) next.delete(edge.id); else next.add(edge.id);
      return next;
    });
  }, [markMode]);

  const onPaneClick = useCallback(() => {
    if (!markMode) closePanel();
  }, [markMode, closePanel]);

  const getChildCount = useCallback(
    (pid: string) => edges.filter((e) => e.source === pid).length,
    [edges],
  );

  // --- Staggered add ---
  const addStaggered = useCallback((pid: string, kws: string[], aiGenerated = false) => {
    const parent = nodes.find((n) => n.id === pid);
    if (!parent) return;
    const cc = getChildCount(pid);
    const positions = calcChildPositions(parent.position.x, parent.position.y, cc, kws.length);
    kws.forEach((kw, i) => {
      setTimeout(() => {
        const id = `node-${++nid}`;
        setNodes((nds) => [...nds, {
          id, type: 'custom' as const,
          position: positions[i] ?? { x: 0, y: 0 },
          data: { label: kw, memo: '', isNew: true, isAiGenerated: aiGenerated },
        }]);
        setEdges((eds) => [...eds, {
          id: `edge-${++eid}`, source: pid, target: id, type: 'straight', style: edgeStyle,
        }]);
      }, i * 120);
    });
  }, [nodes, getChildCount, setNodes, setEdges]);

  // Add child inline on canvas (no sidebar)
  const handleAddChildInline = useCallback((pid: string) => {
    const parent = nodes.find((n) => n.id === pid);
    if (!parent) return;
    const cc = getChildCount(pid);
    const positions = calcChildPositions(parent.position.x, parent.position.y, cc, 1);
    const id = `node-${++nid}`;
    setNodes((nds) => [...nds, {
      id, type: 'custom' as const,
      position: positions[0] ?? { x: 0, y: 0 },
      data: { label: '', memo: '', isNew: true, isEditing: true },
    }]);
    setEdges((eds) => [...eds, {
      id: `edge-${++eid}`, source: pid, target: id, type: 'straight', style: edgeStyle,
    }]);
  }, [nodes, getChildCount, setNodes, setEdges]);

  // Add child and immediately open its detail panel (sidebar +)
  const handleAddChildAndSelect = useCallback((pid: string) => {
    const parent = nodes.find((n) => n.id === pid);
    if (!parent) return;
    const cc = getChildCount(pid);
    const positions = calcChildPositions(parent.position.x, parent.position.y, cc, 1);
    const id = `node-${++nid}`;
    const newNode: CustomNodeType = {
      id, type: 'custom' as const,
      position: positions[0] ?? { x: 0, y: 0 },
      data: { label: '', memo: '', isNew: true },
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, {
      id: `edge-${++eid}`, source: pid, target: id, type: 'straight', style: edgeStyle,
    }]);
    setSelectedNode(newNode);
    setAutoFocusTitle(true);
    openPanel('detail');
  }, [nodes, getChildCount, setNodes, setEdges, openPanel]);

  const handleAiNode = useCallback((pid: string) => {
    const p = nodes.find((n) => n.id === pid) as CustomNodeType | undefined;
    if (!p) return;
    addStaggered(pid, AI_KEYWORDS[p.data.label] ?? DEFAULT_KW, true);
  }, [nodes, addStaggered]);

  // Mark toggle from node
  const handleToggleMark = useCallback((nodeId: string) => {
    setMarkedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  }, []);

  // Apply marks to node data
  const nodesWithMarks = useMemo(() =>
    nodes.map((n) => ({
      ...n,
      data: { ...n.data, marked: markedNodeIds.has(n.id) },
    })),
  [nodes, markedNodeIds]);

  // Apply marks to edge styles
  const edgesWithMarks = useMemo(() =>
    edges.map((e) => ({
      ...e,
      style: markedEdgeIds.has(e.id) ? markedEdgeStyle : edgeStyle,
      animated: markedEdgeIds.has(e.id),
    })),
  [edges, markedEdgeIds]);

  // --- Toolbar actions ---
  const handleGlobalAssociate = useCallback(() => {
    const kws = ['ユースケース分析', 'ROI試算', '導入ロードマップ', '競合比較'];
    const cx = nodes.reduce((s, n) => s + n.position.x, 0) / (nodes.length || 1);
    const cy = nodes.reduce((s, n) => s + n.position.y, 0) / (nodes.length || 1);
    kws.forEach((kw, i) => {
      setTimeout(() => {
        const angle = (i / kws.length) * 2 * Math.PI - Math.PI / 2;
        const r = 350;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        const id = `node-${++nid}`;
        let closest = nodes[0]?.id ?? '';
        let cd = Infinity;
        for (const n of nodes) {
          const d = (n.position.x - px) ** 2 + (n.position.y - py) ** 2;
          if (d < cd) { cd = d; closest = n.id; }
        }
        setNodes((nds) => [...nds, { id, type: 'custom' as const, position: { x: px, y: py }, data: { label: kw, memo: '', isNew: true, isAiGenerated: true } }]);
        if (closest) setEdges((eds) => [...eds, { id: `edge-${++eid}`, source: closest, target: id, type: 'straight', style: edgeStyle }]);
      }, i * 150);
    });
  }, [nodes, setNodes, setEdges]);

  const handleAnalyze = useCallback(() => openPanel('analyze'), [openPanel]);

  const handleAutoLayout = useCallback(() => {
    const target = radialLayout(nodes as CustomNodeType[], edges);
    // Animate: interpolate positions over 400ms
    const start = performance.now();
    const duration = 400;
    const origins = new Map(nodes.map((n) => [n.id, { ...n.position }]));

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - (1 - t) ** 3; // ease-out cubic
      setNodes(
        target.map((n) => {
          const o = origins.get(n.id) ?? n.position;
          return {
            ...n,
            position: {
              x: o.x + (n.position.x - o.x) * ease,
              y: o.y + (n.position.y - o.y) * ease,
            },
          };
        }),
      );
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(() => fitView({ duration: 300 }), 20);
    }
    requestAnimationFrame(step);
  }, [nodes, edges, setNodes, fitView]);

  const handleToggleMarkMode = useCallback(() => {
    setMarkMode((p) => !p);
  }, []);

  const handleSummarize = useCallback(() => openPanel('summarize'), [openPanel]);

  // Update node label from sidebar
  const handleNodeLabelChange = useCallback((nodeId: string, label: string) => {
    setNodes((nds) => nds.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
    ));
  }, [setNodes]);

  const markedCount = markedNodeIds.size + markedEdgeIds.size;

  // Data for panels
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const ids = edges
      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
      .map((e) => (e.source === selectedNode.id ? e.target : e.source));
    return nodes.filter((n) => ids.includes(n.id)).map((n) => ({ id: n.id, label: (n as CustomNodeType).data.label }));
  }, [selectedNode, edges, nodes]);

  const allLabels = useMemo(() => nodes.map((n) => (n as CustomNodeType).data.label), [nodes]);
  const sidePanelNode = selectedNode ? { id: selectedNode.id, label: selectedNode.data.label, memo: selectedNode.data.memo, autoFocusTitle } : null;

  // Marked labels for summarize
  const markedLabels = useMemo(
    () => nodes.filter((n) => markedNodeIds.has(n.id)).map((n) => (n as CustomNodeType).data.label),
    [nodes, markedNodeIds],
  );

  const nodeActions = useMemo(
    () => ({ onAddChild: handleAddChildInline, onAiAssociate: handleAiNode, onToggleMark: handleToggleMark, onLabelChange: handleNodeLabelChange, markMode }),
    [handleAddChildInline, handleAiNode, handleToggleMark, handleNodeLabelChange, markMode],
  );

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <MapToolbar
        title={mapTitle}
        markMode={markMode}
        markedCount={markedCount}
        onAiAssociate={handleGlobalAssociate}
        onAiAnalyze={handleAnalyze}
        onAutoLayout={handleAutoLayout}
        onToggleMarkMode={handleToggleMarkMode}
        onSummarize={handleSummarize}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <NodeActionsContext.Provider value={nodeActions}>
            <ReactFlow
              nodes={nodesWithMarks}
              edges={edgesWithMarks}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={memoizedNodeTypes}
              fitView
              style={{ backgroundColor: 'var(--color-bg-subtle)' }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
              <MiniMap style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
              <Controls />
            </ReactFlow>
          </NodeActionsContext.Provider>
        </div>

        {sidePanelMode && (
          <SidePanel
            key={panelKey}
            mode={sidePanelMode}
            selectedNode={sidePanelNode}
            connectedNodes={connectedNodes}
            allNodeLabels={allLabels}
            markedLabels={markedLabels}
            onClose={closePanel}
            onAiAssociate={handleAiNode}
            onAddChild={handleAddChildAndSelect}
            onNodeLabelChange={handleNodeLabelChange}
            visible={sidePanelVisible}
          />
        )}
      </div>
    </div>
  );
}

export function MapEditor(props: MapEditorProps) {
  return (
    <ReactFlowProvider>
      <MapEditorInner {...props} />
    </ReactFlowProvider>
  );
}
