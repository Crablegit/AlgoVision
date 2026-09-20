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

  const isCellHighlighted = (r: number, c: number) => {
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
    <div className="flex flex-col items-center justify-center gap-3 overflow-x-auto p-4">
      {/* Grid container */}
      <div className="inline-block relative p-2 rounded-2xl bg-midnight-950/80 border border-midnight-800">
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const highlight = isCellHighlighted(r, c);
              const inBox = isInSelectedBox(r, c);

              let cellStyle = "bg-midnight-900/90 text-slate-300 border-midnight-700/80";
              let glow = "";

              if (highlight) {
                if (highlight.status === 'found') {
                  cellStyle = "bg-emerald-950/90 text-emerald-300 border-emerald-400 font-bold";
                  glow = "shadow-[0_0_12px_rgba(52,211,153,0.5)]";
                } else {
                  cellStyle = "bg-sakura-500/30 text-sakura-300 border-sakura-400 font-bold";
                  glow = "shadow-sakura-glow";
                }
              } else if (inBox) {
                cellStyle = "bg-midnight-800/80 text-white border-sakura-500/50";
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center font-mono text-sm sm:text-base select-none border transition-all duration-200 relative ${cellStyle} ${glow}`}
                >
                  <span>{val}</span>
                  <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-500">
                    {r},{c}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Rectangle Badge if available */}
        {selectedBox && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-sakura-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sakura-400 animate-pulse" />
            <span>
              Vùng chữ nhật: [{selectedBox.r1},{selectedBox.c1}] đến [{selectedBox.r2},{selectedBox.c2}] 
              (Diện tích: {(Math.abs(selectedBox.r2 - selectedBox.r1) + 1) * (Math.abs(selectedBox.c2 - selectedBox.c1) + 1)} ô)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
