import React from 'react';
import { Frame, NodeItem, EdgeItem } from '../../types';

interface TreeVisualizerProps {
  frame: Frame;
  rootId?: string;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ frame, rootId }) => {
  const nodes: NodeItem[] = frame.nodes || [];
  const edges: EdgeItem[] = frame.edges || [];

  if (nodes.length === 0) return null;

  const width = 560;
  const height = 340;

  // 1. Xây dựng danh sách kề
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.from)?.push(e.to);
    adj.get(e.to)?.push(e.from);
  });

  // 2. Xác định đỉnh gốc (root) từ frame.rootId hoặc prop rootId, không mặc định cố định là 1
  let root = frame.rootId || rootId;
  if (!root || !nodes.find(n => n.id === root)) {
    // Nếu không có, lấy đỉnh đầu tiên
    root = nodes[0]?.id;
  }

  // 3. Xây dựng cây phân cấp (cha - con) từ root bằng BFS/DFS
  const children = new Map<string, string[]>();
  const depth = new Map<string, number>();
  const visited = new Set<string>();

  function dfs(u: string, d: number) {
    visited.add(u);
    depth.set(u, d);
    children.set(u, []);
    for (const v of adj.get(u) || []) {
      if (!visited.has(v)) {
        children.get(u)!.push(v);
        dfs(v, d + 1);
      }
    }
  }
  dfs(root, 0);

  // Xử lý các đỉnh chưa duyệt (nếu có đỉnh rời rạc)
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfs(n.id, 0);
    }
  });

  // 4. Tính toán độ rộng của từng nhánh cây (subtree leaf count)
  function getSubtreeWidth(u: string): number {
    const ch = children.get(u) || [];
    if (ch.length === 0) return 1;
    return ch.reduce((sum, v) => sum + getSubtreeWidth(v), 0);
  }

  // 5. Gán tọa độ (x, y) chuẩn cây từ trên xuống dưới (Top-Down Hierarchical Tree)
  const nodePositions = new Map<string, { x: number; y: number }>();
  const maxDepth = Math.max(...Array.from(depth.values()), 1);
  const levelHeight = Math.min(80, (height - 90) / maxDepth);

  function assignPositions(u: string, xMin: number, xMax: number) {
    const ch = children.get(u) || [];
    const d = depth.get(u) || 0;
    const y = 45 + d * levelHeight;
    const x = (xMin + xMax) / 2;
    nodePositions.set(u, { x, y });

    const totalWidth = getSubtreeWidth(u);
    let currentX = xMin;
    for (const v of ch) {
      const vWidth = getSubtreeWidth(v);
      const nextX = currentX + (vWidth / totalWidth) * (xMax - xMin);
      assignPositions(v, currentX, nextX);
      currentX = nextX;
    }
  }

  assignPositions(root, 35, width - 35);

  return (
    <div className="flex flex-col items-center justify-center p-2 overflow-x-auto w-full">
      <svg
        width={width}
        height={height}
        className="overflow-visible select-none"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Render các cạnh cây (Edges) */}
        {edges.map((edge, idx) => {
          const p1 = nodePositions.get(edge.from);
          const p2 = nodePositions.get(edge.to);
          if (!p1 || !p2) return null;

          const isHighlight = edge.highlight;
          const strokeColor = isHighlight ? '#ff7597' : '#334155';
          const strokeWidth = isHighlight ? 3.5 : 1.5;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          return (
            <g key={`tree-edge-${edge.from}-${edge.to}-${idx}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className="transition-all duration-300"
              />
              {edge.weight !== undefined && (
                <text
                  x={midX}
                  y={midY - 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="Consolas, monospace"
                  textAnchor="middle"
                  className="font-bold"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Render các đỉnh cây (Nodes) */}
        {nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const isRoot = node.id === root;
          const isHighlight = node.highlight;
          let fillColor = '#0f172a';
          let strokeColor = '#475569';

          if (isHighlight) {
            fillColor = '#ff7597';
            strokeColor = '#ffd1dc';
          } else if (isRoot) {
            strokeColor = '#38bdf8'; // Gốc có viền xanh sky báo hiệu
          }

          return (
            <g key={node.id} className="transition-all duration-300 cursor-pointer">
              {/* Vòng sáng khi highlight */}
              {isHighlight && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="24"
                  fill="none"
                  stroke="#ff7597"
                  strokeWidth="2"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}

              {/* Vòng báo hiệu gốc nếu là root */}
              {isRoot && !isHighlight && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="22"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}

              {/* Khối đỉnh */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="18"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
                className="transition-all duration-200"
              />

              {/* Nhãn đỉnh */}
              <text
                x={pos.x}
                y={pos.y + 4}
                fill={isHighlight ? '#090e1d' : '#f8fafc'}
                fontSize="11"
                fontWeight="bold"
                fontFamily="Consolas, monospace"
                textAnchor="middle"
              >
                {node.label || node.id}
              </text>

              {/* Ghi chú 'root' nhỏ bên cạnh đỉnh gốc */}
              {isRoot && (
                <text
                  x={pos.x}
                  y={pos.y - 22}
                  fill="#38bdf8"
                  fontSize="9"
                  fontFamily="Consolas, monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  [ROOT]
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
