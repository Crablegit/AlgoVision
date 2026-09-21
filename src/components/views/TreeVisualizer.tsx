import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Frame, NodeItem, EdgeItem } from '../../types';
import {
  calculateTreeDiameter,
  detectUpdatedEdges,
  getUndirectedEdgeKey,
  getEdgeWeight,
  DiameterResult,
  EdgeUpdateInfo
} from '../../services/treeDiameter';

interface TreeVisualizerProps {
  frame: Frame;
  previousFrame?: Frame;
  rootId?: string;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ frame, previousFrame, rootId }) => {
  const rawNodes = frame.nodes || [];
  const rawEdges = frame.edges || [];

  // 1. Chuẩn hóa nodes (đảm bảo id, label, weight luôn sẵn sàng)
  let nodes: NodeItem[] = rawNodes.map((n: any, idx: number) => {
    let sId = '';
    let label = '';
    let weight: string | number | undefined = undefined;

    if (typeof n === 'object' && n !== null) {
      sId = String(n.id ?? n.label ?? idx + 1);
      label = String(n.label ?? n.id ?? idx + 1);
      weight = n.weight ?? n.val ?? n.value;
    } else {
      sId = String(n);
      label = String(n);
    }

    // Nếu chưa có weight, kiểm tra trong frame.variables (ví dụ: w_1, val_1, weight_1, w[1])
    if (weight === undefined && frame.variables) {
      const possibleKeys = [`w_${sId}`, `val_${sId}`, `weight_${sId}`, `w[${sId}]`, `val[${sId}]`, `w${sId}`];
      for (const pk of possibleKeys) {
        if (frame.variables[pk] !== undefined) {
          weight = frame.variables[pk] as any;
          break;
        }
      }
    }

    return {
      ...(typeof n === 'object' && n !== null ? n : {}),
      id: sId,
      label,
      weight,
      highlight: Boolean(n?.highlight)
    };
  });

  // 2. Chuẩn hóa endpoint giống GraphVisualizer để cây không mất nhánh nếu model
  // trả source/target, u/v, hoặc label như "Làng 3" thay cho ID "3".
  const endpointValue = (value: any): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim() || undefined;
    if (typeof value === 'object') return endpointValue(value.id ?? value.nodeId ?? value.value ?? value.label ?? value.name);
    return undefined;
  };
  const normalizeAlias = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  const idByAlias = new Map<string, string>();
  nodes.forEach(node => {
    const id = String(node.id);
    [id, node.label, node.secondaryLabel].forEach(value => {
      const alias = normalizeAlias(String(value ?? ''));
      if (alias) idByAlias.set(alias, id);
      const suffix = alias.match(/(?:^|\s)(\d+)$/)?.[1];
      if (suffix) idByAlias.set(suffix, id);
    });
  });
  const resolveEndpoint = (value: any) => {
    const endpoint = endpointValue(value);
    if (!endpoint) return undefined;
    const alias = normalizeAlias(endpoint);
    return idByAlias.get(alias) ?? idByAlias.get(alias.match(/(?:^|\s)(\d+)$/)?.[1] ?? '');
  };

  let edges: EdgeItem[] = rawEdges.flatMap((e: any, idx: number) => {
    const from = resolveEndpoint(e?.from ?? e?.source ?? e?.u ?? e?.a ?? e?.start ?? e?.node1);
    const to = resolveEndpoint(e?.to ?? e?.target ?? e?.v ?? e?.b ?? e?.end ?? e?.node2);
    const weight = e?.weight ?? e?.w ?? e?.val ?? e?.value ?? e?.cost;
    return from && to ? [{ ...e, id: e.id ?? `tree-edge-${from}-${to}-${idx}`, from, to, weight }] : [];
  });

  // 3. Fallback: Nếu nodes rỗng nhưng edges có thì tự động tái tạo nodes từ edges
  if (nodes.length === 0 && edges.length > 0) {
    const idSet = new Set<string>();
    edges.forEach(e => {
      idSet.add(e.from);
      idSet.add(e.to);
    });
    nodes = Array.from(idSet).map(id => ({ id, label: id, highlight: false }));
  }

  // 4. Xác định các đỉnh gốc (Forest Roots)
  let primaryRoot = resolveEndpoint(frame.rootId ?? rootId);
  if (!primaryRoot || !nodes.find(n => n.id === primaryRoot)) {
    primaryRoot = nodes[0]?.id;
  }

  // 5. TÍNH TOÁN ĐƯỜNG KÍNH CÂY (TREE DIAMETER) & THEO DÕI CẬP NHẬT CẠNH
  const diameterInfo: DiameterResult = useMemo(() => {
    return calculateTreeDiameter(nodes, edges, frame.variables, primaryRoot);
  }, [nodes, edges, frame.variables, primaryRoot]);

  const prevDiameterInfo: DiameterResult | null = useMemo(() => {
    if (!previousFrame) return null;
    const pNodes = previousFrame.nodes || [];
    const pEdges = previousFrame.edges || [];
    return calculateTreeDiameter(pNodes, pEdges, previousFrame.variables, previousFrame.rootId || primaryRoot);
  }, [previousFrame, primaryRoot]);

  const updatedEdges: EdgeUpdateInfo[] = useMemo(() => {
    return detectUpdatedEdges(edges, previousFrame?.edges, frame.variables);
  }, [edges, previousFrame?.edges, frame.variables]);

  // Kiểm tra xem bài toán có liên quan đến đường kính cây hay không
  const isDiameterActive = useMemo(() => {
    if (!diameterInfo.hasDiameter || diameterInfo.pathNodes.length < 2) return false;
    const vars = frame.variables || {};
    const hasDiamVar = Object.keys(vars).some(k => {
      const l = k.toLowerCase();
      return l.includes('diam') || l.includes('duongkinh') || l.includes('diameter') || l.includes('đường kính');
    });
    const hasWeights = edges.some(e => e.weight !== undefined);
    return hasDiamVar || hasWeights;
  }, [diameterInfo, frame.variables, edges]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <span className="text-xs font-mono">Đang nạp cấu trúc cây...</span>
      </div>
    );
  }

  // 6. Xây dựng danh sách kề vô hướng (vì cây trong input CP thường cho cạnh 2 chiều u - v)
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(String(n.id), []));
  edges.forEach(e => {
    adj.get(String(e.from))?.push(String(e.to));
    adj.get(String(e.to))?.push(String(e.from));
  });
  const compareNodeIds = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
  adj.forEach(neighbors => neighbors.sort(compareNodeIds));

  // 7. Xây dựng cấu trúc cây cha - con (Directed Parent -> Children) từ gốc bằng DFS
  const children = new Map<string, string[]>();
  const parent = new Map<string, string>();
  const depth = new Map<string, number>();
  const visited = new Set<string>();
  const forestRoots: string[] = [];

  function dfs(u: string, d: number) {
    visited.add(u);
    depth.set(u, d);
    children.set(u, []);
    for (const v of adj.get(u) || []) {
      if (!visited.has(v)) {
        parent.set(v, u);
        children.get(u)!.push(v);
        dfs(v, d + 1);
      }
    }
  }

  // Duyệt cây chính từ primaryRoot
  forestRoots.push(primaryRoot);
  dfs(primaryRoot, 0);

  // Xử lý các đỉnh rời rạc (nếu là rừng cây nhiều thành phần độc lập)
  nodes.forEach(n => {
    const sId = String(n.id);
    if (!visited.has(sId)) {
      forestRoots.push(sId);
      dfs(sId, 0);
    }
  });

  // 8. Thuật toán bố trí cây phân cấp chuẩn (Reingold-Tilford / In-order Leaf Placement)
  const maxDepth = Math.max(...Array.from(depth.values()), 0);
  const totalNodes = nodes.length;

  // Tự động tinh chỉnh kích thước linh hoạt khi cây có độ sâu lớn hoặc nhiều đỉnh
  const levelHeight = maxDepth > 20 ? 46 : (maxDepth > 10 ? 58 : 75);
  const nodeRadius = maxDepth > 20 ? 14 : (maxDepth > 10 ? 16 : 18);
  const leafSpacing = totalNodes > 20 ? 50 : 70;
  const leftPadding = 50;
  const topPadding = 50;

  const nodePositions = new Map<string, { x: number; y: number }>();
  let leafCounter = 0;

  function computeCoordinates(u: string) {
    const ch = children.get(u) || [];
    const d = depth.get(u) || 0;
    const y = topPadding + d * levelHeight;

    if (ch.length === 0) {
      const x = leftPadding + leafCounter * leafSpacing;
      leafCounter++;
      nodePositions.set(u, { x, y });
    } else {
      ch.forEach(v => computeCoordinates(v));
      const firstChildPos = nodePositions.get(ch[0]);
      const lastChildPos = nodePositions.get(ch[ch.length - 1]);
      const x = (firstChildPos && lastChildPos)
        ? (firstChildPos.x + lastChildPos.x) / 2
        : leftPadding + leafCounter * leafSpacing;
      nodePositions.set(u, { x, y });
    }
  }

  forestRoots.forEach((r, idx) => {
    computeCoordinates(r);
    if (idx < forestRoots.length - 1) {
      leafCounter += 0.5;
    }
  });

  nodes.forEach((n, idx) => {
    const sId = String(n.id);
    if (!nodePositions.has(sId)) {
      nodePositions.set(sId, {
        x: leftPadding + (leafCounter + idx) * leafSpacing,
        y: topPadding
      });
    }
  });

  const totalLeaves = Math.max(leafCounter, 1);
  const width = Math.max(560, leftPadding * 2 + (totalLeaves - 1) * leafSpacing);
  const height = Math.max(340, topPadding + maxDepth * levelHeight + 70);

  const allX = Array.from(nodePositions.values()).map(p => p.x);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const treeWidth = maxX - minX;
  const shiftX = (width - treeWidth) / 2 - minX;

  nodePositions.forEach((pos, id) => {
    nodePositions.set(id, { x: pos.x + shiftX, y: pos.y });
  });

  const [allowDrag, setAllowDrag] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragPositions, setDragPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const svgRef = useRef<SVGSVGElement | null>(null);

  const effectivePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    nodePositions.forEach((pos, id) => {
      const custom = dragPositions.get(id);
      map.set(id, custom ? { ...custom } : { ...pos });
    });
    return map;
  }, [nodePositions, dragPositions]);

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (!allowDrag) return;
    e.preventDefault();
    setDraggedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!allowDrag || !draggedNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = Math.max(25, Math.min(width - 25, (e.clientX - rect.left) * scaleX));
    const y = Math.max(25, Math.min(height - 25, (e.clientY - rect.top) * scaleY));

    setDragPositions(prev => {
      const next = new Map(prev);
      next.set(draggedNodeId, { x, y });
      return next;
    });
  };

  useEffect(() => {
    const onGlobalMouseUp = () => {
      if (draggedNodeId) setDraggedNodeId(null);
    };
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => window.removeEventListener('mouseup', onGlobalMouseUp);
  }, [draggedNodeId]);

  const levels = Array.from({ length: maxDepth + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center p-3 overflow-x-auto w-full select-none">
      {/* 1. BẢNG ĐIỀU KHIỂN & THEO DÕI ĐƯỜNG KÍNH CÂY (DIAMETER STATUS HUD) */}
      {isDiameterActive && (
        <div className="w-full max-w-3xl mb-3 p-3.5 rounded-2xl bg-midnight-950/90 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono transition-all">
          {/* Khối hiển thị Đường kính lớn */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 font-black text-xl shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              📏
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider flex items-center gap-2">
                <span>Đường kính cây (Tree Diameter)</span>
                {prevDiameterInfo && prevDiameterInfo.diameterValue !== diameterInfo.diameterValue && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ⚡ TÍNH LẠI
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                {prevDiameterInfo && prevDiameterInfo.diameterValue !== diameterInfo.diameterValue ? (
                  <>
                    <span className="text-slate-500 line-through text-xs font-normal">
                      {prevDiameterInfo.diameterValue.toLocaleString()}
                    </span>
                    <span className="text-amber-400">➔</span>
                    <span className="text-amber-300 text-lg font-black tracking-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                      {diameterInfo.diameterValue.toLocaleString()}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${diameterInfo.diameterValue >= prevDiameterInfo.diameterValue ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'}`}>
                      {diameterInfo.diameterValue >= prevDiameterInfo.diameterValue ? '+' : ''}
                      {(diameterInfo.diameterValue - prevDiameterInfo.diameterValue).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-amber-300 text-lg font-black tracking-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                    {diameterInfo.diameterValue.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chi tiết đường đi và 2 đầu mút */}
          <div className="flex flex-col gap-1 sm:text-right border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 w-full sm:w-auto">
            <div className="text-[11px] text-slate-300 flex items-center sm:justify-end gap-1.5 flex-wrap">
              <span className="text-slate-400">Đường đi dài nhất:</span>
              <span className="font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40 shadow-inner">
                {diameterInfo.pathString}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center sm:justify-end gap-2 flex-wrap">
              <span>2 Đầu mút:</span>
              <span className="text-amber-300 font-bold bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                🎯 {diameterInfo.endpoints?.[0]}
              </span>
              <span className="text-slate-500">⟷</span>
              <span className="text-amber-300 font-bold bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                🎯 {diameterInfo.endpoints?.[1]}
              </span>
              {updatedEdges.length > 0 && (
                <>
                  <span className="text-slate-700">|</span>
                  <span className="text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    {updatedEdges[0].description}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Thanh điều khiển phụ (Gốc, Số đỉnh, Di chuyển visual) */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-2 mb-2 border-b border-midnight-800 text-xs font-mono">
        {forestRoots.length > 1 ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-900 border border-sakura-500/30 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Rừng cây: <strong className="text-emerald-300 font-bold">{forestRoots.length} cây</strong></span>
            <span className="text-slate-600">|</span>
            <span>Tổng: <strong className="text-white font-bold">{totalNodes} đỉnh</strong></span>
            <span className="text-slate-600">|</span>
            <span>Độ sâu: <strong className="text-sakura-400 font-bold">{maxDepth + 1} tầng</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-900 border border-sakura-500/30 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Gốc (Root): <strong className="text-sky-300 font-bold">{primaryRoot}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Độ sâu: <strong className="text-sakura-400 font-bold">{maxDepth + 1} tầng</strong></span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {dragPositions.size > 0 && (
            <button
              onClick={() => setDragPositions(new Map())}
              className="text-[11px] font-mono text-slate-400 hover:text-rose-300 underline transition-colors"
              title="Khôi phục lại vị trí tự động ban đầu"
            >
              Đặt lại vị trí
            </button>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none px-2.5 py-1 rounded-lg bg-midnight-900 border border-slate-700 hover:border-sakura-500/50 transition-all">
            <input
              type="checkbox"
              checked={allowDrag}
              onChange={(e) => {
                setAllowDrag(e.target.checked);
                if (!e.target.checked) setDraggedNodeId(null);
              }}
              className="w-3.5 h-3.5 rounded bg-midnight-950 border-slate-600 text-sakura-500 focus:ring-0 cursor-pointer"
            />
            <span className={allowDrag ? 'text-sakura-300 font-medium' : 'text-slate-400'}>
              Di chuyển visual
            </span>
          </label>
        </div>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible select-none"
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDraggedNodeId(null)}
      >
        <defs>
          {/* Bộ lọc phát sáng Neon cho Đường kính (Amber Glow) */}
          <filter id="tree-glow-amber" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Bộ lọc phát sáng Neon cho Cạnh vừa cập nhật (Cyan Glow) */}
          <filter id="tree-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Mũi tên chỉ hướng rẽ nhánh */}
          <marker
            id="tree-arrow-normal"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
          </marker>
          <marker
            id="tree-arrow-highlight"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ff7597" />
          </marker>
          <marker
            id="tree-arrow-diameter"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Vạch phân tầng nhẹ nhàng phía sau (Level Guides) */}
        {levels.map((lvl) => {
          const y = topPadding + lvl * levelHeight;
          return (
            <g key={`level-guide-${lvl}`} opacity="0.35">
              <line
                x1={20}
                y1={y}
                x2={width - 20}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={25}
                y={y - 8}
                fill="#64748b"
                fontSize="9"
                fontFamily="Consolas, monospace"
              >
                {lvl === 0 ? 'Tầng 0 (Gốc)' : `Tầng ${lvl}`}
              </text>
            </g>
          );
        })}

        {/* 3. Render các nhánh cây (Cubic Bezier Tree Branches) */}
        {edges.map((edge, idx) => {
          const fromId = String(edge.from);
          const toId = String(edge.to);

          let pParent = effectivePositions.get(fromId);
          let pChild = effectivePositions.get(toId);

          if (parent.get(fromId) === toId) {
            pParent = effectivePositions.get(toId);
            pChild = effectivePositions.get(fromId);
          }

          if (!pParent || !pChild) return null;

          const edgeKey = getUndirectedEdgeKey(fromId, toId);
          const isOnDiameter = isDiameterActive && diameterInfo.pathEdgeKeys.has(edgeKey);
          const updateInfo = updatedEdges.find(u => u.edgeKey === edgeKey);
          const isHighlight = edge.highlight || isOnDiameter;

          let strokeColor = '#334155';
          let strokeWidth = 2;
          let filter: string | undefined = undefined;

          if (isOnDiameter) {
            strokeColor = '#fbbf24'; // Vàng Hổ Phách rực rỡ cho Đường kính
            strokeWidth = 4.5;
            filter = 'url(#tree-glow-amber)';
          } else if (updateInfo) {
            strokeColor = '#06b6d4'; // Cyan phát sáng khi vừa cập nhật
            strokeWidth = 4;
            filter = 'url(#tree-glow-cyan)';
          } else if (edge.highlight) {
            strokeColor = '#ff7597';
            strokeWidth = 3.5;
          }

          const startX = pParent.x;
          const startY = pParent.y + nodeRadius;
          const endX = pChild.x;
          const endY = pChild.y - nodeRadius;

          const midY = (startY + endY) / 2;
          const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

          return (
            <g key={`tree-edge-${edge.from}-${edge.to}-${idx}`}>
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                filter={filter}
                markerEnd={edge.directed ? (isOnDiameter ? 'url(#tree-arrow-diameter)' : (isHighlight ? 'url(#tree-arrow-highlight)' : 'url(#tree-arrow-normal)')) : undefined}
                className="transition-all duration-300"
              />

              {/* Trọng số cạnh (Edge Weight Pill) */}
              {updateInfo ? (
                // Cạnh vừa được cập nhật trọng số trong frame này
                <g className="cursor-pointer">
                  <rect
                    x={(startX + endX) / 2 - 32}
                    y={midY - 11}
                    width="64"
                    height="22"
                    rx="5"
                    fill="#082f49"
                    stroke="#06b6d4"
                    strokeWidth="1.8"
                    className="animate-pulse shadow-lg"
                  />
                  <text
                    x={(startX + endX) / 2}
                    y={midY + 4}
                    fill="#67e8f9"
                    fontSize="10"
                    fontFamily="Consolas, monospace"
                    textAnchor="middle"
                    className="font-black"
                  >
                    {updateInfo.oldWeight !== undefined ? `${updateInfo.oldWeight}➔` : '🔄'}{updateInfo.newWeight}
                  </text>
                </g>
              ) : edge.weight !== undefined ? (
                // Cạnh bình thường hoặc trên đường kính
                <g>
                  <rect
                    x={(startX + endX) / 2 - (isOnDiameter ? 18 : 14)}
                    y={midY - (isOnDiameter ? 10 : 8)}
                    width={isOnDiameter ? 36 : 28}
                    height={isOnDiameter ? 20 : 16}
                    rx={isOnDiameter ? 5 : 3}
                    fill={isOnDiameter ? '#1c1917' : '#070b14'}
                    stroke={isOnDiameter ? '#fbbf24' : (edge.highlight ? '#ff7597' : '#334155')}
                    strokeWidth={isOnDiameter ? 1.8 : 1}
                    filter={isOnDiameter ? 'url(#tree-glow-amber)' : undefined}
                  />
                  <text
                    x={(startX + endX) / 2}
                    y={midY + (isOnDiameter ? 4 : 3)}
                    fill={isOnDiameter ? '#fde68a' : (edge.highlight ? '#ff7597' : '#38bdf8')}
                    fontSize={isOnDiameter ? "11" : "10"}
                    fontFamily="Consolas, monospace"
                    textAnchor="middle"
                    className={isOnDiameter ? 'font-black' : 'font-bold'}
                  >
                    {edge.weight}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        {/* 4. Render các đỉnh cây (Tree Nodes) */}
        {nodes.map((node, nIdx) => {
          const sId = String(node.id);
          let pos = effectivePositions.get(sId);
          if (!pos) {
            pos = { x: leftPadding + nIdx * leafSpacing, y: topPadding };
          }

          const isRoot = sId === primaryRoot || forestRoots.includes(sId);
          const isHighlight = node.highlight;
          const isOnDiameter = isDiameterActive && diameterInfo.pathNodes.includes(sId);
          const isEndpoint1 = isDiameterActive && diameterInfo.endpoints?.[0] === sId;
          const isEndpoint2 = isDiameterActive && diameterInfo.endpoints?.[1] === sId;
          const isEndpoint = isEndpoint1 || isEndpoint2;

          let fillColor = '#0f172a';
          let strokeColor = '#475569';

          if (isEndpoint) {
            fillColor = '#78350f'; // Đậm nét hổ phách cho đầu mút đường kính
            strokeColor = '#fbbf24';
          } else if (isOnDiameter) {
            fillColor = '#1c1917';
            strokeColor = '#fbbf24'; // Đỉnh trên đường kính
          } else if (isHighlight) {
            fillColor = '#ff7597';
            strokeColor = '#ffd1dc';
          } else if (isRoot) {
            strokeColor = '#38bdf8'; // Gốc viền sky
          }

          return (
            <g
              key={sId}
              onMouseDown={(e) => handleMouseDown(sId, e)}
              className={`transition-all duration-150 ${
                allowDrag
                  ? (draggedNodeId === sId ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105')
                  : 'cursor-pointer'
              }`}
            >
              {/* Vòng nhận diện đặc biệt cho 2 ĐẦU MÚT ĐƯỜNG KÍNH (ENDPOINTS) */}
              {isEndpoint && (
                <>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 8}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    filter="url(#tree-glow-amber)"
                    className="animate-pulse"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke="#fef08a"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                </>
              )}

              {/* Vòng hào quang phát sáng khi đỉnh nằm trên đường kính */}
              {isOnDiameter && !isEndpoint && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 5}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                  opacity="0.9"
                />
              )}

              {/* Vòng hào quang phát sáng khi được highlight theo thuật toán khác */}
              {isHighlight && !isOnDiameter && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 6}
                  fill="none"
                  stroke="#ff7597"
                  strokeWidth="2"
                  opacity="0.7"
                  className="animate-pulse"
                />
              )}

              {/* Vòng nhận diện đặc biệt cho đỉnh GỐC (ROOT) */}
              {isRoot && !isEndpoint && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 5}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  opacity="0.9"
                />
              )}

              {/* Khối tròn đỉnh */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isEndpoint ? 3 : (isOnDiameter ? 2.5 : 2.2)}
                className="transition-all duration-200"
              />

              {/* Nhãn hiển thị ID/Giá trị đỉnh */}
              <text
                x={pos.x}
                y={pos.y + (nodeRadius < 16 ? 3 : 4)}
                fill={isHighlight && !isOnDiameter ? '#090e1d' : '#f8fafc'}
                fontSize={nodeRadius < 16 ? "9" : "11"}
                fontWeight="bold"
                fontFamily="Consolas, monospace"
                textAnchor="middle"
              >
                {node.label || node.id}
              </text>

              {/* Trọng số của đỉnh (Node Weight) */}
              {node.weight !== undefined && (
                <g>
                  <rect
                    x={pos.x - 22}
                    y={pos.y + nodeRadius + 3}
                    width="44"
                    height="14"
                    rx="4"
                    fill="#070b14"
                    stroke={isOnDiameter ? "#fbbf24" : (isHighlight ? "#ff7597" : "#38bdf8")}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + nodeRadius + 13}
                    fill={isOnDiameter ? "#fde68a" : (isHighlight ? "#ff7597" : "#38bdf8")}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="Consolas, monospace"
                    textAnchor="middle"
                  >
                    w:{node.weight}
                  </text>
                </g>
              )}

              {/* Huy hiệu [🎯 ĐẦU MÚT 1 / 2] bên dưới đầu mút đường kính */}
              {isEndpoint && (
                <g>
                  <rect
                    x={pos.x - 38}
                    y={pos.y + nodeRadius + (node.weight !== undefined ? 20 : 5)}
                    width="76"
                    height="17"
                    rx="4"
                    fill="#451a03"
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                    filter="url(#tree-glow-amber)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + nodeRadius + (node.weight !== undefined ? 32 : 17)}
                    fill="#fef08a"
                    fontSize="9.5"
                    fontFamily="Consolas, monospace"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    {isEndpoint1 ? '🎯 ĐẦU MÚT 1' : '🎯 ĐẦU MÚT 2'}
                  </text>
                </g>
              )}

              {/* Huy hiệu [ROOT] phía trên đỉnh gốc */}
              {isRoot && (
                <g>
                  <rect
                    x={pos.x - 22}
                    y={pos.y - 36}
                    width="44"
                    height="15"
                    rx="3"
                    fill="#0369a1"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 25}
                    fill="#e0f2fe"
                    fontSize="9"
                    fontFamily="Consolas, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    👑 ROOT
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
