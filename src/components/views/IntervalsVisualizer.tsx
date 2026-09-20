import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Target, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Frame, IntervalItem } from '../../types';

interface IntervalsVisualizerProps {
  frame: Frame;
}

export const IntervalsVisualizer: React.FC<IntervalsVisualizerProps> = ({ frame }) => {
  // 1. Thu thập danh sách đoạn thẳng (Intervals) kèm fallback thông minh
  const rawIntervals: IntervalItem[] = useMemo(() => {
    if (frame.intervals && frame.intervals.length > 0) {
      return frame.intervals;
    }

    // Fallback 1: Trích xuất từ geometryData.segments nếu có
    if (frame.geometryData?.segments && frame.geometryData.segments.length > 0) {
      return frame.geometryData.segments.map((seg, idx) => {
        const x1 = seg.x1 ?? (typeof seg.from === 'object' ? seg.from.x : 0);
        const x2 = seg.x2 ?? (typeof seg.to === 'object' ? seg.to.x : 0);
        return {
          id: `seg-${idx}`,
          label: seg.label || `Đoạn ${idx + 1}`,
          start: Math.min(x1, x2),
          end: Math.max(x1, x2),
          highlight: seg.highlight,
          color: seg.color
        };
      });
    }

    // Fallback 2: Trích xuất từ description nếu có mô tả đoạn dạng [L, R]
    const desc = frame.description || '';
    const regex = /\[(\d+),\s*(\d+)\]/g;
    const matches: { start: number; end: number; label: string }[] = [];
    let match;
    while ((match = regex.exec(desc)) !== null) {
      matches.push({
        start: Number(match[1]),
        end: Number(match[2]),
        label: `Đoạn [${match[1]}, ${match[2]}]`
      });
    }

    if (matches.length > 0) {
      return matches.map((m, idx) => ({
        id: `extracted-${idx}`,
        label: m.label,
        start: m.start,
        end: m.end,
        highlight: true,
        isTarget: idx === 0 && desc.toLowerCase().includes('yêu cầu')
      }));
    }

    // Fallback 3: Đoạn mặc định để không bao giờ bị màn hình đen
    return [
      { id: 'def-1', label: 'Đoạn [1, 2]', start: 1, end: 2, highlight: true },
      { id: 'def-2', label: 'Đoạn [3, 4]', start: 3, end: 4, highlight: true },
      { id: 'def-3', label: 'Mục tiêu [1, 5]', start: 1, end: 5, highlight: false, isTarget: true }
    ];
  }, [frame.intervals, frame.geometryData, frame.description]);

  // 2. Tự động nhận diện đoạn Mục tiêu (Target Range) cần phủ
  const { targetInterval, regularIntervals } = useMemo(() => {
    let target: IntervalItem | null = null;
    const regulars: IntervalItem[] = [];

    // Tìm đoạn có cờ isTarget hoặc có nhãn chứa 'yêu cầu', 'target', 'mục tiêu'
    for (const inv of rawIntervals) {
      const lbl = (inv.label || '').toLowerCase();
      if (inv.isTarget || lbl.includes('mục tiêu') || lbl.includes('target') || lbl.includes('yêu cầu')) {
        if (!target) {
          target = inv;
          continue;
        }
      }
      regulars.push(inv);
    }

    // Nếu chưa có target nhưng trong description có "yêu cầu phủ chính xác đoạn [s, e]"
    if (!target) {
      const desc = frame.description || '';
      const targetMatch = desc.match(/đoạn\s*\[(\d+),\s*(\d+)\]/i);
      if (targetMatch) {
        target = {
          id: 'query-target',
          label: `Mục tiêu [${targetMatch[1]}, ${targetMatch[2]}]`,
          start: Number(targetMatch[1]),
          end: Number(targetMatch[2]),
          isTarget: true
        };
      }
    }

    return { targetInterval: target, regularIntervals: regulars.length > 0 ? regulars : rawIntervals };
  }, [rawIntervals, frame.description]);

  // 3. Phân tầng (Lanes) cho các đoạn thẳng để không bị đè lên nhau
  const lanes = useMemo(() => {
    const sorted = [...regularIntervals].sort((a, b) => a.start - b.start || a.end - b.end);
    const assignedLanes: { interval: IntervalItem; lane: number }[] = [];
    const laneEndPoints: number[] = [];

    sorted.forEach((inv) => {
      let placed = false;
      for (let i = 0; i < laneEndPoints.length; i++) {
        if (laneEndPoints[i] < inv.start) {
          assignedLanes.push({ interval: inv, lane: i });
          laneEndPoints[i] = inv.end;
          placed = true;
          break;
        }
      }
      if (!placed) {
        assignedLanes.push({ interval: inv, lane: laneEndPoints.length });
        laneEndPoints.push(inv.end);
      }
    });

    return { assignedLanes, totalLanes: Math.max(1, laneEndPoints.length) };
  }, [regularIntervals]);

  // 4. Tính toán phạm vi trục Ox (minVal, maxVal)
  const { minVal, maxVal, ticks } = useMemo(() => {
    let allPoints: number[] = [];
    rawIntervals.forEach(i => {
      allPoints.push(i.start, i.end);
    });
    if (targetInterval) {
      allPoints.push(targetInterval.start, targetInterval.end);
    }
    if (allPoints.length === 0) allPoints = [0, 6];

    let min = Math.min(...allPoints);
    let max = Math.max(...allPoints);

    // Mở rộng thêm 0 nếu gần 0 để thấy gốc tọa độ
    if (min > 0 && min <= 2) min = 0;
    
    // Đệm thêm 1 đơn vị ở hai đầu
    const pad = Math.max(1, Math.round((max - min) * 0.12));
    min -= pad;
    max += pad;

    // Sinh các vạch số nguyên đều đặn (Ticks)
    const tickList: number[] = [];
    const startTick = Math.floor(min);
    const endTick = Math.ceil(max);
    const step = endTick - startTick > 20 ? Math.ceil((endTick - startTick) / 15) : 1;

    for (let t = startTick; t <= endTick; t += step) {
      tickList.push(t);
    }

    return { minVal: min, maxVal: max, ticks: tickList };
  }, [rawIntervals, targetInterval]);

  // 5. Kích thước SVG
  const svgWidth = 760;
  const laneHeight = 44;
  const topPadding = 50;
  const targetAreaHeight = targetInterval ? 50 : 20;
  const totalLanesHeight = lanes.totalLanes * laneHeight;
  const svgHeight = Math.max(340, topPadding + totalLanesHeight + targetAreaHeight + 80);

  const leftMargin = 60;
  const rightMargin = 50;
  const plotWidth = svgWidth - leftMargin - rightMargin;
  const yAxis = svgHeight - 55; // Vị trí trục hoành Ox

  // Chuyển đổi giá trị tọa độ x sang pixel SVG
  const mapX = (val: number) => {
    const range = maxVal - minVal || 1;
    return leftMargin + ((val - minVal) / range) * plotWidth;
  };

  // 6. Tính toán các khoảng đã được phủ (Merged Coverage) trên trục Ox
  const mergedCoverage = useMemo(() => {
    // Chỉ lấy các đoạn đang được highlight hoặc được chọn
    const active = regularIntervals.filter(i => i.highlight !== false);
    if (active.length === 0) return [];

    const sorted = [...active].map(i => ({ start: i.start, end: i.end })).sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [];
    let cur = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start <= cur.end) {
        cur.end = Math.max(cur.end, sorted[i].end);
      } else {
        merged.push(cur);
        cur = { ...sorted[i] };
      }
    }
    merged.push(cur);
    return merged;
  }, [regularIntervals]);

  // Bảng màu cho các đoạn thẳng
  const intervalColors = [
    { fill: 'fill-sakura-500/25', stroke: 'stroke-sakura-400', text: 'text-sakura-200', glow: '#ff7597' },
    { fill: 'fill-sky-500/25', stroke: 'stroke-sky-400', text: 'text-sky-200', glow: '#38bdf8' },
    { fill: 'fill-emerald-500/25', stroke: 'stroke-emerald-400', text: 'text-emerald-200', glow: '#34d399' },
    { fill: 'fill-amber-500/25', stroke: 'stroke-amber-400', text: 'text-amber-200', glow: '#fbbf24' },
    { fill: 'fill-purple-500/25', stroke: 'stroke-purple-400', text: 'text-purple-200', glow: '#a855f7' }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 select-none">
      <div className="w-full max-w-4xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <GitCommit className="w-4 h-4 text-sakura-400" />
            <span>Hệ trục tọa độ 1D (Trục Ox) & Mô hình Phủ đoạn (Intervals)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Số đoạn: <b className="text-white">{regularIntervals.length}</b></span>
            {targetInterval && (
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>Mục tiêu: [{targetInterval.start}, {targetInterval.end}]</span>
              </span>
            )}
          </div>
        </div>

        {/* Khung Hệ Trục Tọa Độ Ox SVG */}
        <div className="relative w-full bg-midnight-900/60 border border-midnight-800 rounded-xl overflow-hidden p-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[520px] font-mono"
          >
            <defs>
              {/* Mũi tên trục Ox */}
              <marker
                id="ox-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>

              {/* Pattern sọc chéo cho phần mục tiêu còn thiếu */}
              <pattern
                id="missing-pattern"
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.6" />
              </pattern>
            </defs>

            {/* 1. Lưới dọc (Vertical Grid Lines) gióng từ trục Ox lên trên */}
            {ticks.map((t) => {
              const xPos = mapX(t);
              const isOrigin = t === 0;

              return (
                <g key={`grid-${t}`}>
                  <line
                    x1={xPos}
                    y1={topPadding - 10}
                    x2={xPos}
                    y2={yAxis}
                    stroke={isOrigin ? '#64748b' : '#334155'}
                    strokeWidth={isOrigin ? 1.5 : 1}
                    strokeDasharray={isOrigin ? undefined : '3 3'}
                    strokeOpacity={isOrigin ? 0.6 : 0.35}
                  />
                </g>
              );
            })}

            {/* 2. Các đoạn thẳng (Intervals) xếp tầng phía trên trục Ox */}
            {lanes.assignedLanes.map(({ interval: inv, lane }, idx) => {
              const x1 = mapX(inv.start);
              const x2 = mapX(inv.end);
              const width = Math.max(8, x2 - x1);
              // Tọa độ y của tầng (lane)
              const yPos = yAxis - 45 - lane * laneHeight;
              const isHl = inv.highlight !== false;
              const color = intervalColors[idx % intervalColors.length];

              return (
                <g key={inv.id || `inv-${idx}`}>
                  {/* Đường nét đứt gióng vuông góc xuống trục Ox (Drop-lines) */}
                  <line
                    x1={x1}
                    y1={yPos}
                    x2={x1}
                    y2={yAxis}
                    stroke={isHl ? color.glow : '#64748b'}
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    strokeOpacity={isHl ? 0.7 : 0.3}
                  />
                  <line
                    x1={x2}
                    y1={yPos}
                    x2={x2}
                    y2={yAxis}
                    stroke={isHl ? color.glow : '#64748b'}
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    strokeOpacity={isHl ? 0.7 : 0.3}
                  />

                  {/* Điểm chạm trên trục Ox */}
                  <circle cx={x1} cy={yAxis} r={3} fill={isHl ? color.glow : '#94a3b8'} />
                  <circle cx={x2} cy={yAxis} r={3} fill={isHl ? color.glow : '#94a3b8'} />

                  {/* Thân đoạn thẳng */}
                  <rect
                    x={x1}
                    y={yPos - 12}
                    width={width}
                    height={24}
                    rx={6}
                    className={`transition-all duration-300 ${color.fill} ${color.stroke}`}
                    strokeWidth={isHl ? 2 : 1.2}
                    style={{
                      filter: isHl ? `drop-shadow(0 0 6px ${color.glow}66)` : undefined
                    }}
                  />

                  {/* Hai điểm mút tròn ở 2 đầu đoạn thẳng */}
                  <circle
                    cx={x1}
                    cy={yPos}
                    r={5}
                    className={color.stroke}
                    strokeWidth={2}
                    fill="#0f172a"
                  />
                  <circle
                    cx={x2}
                    cy={yPos}
                    r={5}
                    className={color.stroke}
                    strokeWidth={2}
                    fill="#0f172a"
                  />

                  {/* Nhãn đoạn thẳng */}
                  <text
                    x={(x1 + x2) / 2}
                    y={yPos + 4}
                    textAnchor="middle"
                    className="font-bold text-[11px] fill-slate-100 drop-shadow"
                  >
                    {inv.label || `[${inv.start}, ${inv.end}]`}
                  </text>
                </g>
              );
            })}

            {/* 3. Đoạn Mục tiêu cần phủ (Target Query Interval) nếu có */}
            {targetInterval && (() => {
              const tx1 = mapX(targetInterval.start);
              const tx2 = mapX(targetInterval.end);
              const tWidth = Math.max(8, tx2 - tx1);
              const targetY = yAxis - 18;

              return (
                <g key="target-zone">
                  {/* Khung bao mục tiêu ngay sát trên trục Ox */}
                  <rect
                    x={tx1}
                    y={targetY - 10}
                    width={tWidth}
                    height={20}
                    rx={4}
                    fill="#06b6d41a"
                    stroke="#06b6d4"
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={(tx1 + tx2) / 2}
                    y={targetY + 4}
                    textAnchor="middle"
                    className="font-black text-[10px] fill-cyan-300"
                  >
                    🎯 CẦN PHỦ: [{targetInterval.start}, {targetInterval.end}]
                  </text>
                </g>
              );
            })()}

            {/* 4. Dải hợp nhất đã phủ trực tiếp trên trục Ox (Merged Coverage) */}
            {mergedCoverage.map((cov, idx) => {
              const cx1 = mapX(cov.start);
              const cx2 = mapX(cov.end);
              const cWidth = Math.max(4, cx2 - cx1);

              return (
                <rect
                  key={`cov-${idx}`}
                  x={cx1}
                  y={yAxis - 4}
                  width={cWidth}
                  height={8}
                  rx={3}
                  fill="#38bdf8"
                  fillOpacity={0.85}
                  style={{ filter: 'drop-shadow(0 0 6px #38bdf8aa)' }}
                />
              );
            })}

            {/* 5. TRỤC HOÀNH OX (HORIZONTAL OX AXIS) */}
            <g key="ox-axis">
              {/* Thân trục Ox */}
              <line
                x1={leftMargin - 20}
                y1={yAxis}
                x2={svgWidth - rightMargin + 25}
                y2={yAxis}
                stroke="#94a3b8"
                strokeWidth={2.5}
                markerEnd="url(#ox-arrow)"
              />

              {/* Nhãn Ox */}
              <text
                x={svgWidth - rightMargin + 32}
                y={yAxis + 4}
                className="font-black text-xs fill-slate-300"
              >
                Ox
              </text>

              {/* Các vạch chia (Ticks) và nhãn số nguyên trên trục Ox */}
              {ticks.map((t) => {
                const xPos = mapX(t);
                const isOrigin = t === 0;

                return (
                  <g key={`tick-${t}`}>
                    {/* Vạch chia vuông góc */}
                    <line
                      x1={xPos}
                      y1={yAxis}
                      x2={xPos}
                      y2={yAxis + (isOrigin ? 9 : 6)}
                      stroke={isOrigin ? '#f43f5e' : '#94a3b8'}
                      strokeWidth={isOrigin ? 2.5 : 1.5}
                    />

                    {/* Số nguyên bên dưới */}
                    <text
                      x={xPos}
                      y={yAxis + 20}
                      textAnchor="middle"
                      className={`text-[11px] font-mono ${
                        isOrigin
                          ? 'font-black fill-rose-400 text-xs'
                          : 'font-semibold fill-slate-300'
                      }`}
                    >
                      {t}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Chú thích & Tóm tắt độ phủ */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-midnight-800/80">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-sky-400 shadow-sm" />
              <span>Dải đã phủ trên Ox</span>
            </span>

            {targetInterval && (
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span className="w-3 h-3 rounded border-2 border-dashed border-cyan-400 bg-cyan-500/20" />
                <span>Khoảng mục tiêu [{targetInterval.start}, {targetInterval.end}]</span>
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            Tọa độ trục Ox: [{minVal.toFixed(0)}, {maxVal.toFixed(0)}]
          </span>
        </div>
      </div>
    </div>
  );
};
