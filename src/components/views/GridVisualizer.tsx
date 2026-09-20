import React from 'react';
import { Frame } from '../../types';

interface GridVisualizerProps {
  frame: Frame;
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ frame }) => {
  const grid = frame.grid || [];
  const selectedBox = frame.selectedBox;
  const cellHighlights = frame.cellHighlights || [];

  if (grid.length === 0) return null;

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

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

  return (
    <div className="flex flex-col items-center justify-center gap-3 overflow-x-auto p-4 w-full">
      {/* Grid container */}
      <div className="inline-block relative p-3 rounded-2xl bg-midnight-950/90 border border-midnight-800 shadow-2xl">
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const highlight = getCellHighlight(r, c);
              const inBox = isInSelectedBox(r, c);

              let cellStyle = "bg-midnight-900/90 text-slate-300 border-midnight-700/70";
              let glow = "";

              if (highlight) {
                if (highlight.status === 'found') {
                  cellStyle = "bg-emerald-500/25 text-emerald-300 border-emerald-400 font-black scale-105 z-10";
                  glow = "shadow-[0_0_15px_rgba(52,211,153,0.6)]";
                } else {
                  cellStyle = "bg-sakura-500/30 text-sakura-300 border-sakura-400 font-black scale-105 z-10";
                  glow = "shadow-sakura-glow";
                }
              } else if (inBox) {
                cellStyle = "bg-sakura-500/15 text-white border-sakura-500/60 font-bold";
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex flex-col items-center justify-center font-mono text-base sm:text-lg select-none border transition-all duration-300 relative ${cellStyle} ${glow}`}
                >
                  <span>{val}</span>
                  <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-500 font-mono">
                    {r},{c}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Box Info */}
        {selectedBox && (
          <div className="mt-3.5 pt-2 border-t border-midnight-800/80 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-sakura-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sakura-400 animate-pulse" />
            <span className="font-bold">
              Vùng chữ nhật: [{selectedBox.r1},{selectedBox.c1}] $\rightarrow$ [{selectedBox.r2},{selectedBox.c2}]
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
