import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Cpu, Info, CheckCircle2, ArrowDown } from 'lucide-react';
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
      <div className="w-full neu-card flex flex-col items-center justify-center p-12 text-center">
        <Info className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-bold text-gray-700">Chưa có dữ liệu mô phỏng</h3>
        <p className="text-sm text-gray-500 max-w-md mt-1">
          Chọn một bài toán mẫu ở trên hoặc dán đề bài của bạn rồi bấm "Phân tích & Trực quan hóa" để bắt đầu.
        </p>
      </div>
    );
  }

  const currentFrame: Frame = simulation.frames[currentFrameIndex] || simulation.frames[0];
  const elements = currentFrame.elements || [];
  const highlights = currentFrame.highlights || [];
  const pointers = currentFrame.pointers || {};
  const variables = currentFrame.variables || {};

  // Tìm các pointer trỏ vào index cụ thể
  const getPointersForIndex = (index: number): string[] => {
    const matched: string[] = [];
    for (const [pName, pIdx] of Object.entries(pointers)) {
      if (pIdx === index) {
        matched.push(pName);
      }
    }
    return matched;
  };

  // Màu sắc của con trỏ
  const getPointerBadgeColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('left') || lower.includes('low') || lower === 'i') {
      return 'bg-blue-500 text-white shadow-blue-300';
    }
    if (lower.includes('right') || lower.includes('high') || lower === 'j') {
      return 'bg-purple-500 text-white shadow-purple-300';
    }
    if (lower.includes('mid')) {
      return 'bg-amber-500 text-white shadow-amber-300';
    }
    return 'bg-emerald-500 text-white shadow-emerald-300';
  };

  return (
    <div className="w-full neu-card flex flex-col gap-6">
      {/* Problem Meta & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              {simulation.problemTitle}
            </h2>
          </div>
          <p className="text-xs text-blue-600 font-bold mt-0.5">
            Thuật toán: {simulation.algorithmName}
          </p>
        </div>

        {/* Complexities */}
        {simulation.complexity && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neu-bg shadow-neu-pressed text-xs font-mono font-semibold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Thời gian: {simulation.complexity.time}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neu-bg shadow-neu-pressed text-xs font-mono font-semibold text-gray-700">
              <Cpu className="w-3.5 h-3.5 text-purple-500" />
              <span>Không gian: {simulation.complexity.space}</span>
            </div>
          </div>
        )}
      </div>

      {/* Problem Short Summary */}
      {simulation.problemSummary && (
        <div className="p-3.5 rounded-xl bg-neu-bg shadow-neu-pressed text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-gray-700">💡 Ý tưởng chính: </span>
          {simulation.problemSummary}
        </div>
      )}

      {/* Main Interactive Stage / Elements Render */}
      <div className="min-h-[220px] rounded-2xl bg-neu-bg shadow-neu-pressed p-6 flex flex-col items-center justify-center relative overflow-x-auto">
        <div className="flex items-end justify-center gap-3 sm:gap-4 py-6 min-w-max">
          <AnimatePresence mode="popLayout">
            {elements.map((value, idx) => {
              const isHighlighted = highlights.includes(idx);
              const elementPointers = getPointersForIndex(idx);
              const status = currentFrame.status || 'normal';

              // Xác định style khối phần tử
              let blockStyle = "bg-neu-bg shadow-neu-flat text-gray-800 border-2 border-transparent";
              let glowEffect = "";

              if (isHighlighted) {
                if (status === 'comparing') {
                  blockStyle = "bg-amber-50 text-amber-900 border-2 border-amber-400";
                  glowEffect = "shadow-[0_0_15px_rgba(245,158,11,0.4)]";
                } else if (status === 'found' || status === 'done') {
                  blockStyle = "bg-emerald-50 text-emerald-900 border-2 border-emerald-500";
                  glowEffect = "shadow-[0_0_15px_rgba(16,185,129,0.5)]";
                } else if (status === 'swapping') {
                  blockStyle = "bg-rose-50 text-rose-900 border-2 border-rose-400";
                  glowEffect = "shadow-[0_0_15px_rgba(244,63,94,0.4)]";
                } else {
                  blockStyle = "bg-blue-50 text-blue-900 border-2 border-blue-400";
                  glowEffect = "shadow-[0_0_12px_rgba(59,130,246,0.3)]";
                }
              }

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  {/* Index badge */}
                  <span className="text-[11px] font-mono font-bold text-gray-400">
                    [{idx}]
                  </span>

                  {/* Element Block (Neumorphic) */}
                  <motion.div
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isHighlighted ? 1.08 : 1, 
                      opacity: 1,
                      y: isHighlighted ? -4 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center font-mono font-bold text-lg sm:text-xl select-none transition-colors ${blockStyle} ${glowEffect}`}
                  >
                    {value}
                  </motion.div>

                  {/* Pointers Container */}
                  <div className="min-h-[48px] flex flex-col items-center gap-1">
                    {elementPointers.map((pName) => (
                      <motion.div
                        key={pName}
                        layoutId={`pointer-${pName}`}
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-gray-500 -mb-1 animate-bounce" />
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-sm ${getPointerBadgeColor(
                            pName
                          )}`}
                        >
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

      {/* Variables & State Tracking Panel */}
      {Object.keys(variables).length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Biến trạng thái:
          </span>
          {Object.entries(variables).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neu-bg shadow-neu-flat text-xs font-mono"
            >
              <span className="text-gray-500 font-semibold">{key}:</span>
              <span className="text-blue-600 font-bold">{String(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Step Description (Animated Text) */}
      <motion.div
        key={currentFrameIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-4 rounded-2xl bg-neu-bg shadow-neu-flat border-l-4 border-blue-500 flex items-start gap-3"
      >
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          {currentFrameIndex + 1}
        </div>
        <div className="text-sm font-medium text-gray-700 leading-relaxed">
          {currentFrame.description}
        </div>
      </motion.div>
    </div>
  );
};
