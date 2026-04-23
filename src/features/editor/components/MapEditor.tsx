'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
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
import { toast } from 'sonner';
import { createNode } from '@/features/nodes/actions/createNode';
import { updateNode } from '@/features/nodes/actions/updateNode';
import { bulkUpdateNodePositions } from '@/features/nodes/actions/bulkUpdateNodePositions';
import { createEdge } from '@/features/edges/actions/createEdge';
import { deleteEdge } from '@/features/edges/actions/deleteEdge';
import { updateMap } from '@/features/maps/actions/updateMap';

type SidePanelMode = 'detail' | 'analyze' | 'summarize' | null;

type MockNode = { id: string; label: string; memo: string; positionX: number; positionY: number };
type MockEdge = { id: string; source: string; target: string };
type MapEditorProps = { mapId: string; initialNodes: MockNode[]; initialEdges: MockEdge[]; mapTitle: string };

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

function radialLayout(nodes: CustomNodeType[], edges: Edge[]): CustomNodeType[] {
  if (nodes.length === 0) return nodes;

  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
    adj.get(e.target)?.push(e.source);
  }

  let rootId = nodes[0]!.id;
  let maxConn = 0;
  for (const [id, neighbors] of adj) {
    if (neighbors.length > maxConn) { maxConn = neighbors.length; rootId = id; }
  }

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

  const subtreeSize = new Map<string, number>();
  function calcSize(id: string): number {
    let size = 1;
    for (const c of childrenMap.get(id) ?? []) size += calcSize(c);
    subtreeSize.set(id, size);
    return size;
  }
  calcSize(rootId);

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

