import React, { useMemo } from 'react';
import { Frame, NodeItem, EdgeItem, VisualizationSpec } from '../../types';

interface GraphVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
  isCircular?: boolean;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ frame, spec, isCircular = false }) => {
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
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Đang nạp cấu trúc đồ thị...
      </div>
    );
  }

  const width = 640;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;

  // Tính toán vị trí các đỉnh ổn định (Deterministic layout theo ID)
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const total = nodes.length;

    // Sắp xếp nodes theo id để vị trí vòng tròn luôn cố định giữa các frame
    const sortedNodes = [...nodes].sort((a, b) => {
      const numA = Number(a.id);
      const numB = Number(b.id);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.id).localeCompare(String(b.id));
    });

    sortedNodes.forEach((node, idx) => {
      const sId = String(node.id);
      if (node.x !== undefined && node.y !== undefined) {
        positions.set(sId, {
          x: Math.max(40, Math.min(width - 40, (node.x / 100) * width)),
          y: Math.max(40, Math.min(height - 40, (node.y / 100) * height))
        });
      } else {
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        positions.set(sId, {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle)
        });
      }
    });

    return positions;
  }, [nodes, width, height, cx, cy, radius]);

  // Đếm các cạnh song song giữa các cặp đỉnh để vẽ đường cong
  const edgePairCounts = useMemo(() => {
    const counts = new Map<string, number>();
    edges.forEach(e => {
      const u = String(e.from);
      const v = String(e.to);
      const key = u < v ? `${u}--${v}` : `${v}--${u}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [edges]);

  const edgePairSeen = new Map<string, number>();

  // Bảng màu cho các nhóm DSU
  const groupColors: Record<string, { fill: string; stroke: string; text: string }> = {
    '0': { fill: '#0c4a6e', stroke: '#38bdf8', text: '#e0f2fe' },
    '1': { fill: '#831843', stroke: '#ff7597', text: '#fce7f3' },
    '2': { fill: '#3b0764', stroke: '#a855f7', text: '#f3e8ff' },
    '3': { fill: '#064e3b', stroke: '#34d399', text: '#d1fae5' },
    '4': { fill: '#451a03', stroke: '#fbbf24', text: '#fef3c7' },
    '5': { fill: '#1e1b4b', stroke: '#818cf8', text: '#e0e7ff' },
    '6': { fill: '#14532d', stroke: '#4ade80', text: '#dcfce7' },
    '7': { fill: '#701a75', stroke: '#f472b6', text: '#fdf2f8' }
  };

  const isDirected = spec?.directed === true || edges.some(e => e.directed);

  return (
    <div className="flex flex-col items-center justify-center p-2 overflow-x-auto w-full select-none">
      <svg
        width={width}
        height={height}
        className="overflow-visible max-w-full font-mono"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <marker
            id="graph-arrow"
            viewBox="0 0 10 10"
            refX="23"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>
          <marker
            id="graph-arrow-hl"
            viewBox="0 0 10 10"
            refX="23"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ff7597" />
          </marker>
          <marker
            id="graph-arrow-yellow"
            viewBox="0 0 10 10"
            refX="23"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Render các cạnh nối (Edges) */}
        {edges.map((edge, idx) => {
          const p1 = nodePositions.get(String(edge.from));
          const p2 = nodePositions.get(String(edge.to));
          if (!p1 || !p2) return null;

          const isHighlight = edge.highlight;
          const edgeDirected = edge.directed !== undefined ? edge.directed : isDirected;

          let strokeColor = '#334155';
          let strokeWidth = 2;
          let markerId = edgeDirected ? (isHighlight ? 'graph-arrow-hl' : 'graph-arrow') : undefined;

          if (edge.color === 'yellow' || edge.color === 'amber' || edge.color === 'gold' || edge.color === 'power') {
            strokeColor = '#fbbf24';
            strokeWidth = 3.5;
            if (edgeDirected) markerId = 'graph-arrow-yellow';
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

          // 1. Cạnh khuyên (Self-loop: from === to)
          if (edge.from === edge.to) {
            const loopPath = `M ${p1.x - 10} ${p1.y - 18} C ${p1.x - 35} ${p1.y - 65}, ${p1.x + 35} ${p1.y - 65}, ${p1.x + 10} ${p1.y - 18}`;
            return (
              <g key={`loop-${edge.from}-${idx}`}>
                <path
                  d={loopPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={markerId ? `url(#${markerId})` : undefined}
                />
                {edge.weight !== undefined && (
                  <text
                    x={p1.x}
                    y={p1.y - 55}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-bold"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          }

          // 2. Cạnh thông thường hoặc cạnh song song (Parallel edges)
          const pairKey = edge.from < edge.to ? `${edge.from}--${edge.to}` : `${edge.to}--${edge.from}`;
          const totalInPair = edgePairCounts.get(pairKey) || 1;
          const seenIdx = edgePairSeen.get(pairKey) || 0;
          edgePairSeen.set(pairKey, seenIdx + 1);

          let pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
          let midX = (p1.x + p2.x) / 2;
          let midY = (p1.y + p2.y) / 2;

          if (totalInPair > 1) {
            // Uốn cong cạnh song song
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const normX = -dy / len;
            const normY = dx / len;
            const offset = (seenIdx - (totalInPair - 1) / 2) * 28;

            midX += normX * offset;
            midY += normY * offset;
            pathD = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;
          }

          return (
            <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={edge.dashed ? '5 5' : undefined}
                markerEnd={markerId ? `url(#${markerId})` : undefined}
                className="transition-all duration-300"
              />
              {edge.weight !== undefined && (
                <text
                  x={midX}
                  y={midY - 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-bold bg-midnight-950 px-1"
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
            fillColor = '#713f12';
            strokeColor = '#facc15';
            textColor = '#ffffff';
            haloColor = '#facc15';
            statusBadge = '⚡';
          } else if (isLit) {
            fillColor = '#451a03';
            strokeColor = '#fbbf24';
            textColor = '#fef08a';
            haloColor = '#fbbf24';
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

              <circle
                cx={pos.x}
                cy={pos.y}
                r="19"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />

              <text
                x={pos.x}
                y={pos.y + 4.5}
                fill={textColor}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {node.label || node.id}
              </text>

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
                    textAnchor="middle"
                  >
                    {statusBadge}
                  </text>
                </g>
              )}

              {node.weight !== undefined && (
                <text
                  x={pos.x}
                  y={pos.y + 32}
                  fill="#94a3b8"
                  fontSize="10"
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
