import React from 'react';
import { Frame } from '../../types';

interface GridVisualizerProps {
  frame: Frame;
  spec?: any;
}

function safeGridVal(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    let v = val.val ?? val.value ?? val.char ?? val.text ?? val.label ?? val.content;
    if (v !== undefined) return String(v);
    const keys = Object.keys(val);
    const ignore = new Set(['id', 'index', 'idx', 'key', 'color', 'highlight', 'status', 'r', 'c']);
    const candidate = keys.find(k => !ignore.has(k.toLowerCase()));
    if (candidate && val[candidate] !== undefined) return String(val[candidate]);
    const values = Object.values(val);
    return values.length > 0 ? String(values[0]) : '';
  }
  return String(val);
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ frame, spec }) => {
  const grid = frame.grid || frame.gridData?.cells || [];
  const selectedBox = frame.selectedBox;
  const cellHighlights = frame.cellHighlights || [];
  const indexBase = spec?.indexBase ?? 1;

  if (grid.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <span className="text-xs font-mono">Đang nạp dữ liệu lưới ma trận...</span>
      </div>
    );
  }

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Tính kích thước ô linh hoạt theo số cột và số hàng
  const maxDim = Math.max(rows, cols);
  let cellSize = "w-11 h-11 sm:w-12 sm:h-12 text-sm sm:text-base";
  let coordTextClass = "text-[7px]";
  let headerSize = "w-11 sm:w-12 h-6";

  if (maxDim > 18) {
    cellSize = "w-5 h-5 text-[8px]";
    coordTextClass = "hidden";
    headerSize = "w-5 h-4 text-[8px]";
  } else if (maxDim > 12) {
    cellSize = "w-7 h-7 text-[11px]";
    coordTextClass = "hidden sm:inline-block text-[6px]";
    headerSize = "w-7 h-5 text-[9px]";
  } else if (maxDim > 7) {
    cellSize = "w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm";
    coordTextClass = "text-[7px]";
    headerSize = "w-9 sm:w-10 h-5 text-[10px]";
  }

  const getCellHighlight = (r: number, c: number) => {
    return cellHighlights.find((h) => h.r === r && h.c === c);
  };

  const isInSelectedBox = (r: number, c: number) => {
    if (!selectedBox) return false;
    const minR = Math.min(selectedBox.r1, selectedBox.r2);
    const maxR = Math.max(selectedBox.r1, selectedBox.r2);
    const minC = Math.min(selectedBox.c1, selectedBox.c2);
    const maxC = Math.max(selectedBox.c1, selectedBox.c2);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  // Mảng tiêu đề cột và hàng theo indexBase
  const colHeaders = Array.from({ length: cols }, (_, i) => i + indexBase);
  const rowHeaders = Array.from({ length: rows }, (_, i) => i + indexBase);

  // Nhận diện các trạng thái ô có trong grid để sinh legend tự động
  let hasRobot = false;
  let hasBlocked = false;
  let hasPath = false;
  let hasStart = false;
  let hasGoal = false;
  let hasActive = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r]?.[c];
      const strVal = safeGridVal(val);
      const hl = getCellHighlight(r, c);
      if (strVal.includes('🤖') || strVal === 'R' || strVal === 'r' || hl?.status === 'robot' || hl?.status === 'current') hasRobot = true;
      if (strVal === 'X' || strVal === 'x' || strVal === '#' || strVal === 'B' || strVal === '✕' || hl?.status === 'blocked' || hl?.status === 'obstacle') hasBlocked = true;
      if (strVal === '✓' || strVal === '✔' || hl?.status === 'found' || hl?.status === 'path') hasPath = true;
      if (strVal === 'S' || hl?.status === 'start' || (frame.gridData?.start && frame.gridData.start.r === r && frame.gridData.start.c === c)) hasStart = true;
      if (strVal === '🎯' || strVal === 'G' || hl?.status === 'goal' || (frame.gridData?.goal && frame.gridData.goal.r === r && frame.gridData.goal.c === c)) hasGoal = true;
      if (hl?.status === 'active' || hl?.status === 'lit') hasActive = true;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 overflow-auto p-2 w-full max-w-full">
      {/* Grid container */}
      <div className="inline-block relative p-3 rounded-2xl bg-midnight-950/95 border border-midnight-800 shadow-2xl overflow-auto max-w-full">
        {/* Hàng chỉ số CỘT (Top Column Headers) */}
        <div className="flex items-center mb-1 pl-7 sm:pl-8">
          {colHeaders.map((cNum) => (
            <div
              key={`col-head-${cNum}`}
              className={`${headerSize} flex items-center justify-center font-mono font-bold text-slate-500 shrink-0`}
            >
              {cNum}
            </div>
          ))}
        </div>

        {/* Thân bảng lưới (Rows & Cells) */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          {grid.map((row, r) => (
            <div key={`row-${r}`} className="flex items-center gap-1 sm:gap-1.5">
              {/* Chỉ số HÀNG (Left Row Header) */}
              <div className="w-6 sm:w-7 flex items-center justify-center font-mono font-bold text-slate-500 text-[10px] sm:text-xs shrink-0">
                {rowHeaders[r]}
              </div>

              {/* Các ô trong hàng */}
              {row.map((val, c) => {
                const highlight = getCellHighlight(r, c);
                const inBox = isInSelectedBox(r, c);

                const strVal = safeGridVal(val);
                const isRobot = strVal.includes('🤖') || strVal === 'R' || strVal === 'r' || highlight?.status === 'robot' || highlight?.status === 'current';
                const isBlocked = strVal === 'X' || strVal === 'x' || strVal === '#' || strVal === 'B' || strVal === '✕' || highlight?.status === 'blocked' || highlight?.status === 'obstacle';
                const isPath = strVal === '✓' || strVal === '✔' || highlight?.status === 'found' || highlight?.status === 'path';
                const isStart = strVal === 'S' || highlight?.status === 'start' || (frame.gridData?.start && frame.gridData.start.r === r && frame.gridData.start.c === c);
                const isGoal = strVal === '🎯' || strVal === 'G' || highlight?.status === 'goal' || (frame.gridData?.goal && frame.gridData.goal.r === r && frame.gridData.goal.c === c);

                let cellStyle = "bg-midnight-900/90 text-slate-400 border-midnight-700/70";
                let glow = "";
                let displayVal = strVal;

                if (isRobot) {
                  cellStyle = "bg-sakura-500 text-midnight-950 border-sakura-200 font-black scale-110 z-20";
                  glow = "shadow-sakura-glow animate-pulse";
                  displayVal = '🤖';
                } else if (isBlocked) {
                  cellStyle = "bg-rose-950/70 text-rose-400 border-rose-500/80 font-bold z-10";
                  glow = "shadow-[0_0_12px_rgba(244,63,94,0.35)]";
                  displayVal = '✕';
                } else if (isPath) {
                  const col = highlight?.color;
                  if (col === 'sky') {
                    cellStyle = "bg-sky-950/70 text-sky-300 border-sky-500/80 font-black z-10";
                    glow = "shadow-[0_0_12px_rgba(56,189,248,0.35)]";
                  } else if (col === 'purple') {
                    cellStyle = "bg-purple-950/70 text-purple-300 border-purple-500/80 font-black z-10";
                    glow = "shadow-[0_0_12px_rgba(168,85,247,0.35)]";
                  } else if (col === 'amber') {
                    cellStyle = "bg-amber-950/70 text-amber-300 border-amber-500/80 font-black z-10";
                    glow = "shadow-[0_0_12px_rgba(245,158,11,0.35)]";
                  } else {
                    cellStyle = "bg-emerald-950/70 text-emerald-300 border-emerald-500/80 font-black z-10";
                    glow = "shadow-[0_0_12px_rgba(16,185,129,0.35)]";
                  }
                  displayVal = '✓';
                } else if (isStart) {
                  cellStyle = "bg-sky-950/40 text-sky-400 border-sky-500/70 font-bold";
                  glow = "shadow-[0_0_8px_rgba(56,189,248,0.25)]";
                  if (displayVal === '·' || displayVal === '-' || displayVal === '') displayVal = 'S';
                } else if (isGoal) {
                  cellStyle = "bg-amber-950/40 text-amber-300 border-amber-500/70 font-bold";
                  glow = "shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                  if (displayVal === '·' || displayVal === '-' || displayVal === '') displayVal = '🎯';
                } else if (highlight) {
                  cellStyle = "bg-sakura-500/30 text-sakura-300 border-sakura-400 font-black scale-105 z-10";
                  glow = "shadow-sakura-glow";
                } else if (inBox) {
                  cellStyle = "bg-sakura-500/15 text-white border-sakura-500/60 font-bold";
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${cellSize} rounded-lg flex flex-col items-center justify-center font-mono select-none border transition-all duration-300 relative shrink-0 ${cellStyle} ${glow}`}
                  >
                    <span className="leading-none">{displayVal}</span>
                    <span className={`absolute bottom-0.5 right-0.5 text-slate-500 font-mono opacity-60 ${coordTextClass}`}>
                      {r + indexBase},{c + indexBase}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Chú thích màu sắc (Legend) - Hiển thị linh hoạt theo dữ liệu thực tế */}
        <div className="mt-3.5 pt-2.5 border-t border-midnight-800/80 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-mono">
          {spec?.legend ? (
            spec.legend.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: item.color || '#f43f5e' }}>
                  {item.icon || '•'}
                </span>
                <span className="text-slate-300">{item.label}</span>
              </div>
            ))
          ) : (
            <>
              {hasRobot && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sakura-500 border border-sakura-200 flex items-center justify-center text-[9px] text-midnight-950 font-bold">🤖</span>
                  <span className="text-slate-300">Vị trí hiện tại</span>
                </div>
              )}
              {hasPath && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center text-[9px] text-emerald-300 font-bold">✓</span>
                  <span className="text-emerald-400 font-medium">Đã xét / Đã qua</span>
                </div>
              )}
              {hasBlocked && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-rose-950 border border-rose-500 flex items-center justify-center text-[9px] text-rose-400 font-bold">✕</span>
                  <span className="text-rose-400 font-medium">Ô cấm / Vật cản</span>
                </div>
              )}
              {hasStart && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sky-950 border border-sky-500 flex items-center justify-center text-[9px] text-sky-300 font-bold">S</span>
                  <span className="text-sky-400">Xuất phát</span>
                </div>
              )}
              {hasGoal && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-950 border border-amber-500 flex items-center justify-center text-[9px] text-amber-300 font-bold">🎯</span>
                  <span className="text-amber-400">Đích đến</span>
                </div>
              )}
              {hasActive && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sakura-500/30 border border-sakura-400 flex items-center justify-center text-[9px] text-sakura-300 font-bold">★</span>
                  <span className="text-sakura-300">Đang kích hoạt</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Box Info (nếu có) */}
        {selectedBox && (
          <div className="mt-2.5 pt-2 border-t border-midnight-800/80 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-sakura-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sakura-400 animate-pulse" />
            <span className="font-bold">
              Vùng chữ nhật: [{selectedBox.r1 + indexBase},{selectedBox.c1 + indexBase}] → [{selectedBox.r2 + indexBase},{selectedBox.c2 + indexBase}]
            </span>
            <span className="text-slate-400">
              (Diện tích: <b className="text-white">{(Math.abs(selectedBox.r2 - selectedBox.r1) + 1) * (Math.abs(selectedBox.c2 - selectedBox.c1) + 1)}</b> ô)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
