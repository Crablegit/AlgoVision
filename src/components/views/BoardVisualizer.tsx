import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Swords } from 'lucide-react';
import { Frame, VisualizationSpec, BoardData, BoardPiece } from '../../types';

interface BoardVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const BoardVisualizer: React.FC<BoardVisualizerProps> = ({ frame, spec }) => {
  const boardData: BoardData = React.useMemo(() => {
    if (frame.boardData) return frame.boardData;

    // Fallback từ frame.grid nếu có
    if (frame.grid && frame.grid.length > 0) {
      const rows = frame.grid.length;
      const cols = frame.grid[0]?.length || 0;
      const pieces: BoardPiece[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = frame.grid[r][c];
          if (val && val !== '·' && val !== ' ' && val !== '') {
            pieces.push({
              id: `p-${r}-${c}`,
              r,
              c,
              symbol: String(val)
            });
          }
        }
      }

      return {
        rows,
        cols,
        pieces,
        pattern: 'checkerboard'
      };
    }

    return {
      rows: 8,
      cols: 8,
      pieces: []
    };
  }, [frame.boardData, frame.grid]);

  const rows = boardData.rows || 8;
  const cols = boardData.cols || 8;
  const pieces = boardData.pieces || [];
  const pattern = boardData.pattern || 'checkerboard';
  const lastMove = boardData.lastMove;

  // Tiêu đề cột: nếu <= 8 dùng 'a', 'b', 'c'..., nếu không dùng 1, 2, 3...
  const colLabels = cols <= 8
    ? Array.from({ length: cols }, (_, i) => String.fromCharCode(97 + i))
    : Array.from({ length: cols }, (_, i) => String(i + 1));

  const rowLabels = Array.from({ length: rows }, (_, i) => String(rows - i));

  const getPieceAt = (r: number, c: number) => {
    return pieces.find(p => p.r === r && p.c === c);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div className="w-full max-w-3xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Header Board */}
        <div className="w-full flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Swords className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Bàn cờ / Game Board ({rows} × {cols})</span>
          </div>
          {boardData.turn && (
            <span className="px-2.5 py-1 rounded bg-sakura-500/20 border border-sakura-400 text-sakura-300 font-bold">
              Lượt chơi: {boardData.turn}
            </span>
          )}
        </div>

        {/* Khung Bàn cờ */}
        <div className="inline-block relative p-3 rounded-2xl bg-midnight-900 border-2 border-slate-700 shadow-2xl">
          {/* Top Col Headers */}
          <div className="flex items-center pl-7 mb-1">
            {colLabels.map((cLab, idx) => (
              <div
                key={idx}
                className="w-10 sm:w-12 h-6 flex items-center justify-center font-mono font-bold text-xs text-slate-500"
              >
                {cLab}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex items-center">
                {/* Left Row Label */}
                <div className="w-7 h-10 sm:h-12 flex items-center justify-center font-mono font-bold text-xs text-slate-500">
                  {rowLabels[r]}
                </div>

                {/* Cells */}
                {Array.from({ length: cols }).map((_, c) => {
                  const isDark = pattern === 'checkerboard' ? (r + c) % 2 === 1 : false;
                  const piece = getPieceAt(r, c);
                  const isLastMoveFrom = lastMove && lastMove.fromR === r && lastMove.fromC === c;
                  const isLastMoveTo = lastMove && lastMove.toR === r && lastMove.toC === c;

                  let cellBg = isDark ? 'bg-slate-800/90' : 'bg-slate-700/40';
                  if (isLastMoveTo) cellBg = 'bg-sakura-500/40 border-2 border-sakura-400 shadow-sakura-glow';
                  if (isLastMoveFrom) cellBg = 'bg-amber-950/60 border border-dashed border-amber-400';

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-mono relative transition-colors ${cellBg}`}
                    >
                      {piece && (
                        <motion.span
                          layoutId={`piece-${piece.id}`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`drop-shadow select-none ${
                            piece.highlight ? 'text-sakura-300 scale-110 font-bold animate-pulse' : 'text-slate-100'
                          }`}
                        >
                          {piece.symbol}
                        </motion.span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Thông tin nước đi gần nhất */}
        {lastMove && (
          <div className="text-xs font-mono text-slate-300 flex items-center gap-2 pt-2 border-t border-midnight-800">
            <span className="text-sakura-400 font-bold">Nước đi gần nhất:</span>
            <span>
              [{colLabels[lastMove.fromC]}{rowLabels[lastMove.fromR]}] → [{colLabels[lastMove.toC]}{rowLabels[lastMove.toR]}]
            </span>
            {lastMove.piece && <span className="text-white font-bold">({lastMove.piece})</span>}
          </div>
        )}
      </div>
    </div>
  );
};
