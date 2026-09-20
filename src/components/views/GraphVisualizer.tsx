import React from 'react';
import { Frame, NodeItem, EdgeItem } from '../../types';

interface GraphVisualizerProps {
  frame: Frame;
  isCircular?: boolean;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ frame, isCircular = false }) => {
  const rawNodes = frame.nodes || [];
  const rawEdges = frame.edges || [];

  // 1. Chuẩn hóa nodes (đảm bảo id và label luôn là string)
  let nodes: NodeItem[] = rawNodes.map((n: any, idx: number) =>
    typeof n === 'object' && n !== null
      ? { ...n, id: String(n.id ?? n.label ?? idx + 1), label: String(n.label ?? n.id ?? idx + 1) }
      : { id: String(n), label: String(n), highlight: false }
  );

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
        <span className="text-xs font-mono">Đang nạp cấu trúc đồ thị...</span>
      </div>
    );
  }

  const width = 500;
  const height = 320;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;

  // Tính toán vị trí các đỉnh
  const nodePositions = new Map<string, { x: number; y: number }>();

  nodes.forEach((node, idx) => {
    const sId = String(node.id);
    if (node.x !== undefined && node.y !== undefined) {
      // Chuẩn hóa tọa độ nếu có sẵn
      nodePositions.set(sId, {
        x: Math.max(30, Math.min(width - 30, (node.x / 100) * width)),
        y: Math.max(30, Math.min(height - 30, (node.y / 100) * height))
      });
    } else {
      // Mặc định xếp thành vòng tròn (Circular / General Graph Layout)
      const angle = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2;
      nodePositions.set(sId, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      });
    }
  });

  // Bảng màu cho các nhóm DSU
  const groupColors: Record<string, string> = {
    '0': '#38bdf8', // sky
    '1': '#ff7597', // sakura
    '2': '#a78bfa', // purple
    '3': '#34d399', // emerald
    '4': '#fbbf24'  // amber
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 overflow-x-auto">
      <svg
        width={width}
        height={height}
        className="overflow-visible select-none"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Render các cạnh nối (Edges) */}
        {edges.map((edge, idx) => {
          const p1 = nodePositions.get(String(edge.from));
          const p2 = nodePositions.get(String(edge.to));
          if (!p1 || !p2) return null;

          const isHighlight = edge.highlight;
          const strokeColor = isHighlight ? '#ff7597' : '#334155';
          const strokeWidth = isHighlight ? 3 : 1.5;

          // Vị trí trọng số ở giữa cạnh
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          return (
            <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={edge.weight ? undefined : undefined}
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

        {/* Render các đỉnh (Nodes) */}
        {nodes.map((node) => {
          const pos = nodePositions.get(String(node.id));
          if (!pos) return null;

          const isHighlight = node.highlight;
          let fillColor = '#0f172a';
          let strokeColor = '#475569';

          if (node.group !== undefined) {
            const gKey = String(node.group);
            fillColor = groupColors[gKey] || '#ff7597';
            strokeColor = '#ffffff';
          } else if (isHighlight) {
            fillColor = '#ff7597';
            strokeColor = '#ffd1dc';
          }

          return (
            <g key={node.id} className="transition-all duration-300 cursor-pointer">
              {/* Vòng hào quang nếu highlight */}
              {isHighlight && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="24"
                  fill="none"
                  stroke="#ff7597"
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-pulse"
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
                fill={isHighlight || node.group !== undefined ? '#090e1d' : '#f8fafc'}
                fontSize="12"
                fontWeight="bold"
                fontFamily="Consolas, monospace"
                textAnchor="middle"
              >
                {node.label || node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
