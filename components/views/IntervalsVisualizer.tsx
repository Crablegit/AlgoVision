import React from 'react';
import { Frame, IntervalItem } from '../../types';

interface IntervalsVisualizerProps {
  frame: Frame;
}

export const IntervalsVisualizer: React.FC<IntervalsVisualizerProps> = ({ frame }) => {
  const intervals: IntervalItem[] = frame.intervals || [];
  
  if (intervals.length === 0) return null;

  // Tính phạm vi trục số
  let minVal = frame.axisRange?.min ?? Math.min(...intervals.map(i => Math.min(i.start, i.end)));
  let maxVal = frame.axisRange?.max ?? Math.max(...intervals.map(i => Math.max(i.start, i.end)));

  // Đệm thêm 1 khoảng nhỏ hai đầu trục
  const padding = Math.max(1, Math.round((maxVal - minVal) * 0.1));
  minVal -= padding;
  maxVal += padding;
  const totalRange = maxVal - minVal || 1;

  // Tọa độ phần trăm trên trục
  const getPercent = (val: number) => {
    return Math.max(0, Math.min(100, ((val - minVal) / totalRange) * 100));
  };

  // Tạo các mốc số trên trục (ticks)
  const ticksCount = 6;
  const ticks = Array.from({ length: ticksCount }, (_, idx) => {
    return Math.round(minVal + (totalRange / (ticksCount - 1)) * idx);
  });

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 overflow-x-auto">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Stacked intervals list */}
        <div className="flex flex-col gap-3 py-2">
          {intervals.map((inv, idx) => {
            const leftPct = getPercent(Math.min(inv.start, inv.end));
            const rightPct = getPercent(Math.max(inv.start, inv.end));
            const widthPct = Math.max(2, rightPct - leftPct);
            const isHighlight = inv.highlight;

            return (
              <div key={inv.id || idx} className="relative h-9 flex items-center">
                {/* Thanh đoạn thẳng */}
                <div
                  className={`absolute h-7 rounded-xl flex items-center justify-between px-2.5 transition-all duration-300 font-mono text-xs border ${
                    isHighlight
                      ? 'bg-sakura-500 text-midnight-950 border-sakura-300 font-bold shadow-sakura-glow'
                      : 'bg-midnight-800/90 text-slate-300 border-midnight-600 hover:border-sakura-500/40'
                  }`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    minWidth: '60px'
                  }}
                >
                  <span className="text-[10px] opacity-80">[{inv.start}</span>
                  <span className="truncate px-1 font-semibold">{inv.label || `Đoạn ${idx + 1}`}</span>
                  <span className="text-[10px] opacity-80">{inv.end}]</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trục số (Number Line) */}
        <div className="relative pt-4 border-t-2 border-slate-600">
          {/* Mũi tên trục số */}
          <div className="absolute right-0 top-3 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-slate-400" />

          {/* Các mốc số trên trục */}
          <div className="relative w-full h-6">
            {ticks.map((tickVal, i) => {
              const posPct = getPercent(tickVal);
              return (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${posPct}%` }}
                >
                  <div className="w-0.5 h-2 bg-slate-500 -mt-4 mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {tickVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
