import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Frame, NodeItem, EdgeItem } from '../../types';

interface TreeVisualizerProps {
  frame: Frame;
  rootId?: string;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ frame, rootId }) => {
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

  // 2. Chuẩn hóa edges (đảm bảo from và to luôn là string)
  let edges: EdgeItem[] = rawEdges.map((e: any) => ({
    ...e,
    from: String(e.from),
    to: String(e.to)
  }));

  // 3. Fallback: Nếu nodes rỗng nhưng edges có thì tự động tái tạo nodes từ edges
  if (nodes.length === 0 && edges.length > 0) {
    const idSet = new Set<string>();
    edges.forEach(e => {
      idSet.add(e.from);
      idSet.add(e.to);
    });
    nodes = Array.from(idSet).map(id => ({ id, label: id, highlight: false }));
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <span className="text-xs font-mono">Đang nạp cấu trúc cây...</span>
      </div>
    );
  }

  // 4. Xây dựng danh sách kề vô hướng (vì cây trong input CP thường cho cạnh 2 chiều u - v)
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(String(n.id), []));
  edges.forEach(e => {
    adj.get(String(e.from))?.push(String(e.to));
    adj.get(String(e.to))?.push(String(e.from));
  });

  // 5. Xác định các đỉnh gốc (Forest Roots)
  let primaryRoot = frame.rootId ? String(frame.rootId) : (rootId ? String(rootId) : undefined);
  if (!primaryRoot || !nodes.find(n => n.id === primaryRoot)) {
    primaryRoot = nodes[0]?.id;
  }

  // 6. Xây dựng cấu trúc cây cha - con (Directed Parent -> Children) từ gốc bằng DFS
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

  // 7. Thuật toán bố trí cây phân cấp chuẩn (Reingold-Tilford / In-order Leaf Placement)
  // Đảm bảo: Gốc ở trên cùng chính giữa, các nhánh con rẽ đều xuống dưới, không bao giờ bị đè nhau
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

  // Duyệt cây hậu thứ tự (Post-order) để tính tọa độ x:
  // - Nếu là lá: gán tọa độ x tăng dần theo thứ tự lá
  // - Nếu là nút cha: tọa độ x = trung bình cộng tọa độ x của nút con đầu tiên và nút con cuối cùng
  function computeCoordinates(u: string) {
    const ch = children.get(u) || [];
    const d = depth.get(u) || 0;
    const y = topPadding + d * levelHeight;

    if (ch.length === 0) {
      // Đỉnh lá
      const x = leftPadding + leafCounter * leafSpacing;
      leafCounter++;
      nodePositions.set(u, { x, y });
    } else {
      // Duyệt tất cả con trước
      ch.forEach(v => computeCoordinates(v));
      const firstChildPos = nodePositions.get(ch[0]);
      const lastChildPos = nodePositions.get(ch[ch.length - 1]);
      const x = (firstChildPos && lastChildPos)
        ? (firstChildPos.x + lastChildPos.x) / 2
        : leftPadding + leafCounter * leafSpacing;
      nodePositions.set(u, { x, y });
    }
  }

  // Tính tọa độ cho tất cả các cây trong rừng
  forestRoots.forEach((r, idx) => {
    computeCoordinates(r);
    if (idx < forestRoots.length - 1) {
      leafCounter += 0.5; // Khoảng cách phân cách giữa các cây trong rừng
    }
  });

  // Đảm bảo mọi node đều có tọa độ (fallback an toàn tuyệt đối)
  nodes.forEach((n, idx) => {
    const sId = String(n.id);
    if (!nodePositions.has(sId)) {
      nodePositions.set(sId, {
        x: leftPadding + (leafCounter + idx) * leafSpacing,
        y: topPadding
      });
    }
  });

  // Định cỡ canvas SVG tự động co giãn theo số lượng nút và độ sâu
  const totalLeaves = Math.max(leafCounter, 1);
  const width = Math.max(560, leftPadding * 2 + (totalLeaves - 1) * leafSpacing);
  const height = Math.max(340, topPadding + maxDepth * levelHeight + 70);

  // Nếu cây hẹp, căn giữa toàn bộ cây vào giữa viewBox
  const allX = Array.from(nodePositions.values()).map(p => p.x);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const treeWidth = maxX - minX;
  const shiftX = (width - treeWidth) / 2 - minX;

  nodePositions.forEach((pos, id) => {
    nodePositions.set(id, { x: pos.x + shiftX, y: pos.y });
  });

  // Trạng thái cho phép kéo thả di chuyển node (Mặc định là KHÔNG)
  const [allowDrag, setAllowDrag] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragPositions, setDragPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Vị trí thực tế của các đỉnh (kết hợp vị trí tự động + vị trí người dùng kéo thả)
  const effectivePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    nodePositions.forEach((pos, id) => {
      const custom = dragPositions.get(id);
      map.set(id, custom ? { ...custom } : { ...pos });
    });
    return map;
  }, [nodePositions, dragPositions]);

  // Xử lý kéo thả đỉnh (Drag & Drop)
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

  // Gom các mức tầng để vẽ vạch phân tầng (Level Guides)
  const levels = Array.from({ length: maxDepth + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center p-3 overflow-x-auto w-full select-none">
      {/* Thanh điều khiển trên cùng */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-2 mb-2 border-b border-midnight-800 text-xs font-mono">
        {forestRoots.length > 1 ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-900 border border-sakura-500/30 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Rừng cây: <strong className="text-emerald-300 font-bold">{forestRoots.length} cây độc lập</strong></span>
            <span className="text-slate-600">|</span>
            <span>Tổng số: <strong className="text-white font-bold">{totalNodes} đỉnh</strong></span>
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
          {/* Mũi tên chỉ hướng rẽ nhánh từ cha xuống con */}
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

        {/* Render các nhánh cây (Cubic Bezier Tree Branches) */}
        {edges.map((edge, idx) => {
          const fromId = String(edge.from);
          const toId = String(edge.to);

          // Xác định nút cha và nút con theo cấu trúc phân cấp từ root
          let pParent = effectivePositions.get(fromId);
          let pChild = effectivePositions.get(toId);

          // Nếu edge được khai báo ngược (con -> cha), đảo lại để nhánh cong đúng từ trên xuống
          if (parent.get(fromId) === toId) {
            pParent = effectivePositions.get(toId);
            pChild = effectivePositions.get(fromId);
          }

          if (!pParent || !pChild) return null;

          const isHighlight = edge.highlight;
          const strokeColor = isHighlight ? '#ff7597' : '#334155';
          const strokeWidth = isHighlight ? 3.5 : 2;

          // Điểm xuất phát từ đáy nút cha, điểm kết thúc ở đỉnh nút con
          const startX = pParent.x;
          const startY = pParent.y + nodeRadius;
          const endX = pChild.x;
          const endY = pChild.y - nodeRadius;

          // Đường cong Bézier uốn mượt mà từ cha rẽ xuống con
          const midY = (startY + endY) / 2;
          const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

          return (
            <g key={`tree-edge-${edge.from}-${edge.to}-${idx}`}>
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={isHighlight ? 'url(#tree-arrow-highlight)' : 'url(#tree-arrow-normal)'}
                className="transition-all duration-300"
              />
              {edge.weight !== undefined && (
                <g>
                  <rect
                    x={(startX + endX) / 2 - 12}
                    y={midY - 8}
                    width="24"
                    height="15"
                    rx="3"
                    fill="#070b14"
                    stroke={isHighlight ? "#ff7597" : "#334155"}
                    strokeWidth="1"
                  />
                  <text
                    x={(startX + endX) / 2}
                    y={midY + 3}
                    fill={isHighlight ? "#ff7597" : "#38bdf8"}
                    fontSize="10"
                    fontFamily="Consolas, monospace"
                    textAnchor="middle"
                    className="font-bold"
                  >
                    {edge.weight}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Render các đỉnh cây (Tree Nodes) */}
        {nodes.map((node, nIdx) => {
          const sId = String(node.id);
          let pos = effectivePositions.get(sId);
          if (!pos) {
            pos = { x: leftPadding + nIdx * leafSpacing, y: topPadding };
          }

          const isRoot = sId === primaryRoot || forestRoots.includes(sId);
          const isHighlight = node.highlight;
          let fillColor = '#0f172a';
          let strokeColor = '#475569';

          if (isHighlight) {
            fillColor = '#ff7597';
            strokeColor = '#ffd1dc';
          } else if (isRoot) {
            strokeColor = '#38bdf8'; // Gốc có viền xanh sky
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
              {/* Vòng hào quang phát sáng khi được highlight */}
              {isHighlight && (
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
              {isRoot && (
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
                strokeWidth="2.2"
                className="transition-all duration-200"
              />

              {/* Nhãn hiển thị ID/Giá trị đỉnh */}
              <text
                x={pos.x}
                y={pos.y + (nodeRadius < 16 ? 3 : 4)}
                fill={isHighlight ? '#090e1d' : '#f8fafc'}
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
                    stroke={isHighlight ? "#ff7597" : "#38bdf8"}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + nodeRadius + 13}
                    fill={isHighlight ? "#ff7597" : "#38bdf8"}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="Consolas, monospace"
                    textAnchor="middle"
                  >
                    w:{node.weight}
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
