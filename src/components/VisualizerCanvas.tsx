import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Terminal, Tag } from 'lucide-react';
import { SimulationResult, Frame } from '../types';
import { GridVisualizer } from './views/GridVisualizer';
import { GraphVisualizer } from './views/GraphVisualizer';
import { IntervalsVisualizer } from './views/IntervalsVisualizer';
import { ArrayVisualizer } from './views/ArrayVisualizer';

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
          Hãy chụp màn hình đề bài rồi nhấn <span className="text-sakura-400 font-bold">Ctrl + V</span> (hoặc chuyển sang gõ raw text) để bắt đầu.
        </p>
      </div>
    );
  }

  const currentFrame: Frame = simulation.frames[currentFrameIndex] || simulation.frames[0];
  const viewType = simulation.viewType || 'array';
  const variables = currentFrame.variables || {};

  return (
    <div className="w-full sakura-card p-6 flex flex-col gap-5 z-10 relative">
      {/* 1. Tên bài & Tags */}
      <div className="border-b border-midnight-700/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sakura-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {simulation.problemTitle}
            </h2>
          </div>

          {/* Tags */}
          {simulation.tags && simulation.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3 h-3 text-sakura-400 mr-0.5" />
              {simulation.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-midnight-950 border border-sakura-500/30 text-sakura-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {simulation.problemSummary && (
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-sakura-400 font-bold">Tóm tắt: </span>
            {simulation.problemSummary}
          </p>
        )}

        {/* 2. Input mẫu & Output mẫu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {simulation.sampleInput && (
            <div className="p-3 rounded-xl bg-midnight-950 border border-midnight-800 text-xs font-mono">
              <span className="text-slate-500 block mb-1 font-bold">Input mẫu:</span>
              <pre className="text-sakura-300 font-semibold whitespace-pre-wrap">
                {simulation.sampleInput}
              </pre>
            </div>
          )}
          {simulation.sampleOutput && (
            <div className="p-3 rounded-xl bg-midnight-950 border border-midnight-800 text-xs font-mono">
              <span className="text-slate-500 block mb-1 font-bold">Output mẫu:</span>
              <pre className="text-emerald-400 font-semibold whitespace-pre-wrap">
                {simulation.sampleOutput}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 3. Khung Visualise tương ứng với dạng bài */}
      <div className="min-h-[240px] rounded-xl bg-midnight-950/90 border border-midnight-800 p-4 flex flex-col items-center justify-center relative overflow-x-auto">
        {viewType === 'grid' && <GridVisualizer frame={currentFrame} />}
        {viewType === 'intervals' && <IntervalsVisualizer frame={currentFrame} />}
        {(viewType === 'graph' || viewType === 'circular') && (
          <GraphVisualizer frame={currentFrame} isCircular={viewType === 'circular'} />
        )}
        {viewType === 'array' && <ArrayVisualizer frame={currentFrame} />}
      </div>

      {/* 4. Giải thích tương ứng từng bước */}
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

      {/* Biến trạng thái (nếu có) */}
      {Object.keys(variables).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-midnight-800/60">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase">
            Biến theo dõi:
          </span>
          {Object.entries(variables).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-midnight-950 border border-midnight-800 text-xs font-mono"
            >
              <span className="text-slate-400">{k}:</span>
              <span className="text-sakura-300 font-bold">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
