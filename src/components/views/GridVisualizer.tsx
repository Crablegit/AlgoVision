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
  const selectedBox = frame.selectedBox || frame.gridData?.selectedBox;
  const cellHighlights = frame.cellHighlights || frame.gridData?.cellHighlights || [];
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

  // Chuẩn hóa selectedBox sang 0-based hợp lệ
  const normBox = React.useMemo(() => {
    if (!selectedBox) return null;
    let r1 = Number(selectedBox.r1);
    let c1 = Number(selectedBox.c1);
    let r2 = Number(selectedBox.r2);
    let c2 = Number(selectedBox.c2);
    if (isNaN(r1) || isNaN(c1) || isNaN(r2) || isNaN(c2)) return null;

    // Kiểm tra nếu coordinates là 1-based (ví dụ max index đạt tới rows/cols)
    if (r2 >= rows || c2 >= cols || (r1 >= 1 && r2 === rows) || (c1 >= 1 && c2 === cols)) {
      r1 -= 1;
      c1 -= 1;
      r2 -= 1;
      c2 -= 1;
    }

    return {
      r1: Math.max(0, Math.min(rows - 1, Math.min(r1, r2))),
      r2: Math.max(0, Math.min(rows - 1, Math.max(r1, r2))),
      c1: Math.max(0, Math.min(cols - 1, Math.min(c1, c2))),
      c2: Math.max(0, Math.min(cols - 1, Math.max(c1, c2)))
    };
  }, [selectedBox, rows, cols]);

  const getCellHighlight = (r: number, c: number) => {
    return cellHighlights.find((h) => {
      let hr = h.r;
      let hc = h.c;
      // Nếu highlight là 1-based
      if (hr === r + 1 && hc === c + 1 && (hr === rows || hc === cols || hr > rows - 1)) {
        return true;
      }
      return hr === r && hc === c;
    });
  };

  const isInSelectedBox = (r: number, c: number) => {
    if (!normBox) return false;
    return r >= normBox.r1 && r <= normBox.r2 && c >= normBox.c1 && c <= normBox.c2;
  };

  const colHeaders = Array.from({ length: cols }, (_, i) => i + indexBase);
  const rowHeaders = Array.from({ length: rows }, (_, i) => i + indexBase);

  // XÁC ĐỊNH XEM ĐỀ BÀI CÓ PHẢI LÀ MÊ CUNG / ROBOT THẬT SỰ KHÔNG
  const rawSub = String(spec?.subType || '').toLowerCase();
  const desc = (frame.description || '').toLowerCase();
  const isMazeProblem = rawSub === 'maze' || 
                        rawSub === 'robot' || 
                        rawSub === 'grid-walker' || 
                        spec?.simulationKind === 'maze' ||
                        desc.includes('mê cung') || 
                        (desc.includes('robot') && !desc.includes('không có robot'));

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

      if (isMazeProblem) {
        if (hl?.status === 'robot' || strVal.includes('🤖') || strVal === 'R' || strVal === 'r') {
          hasRobot = true;
        }
        if (hl?.status === 'blocked' || hl?.status === 'obstacle' || strVal === '#' || strVal === '✕' || strVal === 'X' || strVal === 'x' || strVal === 'B') {
          hasBlocked = true;
        }
        if (hl?.status === 'start' || strVal === 'S') {
          hasStart = true;
        }
        if (hl?.status === 'goal' || strVal === '🎯' || strVal === 'G') {
          hasGoal = true;
        }
      }
      if (hl?.status === 'found' || hl?.status === 'path' || strVal === '✓' || strVal === '✔') {
        hasPath = true;
      }
      if (hl?.status === 'active' || hl?.status === 'lit' || hl?.status === 'current') {
        hasActive = true;
      }
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

                // CHỈ xem là robot / vật cản / xuất phát / đích đến khi bài toán THỰC SỰ là mê cung
                const isRobot = isMazeProblem && (
                  highlight?.status === 'robot' || 
                  strVal.includes('🤖') || 
                  strVal === 'R' || 
                  strVal === 'r'
                );

                const isBlocked = isMazeProblem && (
                  highlight?.status === 'blocked' || 
                  highlight?.status === 'obstacle' || 
                  strVal === '#' || 
                  strVal === '✕' || 
                  strVal === 'X' || 
                  strVal === 'x' || 
                  strVal === 'B'
                );

                const isPath = highlight?.status === 'found' || highlight?.status === 'path' || strVal === '✓' || strVal === '✔';

                const isStart = isMazeProblem && (
                  highlight?.status === 'start' || 
                  (frame.gridData?.start && frame.gridData.start.r === r && frame.gridData.start.c === c) ||
                  strVal === 'S'
                );

                const isGoal = isMazeProblem && (
                  highlight?.status === 'goal' || 
                  strVal === '🎯' || 
                  (frame.gridData?.goal && frame.gridData.goal.r === r && frame.gridData.goal.c === c) ||
                  strVal === 'G'
                );

                let cellStyle = "bg-midnight-900/90 text-slate-300 border-midnight-700/70";
                let glow = "";
                let displayVal = strVal;

                // Với các bài KHÔNG PHẢI mê cung, TUYỆT ĐỐI KHÔNG thay đổi chữ cái hiển thị!
                if (isMazeProblem) {
                  if (isRobot) {
                    displayVal = '🤖';
                  } else if (isBlocked) {
                    displayVal = '✕';
                  } else if (isPath && (displayVal === '.' || displayVal === '·' || displayVal === '')) {
                    displayVal = '✓';
                  } else if (isStart && (displayVal === '.' || displayVal === '·' || displayVal === '')) {
                    displayVal = 'S';
                  } else if (isGoal && (displayVal === '.' || displayVal === '·' || displayVal === '')) {
                    displayVal = '🎯';
                  }
                }

                // Thiết lập Style màu sắc
                if (isRobot) {
                  cellStyle = "bg-sakura-500 text-midnight-950 border-sakura-200 font-black scale-110 z-20";
                  glow = "shadow-sakura-glow animate-pulse";
                } else if (isBlocked) {
                  cellStyle = "bg-rose-950/70 text-rose-400 border-rose-500/80 font-bold z-10";
                  glow = "shadow-[0_0_12px_rgba(244,63,94,0.35)]";
                } else if (isPath) {
                  cellStyle = "bg-emerald-950/70 text-emerald-300 border-emerald-500/80 font-black z-10";
                  glow = "shadow-[0_0_12px_rgba(16,185,129,0.35)]";
                } else if (isStart) {
                  cellStyle = "bg-sky-950/50 text-sky-300 border-sky-500/80 font-bold";
                  glow = "shadow-[0_0_8px_rgba(56,189,248,0.25)]";
                } else if (isGoal) {
                  cellStyle = "bg-amber-950/50 text-amber-300 border-amber-500/80 font-bold";
                  glow = "shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                } else if (highlight && inBox) {
                  // Vừa nằm trong khung chữ nhật vừa được highlight (ví dụ chữ W, A, L, D, O được tìm thấy)
                  cellStyle = "bg-amber-400 text-midnight-950 border-white font-black scale-105 z-20";
                  glow = "shadow-[0_0_14px_rgba(251,191,36,0.8)] animate-pulse";
                } else if (highlight) {
                  // Ô được highlight đơn lẻ
                  cellStyle = "bg-sakura-500 text-midnight-950 border-sakura-200 font-black scale-105 z-20";
                  glow = "shadow-sakura-glow animate-pulse";
                } else if (inBox) {
                  // Ô nằm trong khung hình chữ nhật được chọn
                  cellStyle = "bg-amber-500/20 text-amber-200 border-amber-400/60 font-bold";
                  glow = "shadow-[0_0_8px_rgba(251,191,36,0.2)]";
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

        {/* Chú thích màu sắc (Legend) - CHỈ hiển thị đúng theo ngữ cảnh bài toán */}
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
          ) : isMazeProblem ? (
            // Chỉ hiển thị robot, vật cản khi THỰC SỰ là bài toán mê cung
            <>
              {hasRobot && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sakura-500 border border-sakura-200 flex items-center justify-center text-[9px] text-midnight-950 font-bold">🤖</span>
                  <span className="text-slate-300">Vị trí robot</span>
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
              {hasPath && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center text-[9px] text-emerald-300 font-bold">✓</span>
                  <span className="text-emerald-400 font-medium">Đường đi</span>
                </div>
              )}
            </>
          ) : (
            // Bảng chữ cái / Ma trận số thông thường:
            <>
              {cellHighlights.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-sakura-500 border border-sakura-200 flex items-center justify-center text-[9px] text-midnight-950 font-bold">★</span>
                  <span className="text-sakura-300 font-medium">Ký tự / Ô được chọn</span>
                </div>
              )}
              {normBox && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/40 border border-amber-400 flex items-center justify-center text-[9px] text-amber-300 font-bold">📦</span>
                  <span className="text-amber-300 font-medium">Vùng hình chữ nhật bao phủ</span>
                </div>
              )}
              {hasPath && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center text-[9px] text-emerald-300 font-bold">✓</span>
                  <span className="text-emerald-400 font-medium">Đã duyệt qua</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Box Info (Hiển thị kích thước và diện tích hình chữ nhật) */}
        {normBox && (
          <div className="mt-2.5 pt-2 border-t border-midnight-800/80 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">
              📦 Vùng chữ nhật: [{normBox.r1 + indexBase},{normBox.c1 + indexBase}] → [{normBox.r2 + indexBase},{normBox.c2 + indexBase}]
            </span>
            <span className="text-slate-400">
              (Kích thước: <b className="text-white">{normBox.r2 - normBox.r1 + 1}×{normBox.c2 - normBox.c1 + 1}</b> = <b className="text-amber-400 font-black">{(normBox.r2 - normBox.r1 + 1) * (normBox.c2 - normBox.c1 + 1)}</b> ô)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
