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

  const width = 560;
  const height = 360;
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
        x: Math.max(35, Math.min(width - 35, (node.x / 100) * width)),
        y: Math.max(35, Math.min(height - 35, (node.y / 100) * height))
      });
    } else {
      // Xếp đều thành vòng tròn
      const angle = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2;
      nodePositions.set(sId, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      });
    }
  });

  // Bảng màu cho các nhóm DSU
  const groupColors: Record<string, { fill: string; stroke: string; text: string }> = {
    '0': { fill: '#0c4a6e', stroke: '#38bdf8', text: '#e0f2fe' }, // sky
    '1': { fill: '#831843', stroke: '#ff7597', text: '#fce7f3' }, // sakura
    '2': { fill: '#3b0764', stroke: '#a855f7', text: '#f3e8ff' }, // purple
    '3': { fill: '#064e3b', stroke: '#34d399', text: '#d1fae5' }, // emerald
    '4': { fill: '#451a03', stroke: '#fbbf24', text: '#fef3c7' }, // amber
    '5': { fill: '#1e1b4b', stroke: '#818cf8', text: '#e0e7ff' }, // indigo
    '6': { fill: '#14532d', stroke: '#4ade80', text: '#dcfce7' }, // green
    '7': { fill: '#701a75', stroke: '#f472b6', text: '#fdf2f8' }  // pink
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 overflow-x-auto w-full">
      <svg
        width={width}
        height={height}
        className="overflow-visible select-none max-w-full"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Render các cạnh nối (Edges) */}
        {edges.map((edge, idx) => {
          const p1 = nodePositions.get(String(edge.from));
          const p2 = nodePositions.get(String(edge.to));
          if (!p1 || !p2) return null;

          const isHighlight = edge.highlight;
          let strokeColor = '#334155';
          let strokeWidth = 2;

          if (edge.color === 'yellow' || edge.color === 'amber' || edge.color === 'gold' || edge.color === 'power') {
            strokeColor = '#fbbf24';
            strokeWidth = 3.5;
          } else if (edge.color === 'emerald' || edge.color === 'green') {
            strokeColor = '#10b981';
            strokeWidth = 3.5;
          } else if (edge.color === 'rose' || edge.color === 'red') {
            strokeColor = '#f43f5e';
            strokeWidth = 3.5;
          } else if (edge.color === 'sakura' || isHighlight) {
            strokeColor = '#ff7597';
            strokeWidth = 3.5;
          } else if (edge.color === 'sky') {
            strokeColor = '#38bdf8';
            strokeWidth = 3;
          } else if (edge.color) {
            strokeColor = edge.color;
            strokeWidth = 3;
          }

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
                strokeLinecap="round"
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
          let textColor = '#f8fafc';
          let haloColor = isHighlight ? '#ff7597' : null;
          let statusBadge: string | null = null;

          // 1. Kiểm tra màu tùy chỉnh (color: emerald / rose / sky / amber / yellow / gold / plant / ...)
          const isPowerContext = (frame.description || '').toLowerCase().includes('điện') ||
                                 (frame.description || '').toLowerCase().includes('sáng đèn') ||
                                 (frame.description || '').toLowerCase().includes('nhà máy');

          const isPlant = node.color === 'plant' ||
                          node.status === 'plant' ||
                          (isPowerContext && (frame.description || '').toLowerCase().includes(`nhà máy điện tại thành phố ${node.id}`));

          const isLit = node.color === 'yellow' ||
                        node.color === 'amber' ||
                        node.color === 'gold' ||
                        node.status === 'lit' ||
                        node.status === 'powered' ||
                        (isPowerContext && isHighlight);

          if (isPlant) {
            fillColor = '#713f12'; // Nền vàng nâu đậm
            strokeColor = '#facc15'; // Viền vàng rực rỡ
            textColor = '#ffffff';
            haloColor = '#facc15';
            statusBadge = '⚡';
          } else if (isLit) {
            fillColor = '#451a03'; // Nền hổ phách
            strokeColor = '#fbbf24'; // Viền vàng sáng đèn
            textColor = '#fef08a'; // Chữ vàng rực
            haloColor = '#fbbf24'; // Vòng hào quang sáng đèn
            statusBadge = '💡';
          } else if (node.color === 'dark' || node.color === 'off' || node.status === 'off' || node.status === 'unpowered') {
            fillColor = '#090d16';
            strokeColor = '#1e293b';
            textColor = '#64748b';
            haloColor = null;
            statusBadge = '✕';
          } else if (node.color === 'emerald' || node.color === 'green') {
            fillColor = '#064e3b';
            strokeColor = '#10b981';
            textColor = '#6ee7b7';
            haloColor = '#10b981';
            statusBadge = '✓';
          } else if (node.color === 'rose' || node.color === 'red') {
            fillColor = '#4c0519';
            strokeColor = '#f43f5e';
            textColor = '#fda4af';
            haloColor = '#f43f5e';
            statusBadge = '✕';
          } else if (node.color === 'sky') {
            fillColor = '#0c4a6e';
            strokeColor = '#38bdf8';
            textColor = '#7dd3fc';
            haloColor = '#38bdf8';
          } else if (node.group !== undefined) {
            // 2. Nhóm DSU (Mỗi thành phần liên thông 1 màu nổi bật)
            const gIdx = String(Math.abs(Number(node.group)) % 8);
            const gc = groupColors[gIdx] || groupColors['0'];
            fillColor = gc.fill;
            strokeColor = gc.stroke;
            textColor = gc.text;
          } else if (isHighlight) {
            fillColor = '#831843';
            strokeColor = '#ff7597';
            textColor = '#fce7f3';
            haloColor = '#ff7597';
          }

          return (
            <g key={node.id} className="transition-all duration-300 cursor-pointer">
              {/* Vòng hào quang nếu highlight / đang được cấp điện hoặc check liên thông */}
              {haloColor && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="26"
                  fill="none"
                  stroke={haloColor}
                  strokeWidth="2.5"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}

              {/* Khối đỉnh (Thành phố / Thùng nước) */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="19"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />

              {/* Nhãn đỉnh */}
              <text
                x={pos.x}
                y={pos.y + 4.5}
                fill={textColor}
                fontSize="12"
                fontWeight="bold"
                fontFamily="Consolas, monospace"
                textAnchor="middle"
              >
                {node.label || node.id}
              </text>

              {/* Huy hiệu trạng thái (⚡ Nhà máy, 💡 Sáng đèn, ✓ hoặc ✕) */}
              {statusBadge && (
                <g transform={`translate(${pos.x + 11}, ${pos.y - 18})`}>
                  <circle
                    r="8.5"
                    fill={
                      statusBadge === '⚡'
                        ? '#eab308'
                        : statusBadge === '💡'
                        ? '#f59e0b'
                        : node.color === 'emerald'
                        ? '#10b981'
                        : '#f43f5e'
                    }
                    stroke="#090e1d"
                    strokeWidth="1.5"
                  />
                  <text
                    y="3"
                    fill={statusBadge === '⚡' || statusBadge === '💡' ? '#000000' : '#ffffff'}
                    fontSize="9"
                    fontWeight="black"
                    fontFamily="Segoe UI Emoji, Apple Color Emoji, Consolas, monospace"
                    textAnchor="middle"
                  >
                    {statusBadge}
                  </text>
                </g>
              )}

              {/* Hiển thị trọng số đỉnh nếu có */}
              {node.weight !== undefined && (
                <text
                  x={pos.x}
                  y={pos.y + 32}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="Consolas, monospace"
                  textAnchor="middle"
                  className="font-bold"
                >
                  w:{node.weight}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