function MapEditorInner({ mapId, initialNodes, initialEdges, mapTitle }: MapEditorProps) {
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

  // Debounced position save
  const positionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // --- Save helpers ---
  const savePositions = useCallback(() => {
    const pending = pendingPositionsRef.current;
    if (pending.size === 0) return;
    const batch = Array.from(pending.entries()).map(([id, pos]) => ({
      id, positionX: pos.x, positionY: pos.y,
    }));
    pendingPositionsRef.current = new Map();
    bulkUpdateNodePositions({ nodes: batch });
  }, []);

  const queuePositionSave = useCallback((nodeId: string, x: number, y: number) => {
    pendingPositionsRef.current.set(nodeId, { x, y });
    if (positionTimerRef.current) clearTimeout(positionTimerRef.current);
    positionTimerRef.current = setTimeout(savePositions, 500);
  }, [savePositions]);

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
    if (!c.source || !c.target) return;
    setEdges((eds) => addEdge({ ...c, type: 'straight', style: edgeStyle }, eds));
    createEdge({ mapId, sourceNodeId: c.source, targetNodeId: c.target }).then((result) => {
      if (result.success) {
        // Update the edge ID from the temporary one to the real DB ID
        setEdges((eds) => eds.map((e) =>
          (e.source === c.source && e.target === c.target && e.id.startsWith('reactflow'))
            ? { ...e, id: result.data.id }
            : e,
        ));
      }
    });
  }, [mapId, setEdges]);

  const onNodeClick: NodeMouseHandler<Node> = useCallback((_e, node) => {
    if (markMode) return;
    setSelectedNode(node as CustomNodeType);
    setAutoFocusTitle(false);
    openPanel('detail');
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

  // Track node position changes for auto-save
  const handleNodesChange: typeof onNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    for (const change of changes) {
      if (change.type === 'position' && change.position && !change.dragging) {
        queuePositionSave(change.id, change.position.x, change.position.y);
      }
    }
  }, [onNodesChange, queuePositionSave]);

  // Handle edge deletion
  const handleEdgesChange: typeof onEdgesChange = useCallback((changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        deleteEdge({ id: change.id });
      }
    }
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // --- Staggered add (for AI associate) ---
  const addStaggered = useCallback((pid: string, kws: string[], aiGenerated = false) => {
    const parent = nodes.find((n) => n.id === pid);
    if (!parent) return;
    const cc = getChildCount(pid);
    const positions = calcChildPositions(parent.position.x, parent.position.y, cc, kws.length);
    kws.forEach((kw, i) => {
      setTimeout(() => {
        const pos = positions[i] ?? { x: 0, y: 0 };
        // Optimistic: add to canvas immediately, then persist
        const tempId = `temp-${Date.now()}-${i}`;
        setNodes((nds) => [...nds, {
          id: tempId, type: 'custom' as const,
          position: pos,
          data: { label: kw, memo: '', isNew: true, isAiGenerated: aiGenerated },
        }]);

        createNode({ mapId, label: kw, positionX: pos.x, positionY: pos.y }).then((result) => {
          if (result.success) {
            setNodes((nds) => nds.map((n) => n.id === tempId ? { ...n, id: result.data.id } : n));
            createEdge({ mapId, sourceNodeId: pid, targetNodeId: result.data.id }).then((edgeResult) => {
              if (edgeResult.success) {
                setEdges((eds) => [...eds, {
                  id: edgeResult.data.id, source: pid, target: result.data.id,
                  type: 'straight', style: edgeStyle,
                }]);
              }
            });
          }
        });
      }, i * 120);
    });
  }, [mapId, nodes, getChildCount, setNodes, setEdges]);

  // Add child inline on canvas
  const handleAddChildInline = useCallback((pid: string) => {
    const parent = nodes.find((n) => n.id === pid);
    if (!parent) return;
    const cc = getChildCount(pid);
    const positions = calcChildPositions(parent.position.x, parent.position.y, cc, 1);
    const pos = positions[0] ?? { x: 0, y: 0 };
    const tempId = `temp-${Date.now()}`;

    setNodes((nds) => [...nds, {
      id: tempId, type: 'custom' as const, position: pos,
      data: { label: '', memo: '', isNew: true, isEditing: true },
    }]);

    createNode({ mapId, label: '新しいノード', positionX: pos.x, positionY: pos.y }).then((result) => {
      if (result.success) {
        setNodes((nds) => nds.map((n) => n.id === tempId ? { ...n, id: result.data.id } : n));
        createEdge({ mapId, sourceNodeId: pid, targetNodeId: result.data.id }).then((edgeResult) => {
          if (edgeResult.success) {
            setEdges((eds) => [...eds, {
              id: edgeResult.data.id, source: pid, target: result.data.id,
              type: 'straight', style: edgeStyle,
            }]);
          }
        });
      }
    });
  }, [mapId, nodes, getChildCount, setNodes, setEdges]);

  // Add child and open detail panel
  const handleAddChildAndSelect = useCallback((pid: string) => {
    const parent = nodes.find((n) => n.id === pid);
    if (!parent) return;
    const cc = getChildCount(pid);
    const positions = calcChildPositions(parent.position.x, parent.position.y, cc, 1);
    const pos = positions[0] ?? { x: 0, y: 0 };
    const tempId = `temp-${Date.now()}`;

    const newNode: CustomNodeType = {
      id: tempId, type: 'custom' as const, position: pos,
      data: { label: '', memo: '', isNew: true },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setAutoFocusTitle(true);
    openPanel('detail');

    createNode({ mapId, label: '新しいノード', positionX: pos.x, positionY: pos.y }).then((result) => {
      if (result.success) {
        setNodes((nds) => nds.map((n) => n.id === tempId ? { ...n, id: result.data.id } : n));
        setSelectedNode((prev) => prev && prev.id === tempId ? { ...prev, id: result.data.id } : prev);
        createEdge({ mapId, sourceNodeId: pid, targetNodeId: result.data.id }).then((edgeResult) => {
          if (edgeResult.success) {
            setEdges((eds) => [...eds, {
              id: edgeResult.data.id, source: pid, target: result.data.id,
              type: 'straight', style: edgeStyle,
            }]);
          }
        });
      }
    });
  }, [mapId, nodes, getChildCount, setNodes, setEdges, openPanel]);

  // AI associate on a specific node
  const handleAiNode = useCallback((pid: string) => {
    const p = nodes.find((n) => n.id === pid) as CustomNodeType | undefined;
    if (!p) return;
    // Call the AI associate API
    fetch('/api/ai/associate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapId, nodeId: pid, label: p.data.label }),
    })
      .then((res) => res.json())
      .then((data: { keywords?: string[] }) => {
        if (data.keywords && data.keywords.length > 0) {
          addStaggered(pid, data.keywords, true);
        }
      })
      .catch(() => {
        toast.error('AI連想に失敗しました');
      });
  }, [mapId, nodes, addStaggered]);

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

  const edgesWithMarks = useMemo(() =>
    edges.map((e) => ({
      ...e,
      style: markedEdgeIds.has(e.id) ? markedEdgeStyle : edgeStyle,
      animated: markedEdgeIds.has(e.id),
    })),
  [edges, markedEdgeIds]);

  // --- Toolbar actions ---
  const handleGlobalAssociate = useCallback(() => {
    // If a node is selected, AI associate on it; otherwise use the most connected node
    const target = selectedNode ?? nodes[0];
    if (target) {
      handleAiNode(target.id);
    }
  }, [selectedNode, nodes, handleAiNode]);

  const handleAnalyze = useCallback(() => openPanel('analyze'), [openPanel]);

  const handleAutoLayout = useCallback(() => {
    const target = radialLayout(nodes as CustomNodeType[], edges);
    const start = performance.now();
    const duration = 400;
    const origins = new Map(nodes.map((n) => [n.id, { ...n.position }]));

    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - (1 - t) ** 3;
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
      else {
        setTimeout(() => fitView({ duration: 300 }), 20);
        // Save final positions
        const batch = target.map((n) => ({
          id: n.id, positionX: n.position.x, positionY: n.position.y,
        }));
        bulkUpdateNodePositions({ nodes: batch });
      }
    }
    requestAnimationFrame(step);
  }, [nodes, edges, setNodes, fitView]);

  const handleToggleMarkMode = useCallback(() => {
    setMarkMode((p) => !p);
  }, []);

  const handleSummarize = useCallback(() => openPanel('summarize'), [openPanel]);

  // Update node label from sidebar
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNodeLabelChange = useCallback((nodeId: string, label: string) => {
    setNodes((nds) => nds.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
    ));
    // Debounced save
    if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
    labelTimerRef.current = setTimeout(() => {
      if (label.trim() && !nodeId.startsWith('temp-')) {
        updateNode({ id: nodeId, label });
      }
    }, 500);
  }, [setNodes]);

  // Update node memo from sidebar
  const memoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMemoChange = useCallback((nodeId: string, memo: string) => {
    setNodes((nds) => nds.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, memo } } : n,
    ));
    if (memoTimerRef.current) clearTimeout(memoTimerRef.current);
    memoTimerRef.current = setTimeout(() => {
      if (!nodeId.startsWith('temp-')) {
        updateNode({ id: nodeId, memo });
      }
    }, 1000);
  }, [setNodes]);

  // Title edit
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTitleChange = useCallback((title: string) => {
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      updateMap({ id: mapId, title: title || '無題のマップ' });
    }, 500);
  }, [mapId]);

  const markedCount = markedNodeIds.size + markedEdgeIds.size;

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const ids = edges
      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
      .map((e) => (e.source === selectedNode.id ? e.target : e.source));
    return nodes.filter((n) => ids.includes(n.id)).map((n) => ({ id: n.id, label: (n as CustomNodeType).data.label }));
  }, [selectedNode, edges, nodes]);

  const allLabels = useMemo(() => nodes.map((n) => (n as CustomNodeType).data.label), [nodes]);
  const sidePanelNode = selectedNode ? { id: selectedNode.id, label: selectedNode.data.label, memo: selectedNode.data.memo, autoFocusTitle } : null;

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
        onTitleChange={handleTitleChange}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <NodeActionsContext.Provider value={nodeActions}>
            <ReactFlow
              nodes={nodesWithMarks}
              edges={edgesWithMarks}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
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
            mapId={mapId}
            selectedNode={sidePanelNode}
            connectedNodes={connectedNodes}
            allNodeLabels={allLabels}
            markedLabels={markedLabels}
            onClose={closePanel}
            onAiAssociate={handleAiNode}
            onAddChild={handleAddChildAndSelect}
            onNodeLabelChange={handleNodeLabelChange}
            onMemoChange={handleMemoChange}
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
