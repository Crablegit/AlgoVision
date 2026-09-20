import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Frame, VisualizationSpec, GeometryData, GeoBox } from '../../types';

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
    boxes: frame.boxes || [],
    coordinateSystem: frame.coordinateSystem || 'cartesian'
  };

  const points = geoData.points || [];
  const segments = geoData.segments || [];
  const polygons = geoData.polygons || [];
  const circles = geoData.circles || [];
  const vectors = geoData.vectors || [];
  const boxes: GeoBox[] = geoData.boxes || frame.boxes || [];

  const isCakeOrBox = spec?.subType === 'box' ||
                      spec?.subType === 'cake' ||
                      spec?.subType === 'cake-cutting' ||
                      (frame.description || '').toLowerCase().includes('bánh') ||
                      (frame.description || '').toLowerCase().includes('cake') ||
                      boxes.length > 0;

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
      includePoint(s.x1 ?? (typeof s.from === 'object' ? s.from.x : 0), s.y1 ?? (typeof s.from === 'object' ? s.from.y : 0));
      includePoint(s.x2 ?? (typeof s.to === 'object' ? s.to.x : 0), s.y2 ?? (typeof s.to === 'object' ? s.to.y : 0));
    });
    polygons.forEach(poly => {
      (poly.points || []).forEach(p => includePoint(p.x, p.y));
    });
    circles.forEach(c => {
      const cx = typeof c.center === 'object' ? c.center.x : c.cx ?? 0;
      const cy = typeof c.center === 'object' ? c.center.y : c.cy ?? 0;
      const r = c.radius ?? c.r ?? 0;
      includePoint(cx - r, cy - r);
      includePoint(cx + r, cy + r);
    });
    vectors.forEach(v => {
      const x1 = v.from?.x ?? v.x1 ?? 0;
      const y1 = v.from?.y ?? v.y1 ?? 0;
      const x2 = v.to?.x ?? v.x2 ?? 0;
      const y2 = v.to?.y ?? v.y2 ?? 0;
      includePoint(x1, y1);
      includePoint(x2, y2);
    });
    boxes.forEach(b => {
      includePoint(b.x1, b.y1);
      includePoint(b.x2, b.y2);
    });

    if (minX === Infinity) {
      minX = 0; maxX = 10; minY = 0; maxY = 10;
    } else {
      // Đảm bảo có kích thước tối thiểu để không bị chia cho 0
      if (minX === maxX) { minX -= 2; maxX += 2; }
      if (minY === maxY) { minY -= 2; maxY += 2; }
      const padX = Math.max((maxX - minX) * 0.12, 1);
      const padY = Math.max((maxY - minY) * 0.12, 1);
      minX -= padX;
      maxX += padX;
      minY -= padY;
      maxY += padY;
    }

    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [points, segments, polygons, circles, vectors, boxes]);

  // Kích thước canvas SVG chuẩn
  const svgWidth = 760;
  const svgHeight = 480;

  // Ánh xạ tọa độ Descartes sang tọa độ SVG (Y đảo ngược)
  const mapX = (x: number) => {
    return ((x - bounds.minX) / bounds.width) * (svgWidth - 90) + 45;
  };

  const mapY = (y: number) => {
    if (geoData.coordinateSystem === 'screen') {
      return ((y - bounds.minY) / bounds.height) * (svgHeight - 90) + 45;
    }
    // Mặc định Cartesian: y dương hướng lên trên
    return svgHeight - (((y - bounds.minY) / bounds.height) * (svgHeight - 90) + 45);
  };

  const mapRadius = (r: number) => {
    const scale = (svgWidth - 90) / bounds.width;
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
          <span className="text-sakura-400 font-bold flex items-center gap-1.5">
            {isCakeOrBox ? '🎂 Mô hình hóa Hình học & Vùng chữ nhật (Cake & Box Partitions)' : '📐 Hình học phẳng (Hệ tọa độ Descartes)'}
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

            {/* Pattern sọc chéo cho phần bánh đã lấy đi / vùng đã cắt */}
            <pattern
              id="geo-taken-pattern"
              width="10"
              height="10"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="2.5" strokeOpacity="0.4" />
            </pattern>
            <pattern
              id="geo-cut-pattern"
              width="10"
              height="10"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Grid lines mờ */}
          <line
            x1="45"
            y1={axisY0 ?? svgHeight - 45}
            x2={svgWidth - 45}
            y2={axisY0 ?? svgHeight - 45}
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <line
            x1={axisX0 ?? 45}
            y1="45"
            x2={axisX0 ?? 45}
            y2={svgHeight - 45}
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

          {/* ================= HÌNH HỘP / BOXES / MIẾNG BÁNH ================= */}
          {boxes.map((box, idx) => {
            const bx1 = mapX(Math.min(box.x1, box.x2));
            const bx2 = mapX(Math.max(box.x1, box.x2));
            const by1 = mapY(Math.max(box.y1, box.y2)); // y cao hơn có SVG y nhỏ hơn
            const by2 = mapY(Math.min(box.y1, box.y2));

            const rectW = Math.max(bx2 - bx1, 2);
            const rectH = Math.max(by2 - by1, 2);
            const isHl = box.highlight;
            const isTaken = box.isTaken;

            let fill = box.fillColor || (isTaken ? 'rgba(30, 41, 59, 0.7)' : isHl ? 'rgba(244, 63, 94, 0.35)' : 'rgba(56, 189, 248, 0.12)');
            let stroke = box.strokeColor || (isTaken ? '#475569' : isHl ? '#f43f5e' : '#38bdf8');
            let strokeWidth = isHl ? 3 : 2;

            return (
              <g key={box.id || `box-${idx}`}>
                {/* Rect chính */}
                <rect
                  x={bx1}
                  y={by1}
                  width={rectW}
                  height={rectH}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={box.dashed ? '6 4' : undefined}
                  rx="6"
                  className="transition-all duration-300"
                />

                {/* Lớp hoa văn pattern nếu đã bị lấy đi */}
                {isTaken && (
                  <rect
                    x={bx1}
                    y={by1}
                    width={rectW}
                    height={rectH}
                    fill="url(#geo-taken-pattern)"
                    rx="6"
                  />
                )}

                {/* Lớp hoa văn highlight cho miếng vừa cắt */}
                {isHl && (
                  <rect
                    x={bx1}
                    y={by1}
                    width={rectW}
                    height={rectH}
                    fill="url(#geo-cut-pattern)"
                    rx="6"
                  />
                )}

                {/* Badge thông tin diện tích / nhãn ở giữa hộp */}
                {(box.label || box.area !== undefined) && rectW > 30 && rectH > 24 && (
                  <g transform={`translate(${bx1 + rectW / 2}, ${by1 + rectH / 2})`}>
                    <rect
                      x="-70"
                      y="-16"
                      width="140"
                      height="32"
                      rx="6"
                      fill="#090e1d"
                      fillOpacity="0.85"
                      stroke={stroke}
                      strokeWidth="1.5"
                    />
                    <text
                      y="-2"
                      fill={isHl ? '#fda4af' : '#f1f5f9'}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {box.label || 'Vùng hộp'}
                    </text>
                    {box.area !== undefined && (
                      <text
                        y="10"
                        fill={isHl ? '#f43f5e' : '#38bdf8'}
                        fontSize="10"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {typeof box.area === 'number' ? `Diện tích: ${box.area}` : box.area}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* Đa giác (Polygons) */}
          {polygons.map((poly, idx) => {
            const pointsList = poly.points || [];
            const pointsStr = pointsList.map((p: any) => `${mapX(p.x)},${mapY(p.y)}`).join(' ');
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
            const cx = mapX(typeof c.center === 'object' ? c.center.x : c.cx ?? 0);
            const cy = mapY(typeof c.center === 'object' ? c.center.y : c.cy ?? 0);
            const r = mapRadius(c.radius ?? c.r ?? 0);
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

          {/* Đoạn thẳng & Vết cắt (Segments) */}
          {segments.map((seg, idx) => {
            const x1 = mapX(seg.x1 ?? (typeof seg.from === 'object' ? seg.from.x : 0));
            const y1 = mapY(seg.y1 ?? (typeof seg.from === 'object' ? seg.from.y : 0));
            const x2 = mapX(seg.x2 ?? (typeof seg.to === 'object' ? seg.to.x : 0));
            const y2 = mapY(seg.y2 ?? (typeof seg.to === 'object' ? seg.to.y : 0));
            const isHl = seg.highlight;
            const strokeCol = seg.color === 'emerald' ? '#10b981' :
                              seg.color === 'amber' ? '#f59e0b' :
                              seg.color === 'rose' || isHl ? '#f43f5e' :
                              seg.color || '#94a3b8';
            return (
              <g key={seg.id || `seg-${idx}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeCol}
                  strokeWidth={isHl ? 3 : 2}
                  strokeDasharray={seg.dashed || isCakeOrBox ? '6 4' : undefined}
                />
                {seg.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#f1f5f9"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-bold bg-midnight-950 px-1"
                  >
                    {seg.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Vectors */}
          {vectors.map((vec, idx) => {
            const x1 = mapX(vec.from?.x ?? vec.x1 ?? 0);
            const y1 = mapY(vec.from?.y ?? vec.y1 ?? 0);
            const x2 = mapX(vec.to?.x ?? vec.x2 ?? 0);
            const y2 = mapY(vec.to?.y ?? vec.y2 ?? 0);
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

          {/* Các điểm (Points / Cut points) */}
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
                    r="14"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHl ? 7 : 5}
                  fill={ptColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text
                  x={cx + 10}
                  y={cy - 6}
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="bold"
                  className="select-none"
                >
                  {pt.label || `(${pt.x}, ${pt.y})`}
                  {pt.label && !pt.label.includes(String(pt.x)) && (
                    <tspan fill="#94a3b8" fontSize="9" fontWeight="normal"> ({pt.x}, {pt.y})</tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Chú thích (Legend) */}
        <div className="mt-3 pt-2 border-t border-midnight-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
          {isCakeOrBox ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3 rounded bg-sky-500/20 border border-sky-400" />
                <span>Bánh còn lại</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3 rounded bg-rose-500/40 border border-rose-500" />
                <span className="text-rose-300 font-bold">Miếng bánh vừa cắt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-400" />
                <span>Vết cắt (H & V)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3 rounded bg-slate-800 border border-slate-600 opacity-60" />
                <span className="text-slate-500">Đã cắt ở bước trước</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Điểm cắt (x, y)</span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
