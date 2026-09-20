import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Frame, VisualizationSpec, GeometryData } from '../../types';

interface GeometryVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const GeometryVisualizer: React.FC<GeometryVisualizerProps> = ({ frame, spec }) => {
  const geoData: GeometryData = frame.geometryData || {
    points: frame.points || [],
    segments: frame.segments || [],
    polygons: frame.polygons || [],
    circles: frame.circles || [],
    vectors: frame.vectors || [],
    coordinateSystem: frame.coordinateSystem || 'cartesian'
  };

  const points = geoData.points || [];
  const segments = geoData.segments || [];
  const polygons = geoData.polygons || [];
  const circles = geoData.circles || [];
  const vectors = geoData.vectors || [];

  // Tính toán Bounding Box tự động bao phủ tất cả tọa độ, có padding
  const bounds = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const includePoint = (x: number, y: number) => {
      if (typeof x === 'number' && !isNaN(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (typeof y === 'number' && !isNaN(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    };

    points.forEach(p => includePoint(p.x, p.y));
    segments.forEach(s => {
      includePoint(s.x1, s.y1);
      includePoint(s.x2, s.y2);
    });
    polygons.forEach(poly => {
      poly.points.forEach(p => includePoint(p.x, p.y));
    });
    circles.forEach(c => {
      includePoint(c.cx - c.r, c.cy - c.r);
      includePoint(c.cx + c.r, c.cy + c.r);
    });
    vectors.forEach(v => {
      includePoint(v.x1, v.y1);
      includePoint(v.x2, v.y2);
    });

    if (minX === Infinity) {
      minX = -10; maxX = 10; minY = -10; maxY = 10;
    } else {
      // Đảm bảo có kích thước tối thiểu để không bị chia cho 0
      if (minX === maxX) { minX -= 5; maxX += 5; }
      if (minY === maxY) { minY -= 5; maxY += 5; }
      const padX = Math.max((maxX - minX) * 0.15, 2);
      const padY = Math.max((maxY - minY) * 0.15, 2);
      minX -= padX;
      maxX += padX;
      minY -= padY;
      maxY += padY;
    }

    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [points, segments, polygons, circles, vectors]);

  // Kích thước canvas SVG chuẩn
  const svgWidth = 720;
  const svgHeight = 480;

  // Ánh xạ tọa độ Descartes sang tọa độ SVG (Y đảo ngược)
  const mapX = (x: number) => {
    return ((x - bounds.minX) / bounds.width) * (svgWidth - 80) + 40;
  };

  const mapY = (y: number) => {
    if (geoData.coordinateSystem === 'screen') {
      return ((y - bounds.minY) / bounds.height) * (svgHeight - 80) + 40;
    }
    // Mặc định Cartesian: y dương hướng lên trên
    return svgHeight - (((y - bounds.minY) / bounds.height) * (svgHeight - 80) + 40);
  };

  const mapRadius = (r: number) => {
    const scale = (svgWidth - 80) / bounds.width;
    return r * scale;
  };

  // Trục tọa độ X và Y (nếu nằm trong tầm nhìn)
  const axisX0 = bounds.minX <= 0 && bounds.maxX >= 0 ? mapX(0) : null;
  const axisY0 = bounds.minY <= 0 && bounds.maxY >= 0 ? mapY(0) : null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full p-2 select-none">
      <div className="relative w-full max-w-4xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Tiêu đề & Thông tin hệ trục */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2 border-b border-midnight-800 pb-2">
          <span className="text-sakura-400 font-bold">
            📐 Hình học phẳng ({geoData.coordinateSystem === 'screen' ? 'Hệ tọa độ màn hình' : 'Hệ tọa độ Descartes'})
          </span>
          <span className="text-slate-500">
            X: [{bounds.minX.toFixed(1)}, {bounds.maxX.toFixed(1)}] | Y: [{bounds.minY.toFixed(1)}, {bounds.maxY.toFixed(1)}]
          </span>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[500px] font-mono"
        >
          <defs>
            {/* Arrowhead marker */}
            <marker
              id="geo-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker
              id="geo-arrow-vector"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Grid lines mờ */}
          <line
            x1="40"
            y1={axisY0 ?? svgHeight - 40}
            x2={svgWidth - 40}
            y2={axisY0 ?? svgHeight - 40}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <line
            x1={axisX0 ?? 40}
            y1="40"
            x2={axisX0 ?? 40}
            y2={svgHeight - 40}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* Trục X & Y chính */}
          {axisY0 !== null && (
            <g>
              <line x1="20" y1={axisY0} x2={svgWidth - 20} y2={axisY0} stroke="#475569" strokeWidth="1.5" />
              <text x={svgWidth - 25} y={axisY0 - 6} fill="#94a3b8" fontSize="10" textAnchor="end">X</text>
            </g>
          )}
          {axisX0 !== null && (
            <g>
              <line x1={axisX0} y1={svgHeight - 20} x2={axisX0} y2="20" stroke="#475569" strokeWidth="1.5" />
              <text x={axisX0 + 8} y="25" fill="#94a3b8" fontSize="10">Y</text>
            </g>
          )}

          {/* Đa giác (Polygons) */}
          {polygons.map((poly, idx) => {
            const pointsStr = poly.points.map(p => `${mapX(p.x)},${mapY(p.y)}`).join(' ');
            const isHl = poly.highlight;
            const fillCol = poly.fillColor || (isHl ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.15)');
            const strokeCol = poly.strokeColor || (isHl ? '#f43f5e' : '#38bdf8');
            return (
              <polygon
                key={poly.id || `poly-${idx}`}
                points={pointsStr}
                fill={fillCol}
                stroke={strokeCol}
                strokeWidth={isHl ? 2.5 : 1.8}
                strokeDasharray={poly.dashed ? '5 5' : undefined}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Đường tròn (Circles) */}
          {circles.map((c, idx) => {
            const cx = mapX(c.cx);
            const cy = mapY(c.cy);
            const r = mapRadius(c.r);
            const isHl = c.highlight;
            return (
              <g key={c.id || `circle-${idx}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={c.fillColor || (isHl ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.12)')}
                  stroke={c.strokeColor || (isHl ? '#f43f5e' : '#10b981')}
                  strokeWidth={isHl ? 2.5 : 1.8}
                  strokeDasharray={c.dashed ? '5 5' : undefined}
                />
                {c.label && (
                  <text x={cx} y={cy - r - 6} fill="#f1f5f9" fontSize="11" textAnchor="middle" fontWeight="bold">
                    {c.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Đoạn thẳng (Segments) */}
          {segments.map((seg, idx) => {
            const x1 = mapX(seg.x1);
            const y1 = mapY(seg.y1);
            const x2 = mapX(seg.x2);
            const y2 = mapY(seg.y2);
            const isHl = seg.highlight;
            const strokeCol = seg.color === 'emerald' ? '#10b981' :
                              seg.color === 'amber' ? '#f59e0b' :
                              seg.color === 'rose' ? '#f43f5e' :
                              isHl ? '#f43f5e' : '#94a3b8';
            return (
              <g key={seg.id || `seg-${idx}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeCol}
                  strokeWidth={isHl ? 3 : 2}
                  strokeDasharray={seg.dashed ? '6 4' : undefined}
                />
                {seg.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#f1f5f9"
                    fontSize="10"
                    textAnchor="middle"
                    className="bg-midnight-950 px-1 font-bold"
                  >
                    {seg.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vectors (Mũi tên có hướng) */}
          {vectors.map((vec, idx) => {
            const x1 = mapX(vec.x1);
            const y1 = mapY(vec.y1);
            const x2 = mapX(vec.x2);
            const y2 = mapY(vec.y2);
            const isHl = vec.highlight;
            return (
              <g key={vec.id || `vec-${idx}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isHl ? '#f43f5e' : '#38bdf8'}
                  strokeWidth={isHl ? 3 : 2}
                  markerEnd={isHl ? 'url(#geo-arrow)' : 'url(#geo-arrow-vector)'}
                />
                {vec.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#38bdf8"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {vec.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Các điểm (Points) */}
          {points.map((pt, idx) => {
            const cx = mapX(pt.x);
            const cy = mapY(pt.y);
            const isHl = pt.highlight;
            const ptColor = pt.color === 'emerald' ? '#10b981' :
                            pt.color === 'amber' ? '#f59e0b' :
                            pt.color === 'sky' ? '#38bdf8' :
                            isHl ? '#f43f5e' : '#e2e8f0';

            return (
              <g key={pt.id || `pt-${idx}`} className="cursor-pointer">
                {isHl && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHl ? 6 : 4.5}
                  fill={ptColor}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                <text
                  x={cx + 8}
                  y={cy - 6}
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="bold"
                  className="select-none"
                >
                  {pt.label || `P${idx + 1}`}
                  <tspan fill="#94a3b8" fontSize="9" fontWeight="normal"> ({pt.x}, {pt.y})</tspan>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-3 pt-2 border-t border-midnight-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Điểm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400" />
            <span>Đoạn thẳng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400" />
            <span>Vector</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 font-bold">Đang xét / Highlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
