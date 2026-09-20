import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Terminal, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SimulationResult, Frame, ViewType } from '../types';
import { GridVisualizer } from './views/GridVisualizer';
import { GraphVisualizer } from './views/GraphVisualizer';
import { TreeVisualizer } from './views/TreeVisualizer';
import { IntervalsVisualizer } from './views/IntervalsVisualizer';
import { ArrayVisualizer } from './views/ArrayVisualizer';
import { GeometryVisualizer } from './views/GeometryVisualizer';
import { StringVisualizer } from './views/StringVisualizer';
import { TimelineVisualizer } from './views/TimelineVisualizer';
import { MappingVisualizer } from './views/MappingVisualizer';
import { ContainersVisualizer } from './views/ContainersVisualizer';
import { MovementVisualizer } from './views/MovementVisualizer';
import { BoardVisualizer } from './views/BoardVisualizer';
import { CircularVisualizer } from './views/CircularVisualizer';
import { StateMachineVisualizer } from './views/StateMachineVisualizer';
import { GenericSceneVisualizer } from './views/GenericSceneVisualizer';

interface VisualizerCanvasProps {
  simulation: SimulationResult | null;
  currentFrameIndex: number;
}

const ALL_VIEW_TYPES: ViewType[] = [
  'array',
  'grid',
  'tree',
  'graph',
  'intervals',
  'circular',
  'geometry',
  'string',
  'timeline',
  'mapping',
  'containers',
  'movement',
  'board',
  'state-machine',
  'generic-scene'
];

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

  // 1. Xác định viewType chính xác (ưu tiên viewType do Gemini trả về nếu thuộc 15 loại)
  const rawViewType = (simulation.viewType || '').toLowerCase().trim() as ViewType;
  let viewType: ViewType = 'array';

  if (ALL_VIEW_TYPES.includes(rawViewType)) {
    viewType = rawViewType;
  } else {
    // Heuristic fallback nếu viewType lạ
    const allTags = (simulation.tags || []).map(t => t.toLowerCase()).join(' ');
    const titleSummary = (simulation.problemTitle + ' ' + simulation.problemSummary).toLowerCase();

    if (rawViewType.includes('geom') || allTags.includes('geometry')) {
      viewType = 'geometry';
    } else if (rawViewType.includes('string') || rawViewType.includes('xâu') || allTags.includes('string')) {
      viewType = 'string';
    } else if (rawViewType.includes('timeline') || rawViewType.includes('schedul')) {
      viewType = 'timeline';
    } else if (rawViewType.includes('map') || rawViewType.includes('bipartite')) {
      viewType = 'mapping';
    } else if (rawViewType.includes('container') || rawViewType.includes('jug') || rawViewType.includes('knapsack')) {
      viewType = 'containers';
    } else if (rawViewType.includes('move') || rawViewType.includes('robot')) {
      viewType = 'movement';
    } else if (rawViewType.includes('board') || rawViewType.includes('chess')) {
      viewType = 'board';
    } else if (rawViewType.includes('state') || rawViewType.includes('automata') || rawViewType.includes('fsm')) {
      viewType = 'state-machine';
    } else if (rawViewType.includes('circ') || rawViewType.includes('ring') || rawViewType.includes('josephus')) {
      viewType = 'circular';
    } else if (rawViewType.includes('tree') || rawViewType.includes('cay') || allTags.includes('tree')) {
      viewType = 'tree';
    } else if (rawViewType.includes('grid') || allTags.includes('grid')) {
      viewType = 'grid';
    } else if (rawViewType.includes('interval') || allTags.includes('interval')) {
      viewType = 'intervals';
    } else if (rawViewType.includes('graph') || allTags.includes('graph')) {
      viewType = 'graph';
    } else {
      viewType = 'array';
    }
  }

  const currentFrame: Frame = simulation.frames[currentFrameIndex] || simulation.frames[0];
  const variables = currentFrame.variables || {};
  const spec = simulation.visualizationSpec || {
    viewType,
    indexBase: simulation.indexBase ?? 1,
    subType: simulation.subType
  };

  // 2. Kế thừa dữ liệu giữa các frame (Frame Data Inheritance)
  const frameWithNodes = simulation.frames.find(f => f.nodes && f.nodes.length > 0);
  const frameWithEdges = simulation.frames.find(f => f.edges && f.edges.length > 0);
  const frameWithGrid = simulation.frames.find(f => (f.grid && f.grid.length > 0) || f.gridData?.cells);
  const frameWithIntervals = simulation.frames.find(f => f.intervals && f.intervals.length > 0);
  const frameWithElements = simulation.frames.find(f => f.elements && f.elements.length > 0);
  const frameWithGeometry = simulation.frames.find(f => f.geometryData || f.points || f.segments || f.polygons || f.circles);
  const frameWithString = simulation.frames.find(f => f.stringData);
  const frameWithTimeline = simulation.frames.find(f => f.timelineData);
  const frameWithMapping = simulation.frames.find(f => f.mappingData);
  const frameWithContainers = simulation.frames.find(f => f.containersData);
  const frameWithMovement = simulation.frames.find(f => f.movementData);
  const frameWithBoard = simulation.frames.find(f => f.boardData);
  const frameWithCircular = simulation.frames.find(f => f.circularData);
  const frameWithStateMachine = simulation.frames.find(f => f.stateMachineData);
  const frameWithGenericScene = simulation.frames.find(f => f.genericSceneData);

  const effectiveFrame: Frame = {
    ...currentFrame,
    nodes: (currentFrame.nodes && currentFrame.nodes.length > 0) ? currentFrame.nodes : frameWithNodes?.nodes,
    edges: (currentFrame.edges && currentFrame.edges.length > 0) ? currentFrame.edges : frameWithEdges?.edges,
    grid: (currentFrame.grid && currentFrame.grid.length > 0) ? currentFrame.grid : frameWithGrid?.grid,
    gridData: currentFrame.gridData || frameWithGrid?.gridData,
    intervals: (currentFrame.intervals && currentFrame.intervals.length > 0) ? currentFrame.intervals : frameWithIntervals?.intervals,
    elements: (currentFrame.elements && currentFrame.elements.length > 0) ? currentFrame.elements : frameWithElements?.elements,
    geometryData: currentFrame.geometryData || frameWithGeometry?.geometryData,
    stringData: currentFrame.stringData || frameWithString?.stringData,
    timelineData: currentFrame.timelineData || frameWithTimeline?.timelineData,
    mappingData: currentFrame.mappingData || frameWithMapping?.mappingData,
    containersData: currentFrame.containersData || frameWithContainers?.containersData,
    movementData: currentFrame.movementData || frameWithMovement?.movementData,
    boardData: currentFrame.boardData || frameWithBoard?.boardData,
    circularData: currentFrame.circularData || frameWithCircular?.circularData,
    stateMachineData: currentFrame.stateMachineData || frameWithStateMachine?.stateMachineData,
    genericSceneData: currentFrame.genericSceneData || frameWithGenericScene?.genericSceneData,
  };

  // Xác định rootId cho tree
  let effectiveRootId = currentFrame.rootId || simulation.rootId;
  if (!effectiveRootId && currentFrame.variables) {
    for (const [k, v] of Object.entries(currentFrame.variables)) {
      const kLower = k.toLowerCase();
      if (kLower === 'root' || kLower === 'gốc' || kLower === 'rootid' || kLower.includes('gốc')) {
        effectiveRootId = String(v);
        break;
      }
    }
  }

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
        <div className={`grid grid-cols-1 ${simulation.userExpectedOutput ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3 mt-3`}>
          {simulation.sampleInput && (
            <div className="p-3 rounded-xl bg-midnight-950 border border-midnight-800 text-xs font-mono">
              <span className="text-slate-500 block mb-1 font-bold">Input:</span>
              <pre className="text-sakura-300 font-semibold whitespace-pre-wrap">
                {simulation.sampleInput}
              </pre>
            </div>
          )}

          {simulation.sampleOutput && (
            <div className="p-3 rounded-xl bg-midnight-950 border border-midnight-800 text-xs font-mono">
              <span className="text-slate-500 block mb-1 font-bold">
                {simulation.userExpectedOutput ? 'Output thuật toán:' : 'Output mẫu:'}
              </span>
              <pre className="text-emerald-400 font-semibold whitespace-pre-wrap">
                {simulation.sampleOutput}
              </pre>
            </div>
          )}

          {simulation.userExpectedOutput && (
            <div className={`p-3 rounded-xl bg-midnight-950 border text-xs font-mono ${
              simulation.outputMismatchWarning ? 'border-rose-500/50' : 'border-emerald-500/50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 font-bold">Output bạn nhập:</span>
                {simulation.outputMismatchWarning ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50">
                    ✕ Không khớp
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                    ✓ Khớp
                  </span>
                )}
              </div>
              <pre className={`font-semibold whitespace-pre-wrap ${
                simulation.outputMismatchWarning ? 'text-rose-400 line-through' : 'text-emerald-300'
              }`}>
                {simulation.userExpectedOutput}
              </pre>
            </div>
          )}
        </div>

        {/* Cảnh báo Output không khớp */}
        {simulation.outputMismatchWarning && (
          <div className="mt-3 p-4 rounded-xl bg-rose-950/60 border-2 border-rose-500/80 text-rose-200 text-xs sm:text-sm flex flex-col gap-2 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 animate-pulse" />
              <span className="uppercase tracking-wider">
                Cảnh báo: Output bạn nhập chưa chính xác theo đề bài!
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {simulation.outputMismatchWarning}
            </p>
            {simulation.userExpectedOutput && (
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-rose-500/30 text-xs font-mono">
                <span className="text-rose-300">
                  Output bạn nhập: <span className="font-bold underline decoration-rose-500 decoration-2">{simulation.userExpectedOutput}</span> (Chưa chính xác)
                </span>
                <span className="text-emerald-400">
                  Output thuật toán tính được: <span className="font-bold">{simulation.sampleOutput}</span> (Chính xác)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Thông báo Output khớp hoàn toàn */}
        {simulation.userExpectedOutput && !simulation.outputMismatchWarning && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>✓ Output bạn nhập (<span className="font-bold text-emerald-300">{simulation.userExpectedOutput}</span>) hoàn toàn chính xác và khớp với kết quả thuật toán!</span>
          </div>
        )}
      </div>

      {/* 3. Khung Visualise - Dispatch chính xác theo 15 ViewTypes */}
      <div className="min-h-[260px] max-h-[660px] rounded-xl bg-midnight-950/90 border border-midnight-800 p-4 flex flex-col items-center justify-start relative overflow-auto">
        {viewType === 'array' && <ArrayVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'grid' && <GridVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'tree' && <TreeVisualizer frame={effectiveFrame} rootId={effectiveRootId} />}
        {viewType === 'graph' && <GraphVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'intervals' && <IntervalsVisualizer frame={effectiveFrame} />}
        {viewType === 'circular' && <CircularVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'geometry' && <GeometryVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'string' && <StringVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'timeline' && <TimelineVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'mapping' && <MappingVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'containers' && <ContainersVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'movement' && <MovementVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'board' && <BoardVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'state-machine' && <StateMachineVisualizer frame={effectiveFrame} spec={spec} />}
        {viewType === 'generic-scene' && <GenericSceneVisualizer frame={effectiveFrame} spec={spec} />}
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
        <div className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">
          {currentFrame.description}
        </div>
      </motion.div>

      {/* Biến theo dõi */}
      {Object.keys(variables).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-midnight-800/60">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase">
            Biến theo dõi:
          </span>
          {Object.entries(variables).map(([k, v]) => {
            const displayVal = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
            return (
              <div
                key={k}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-midnight-950 border border-midnight-800 text-xs font-mono"
              >
                <span className="text-slate-400">{k}:</span>
                <span className="text-sakura-300 font-bold">{displayVal}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
