import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, HelpCircle, Terminal } from 'lucide-react';
import { SimulationResult, Frame } from '../types';

interface VisualizerCanvasProps {
  simulation: SimulationResult | null;
  currentFrameIndex: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  simulation,
  currentFrameIndex
}) => {
  if (!simulation || !simulation.frames || simulation.frames.length === 0) {
    return (
      <div className="w-full sakura-card p-12 flex flex-col items-center justify-center text-center z-10 relative">
        <div className="w-12 h-12 rounded-2xl bg-midnight-800 border border-sakura-500/30 flex items-center justify-center text-sakura-400 mb-3">
          <HelpCircle className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Chưa có đề bài nào được nạp
        </h3>
        <p className="text-xs text-slate-400 max-w-md">
          Chụp ảnh màn hình đề bài rồi nhấn <span className="text-sakura-400 font-bold">Ctrl + V</span> ở khung trên để xem trực quan hóa test ví dụ ngay.
        </p>
      </div>
    );
  }

  const currentFrame: Frame = simulation.frames[currentFrameIndex] || simulation.frames[0];
  const elements = currentFrame.elements || [];
  const highlights = currentFrame.highlights || [];
  const pointers = currentFrame.pointers || {};
  const variables = currentFrame.variables || {};

  const getPointersForIndex = (index: number): string[] => {
    const matched: string[] = [];
    for (const [pName, pIdx] of Object.entries(pointers)) {
      if (pIdx === index) matched.push(pName);
    }
    return matched;
  };

  return (
    <div className="w-full sakura-card p-6 flex flex-col gap-6 z-10 relative">
      {/* Title & Example Input info */}
      <div className="border-b border-midnight-700/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sakura-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {simulation.problemTitle}
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-sakura-500/10 border border-sakura-500/30 text-sakura-300 w-fit">
            [Mô phỏng Test Ví Dụ]
          </span>
        </div>

        {simulation.problemSummary && (
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            <span className="text-sakura-400 font-bold">Yêu cầu: </span>
            {simulation.problemSummary}
          </p>
        )}

        {simulation.exampleInput && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-midnight-950 border border-midnight-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Test ví dụ: </span>
            <span className="text-sakura-300 font-bold">{simulation.exampleInput}</span>
          </div>
        )}
      </div>

      {/* Main Elements Canvas */}
      <div className="min-h-[220px] rounded-xl bg-midnight-950/90 border border-midnight-800 p-6 flex flex-col items-center justify-center relative overflow-x-auto">
        <div className="flex items-end justify-center gap-3 sm:gap-4 py-6 min-w-max">
          <AnimatePresence mode="popLayout">
            {elements.map((val, idx) => {
              const isHighlighted = highlights.includes(idx);
              const elementPointers = getPointersForIndex(idx);
              const status = currentFrame.status || 'normal';

              let blockStyle = "bg-midnight-900 border border-midnight-700 text-slate-200";
              let glowEffect = "";

              if (isHighlighted) {
                if (status === 'found' || status === 'done') {
                  blockStyle = "bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300";
                  glowEffect = "shadow-[0_0_15px_rgba(52,211,153,0.5)]";
                } else if (status === 'swapping') {
                  blockStyle = "bg-rose-950/80 border-2 border-rose-400 text-rose-300";
                  glowEffect = "shadow-[0_0_15px_rgba(251,113,133,0.5)]";
                } else {
                  blockStyle = "bg-sakura-500/20 border-2 border-sakura-400 text-sakura-300";
                  glowEffect = "shadow-sakura-glow";
                }
              }

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    [{idx}]
                  </span>

                  <motion.div
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: isHighlighted ? 1.08 : 1,
                      opacity: 1,
                      y: isHighlighted ? -4 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center font-mono font-bold text-lg sm:text-xl select-none transition-all ${blockStyle} ${glowEffect}`}
                  >
                    {val}
                  </motion.div>

                  <div className="min-h-[46px] flex flex-col items-center gap-1">
                    {elementPointers.map((pName) => (
                      <motion.div
                        key={pName}
                        layoutId={`ptr-${pName}`}
                        initial={{ y: -4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-sakura-400 -mb-1 animate-bounce" />
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sakura-500 text-midnight-950 shadow-sm">
                          {pName}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Variables Tracking */}
      {Object.keys(variables).length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase">
            Biến trạng thái:
          </span>
          {Object.entries(variables).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-midnight-950 border border-midnight-800 text-xs font-mono"
            >
              <span className="text-slate-400">{k}:</span>
              <span className="text-sakura-300 font-bold">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Step Explanation */}
      <motion.div
        key={currentFrameIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-4 rounded-xl bg-midnight-950/80 border-l-4 border-sakura-500 flex items-start gap-3"
      >
        <div className="w-6 h-6 rounded-md bg-sakura-500 text-midnight-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          {currentFrameIndex + 1}
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
          {currentFrame.description}
        </div>
      </motion.div>
    </div>
  );
};
