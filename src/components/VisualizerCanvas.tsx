import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Terminal, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SimulationResult, Frame } from '../types';
import { GridVisualizer } from './views/GridVisualizer';
import { GraphVisualizer } from './views/GraphVisualizer';
import { TreeVisualizer } from './views/TreeVisualizer';
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

  // 1. Chuẩn hóa viewType một cách thông minh và chính xác
  const rawViewType = (simulation.viewType || '').toLowerCase().trim();
  const allTags = (simulation.tags || []).map(t => t.toLowerCase()).join(' ');
  const titleSummary = (simulation.problemTitle + ' ' + simulation.problemSummary).toLowerCase();

  const hasGridData = simulation.frames.some(f => f.grid && f.grid.length > 0);
  const hasElementsData = simulation.frames.some(f => f.elements && f.elements.length > 0);
  const hasGraphData = simulation.frames.some(f => (f.nodes && f.nodes.length > 0) || (f.edges && f.edges.length > 0));
  const hasIntervalsData = simulation.frames.some(f => f.intervals && f.intervals.length > 0);

  let viewType: ViewType = 'array';
  if (rawViewType.includes('tree') || rawViewType.includes('cay') || allTags.includes('tree') || allTags.includes('lca')) {
    viewType = 'tree';
  } else if (hasGridData || (rawViewType.includes('grid') && !hasElementsData && (titleSummary.includes('robot') || titleSummary.includes('mê cung') || titleSummary.includes('lưới') || titleSummary.includes('bảng') || allTags.includes('grid') || allTags.includes('robot')))) {
    viewType = 'grid';
  } else if (rawViewType.includes('interval') || rawViewType.includes('segment') || allTags.includes('interval') || hasIntervalsData) {
    viewType = 'intervals';
  } else if (rawViewType.includes('circular') || rawViewType.includes('ring') || allTags.includes('circular')) {
    viewType = 'circular';
  } else if (hasGraphData || rawViewType.includes('graph') || rawViewType.includes('shortest') || rawViewType.includes('dijkstra') || rawViewType.includes('dsu') || allTags.includes('graph') || allTags.includes('dsu')) {
    viewType = 'graph';
  } else {
    viewType = 'array';
  }

  const currentFrame: Frame = simulation.frames[currentFrameIndex] || simulation.frames[0];
  const variables = currentFrame.variables || {};

  // 2. Kế thừa dữ liệu (Data Persistence / Frame Inheritance)
  // Nếu frame hiện tại bị thiếu nodes, edges, grid... thì kế thừa từ frame đầu tiên hoặc frame gần nhất có dữ liệu
  const frameWithNodes = simulation.frames.find(f => f.nodes && f.nodes.length > 0);
  const frameWithEdges = simulation.frames.find(f => f.edges && f.edges.length > 0);
  const frameWithGrid = simulation.frames.find(f => f.grid && f.grid.length > 0);
  const frameWithIntervals = simulation.frames.find(f => f.intervals && f.intervals.length > 0);
  const frameWithElements = simulation.frames.find(f => f.elements && f.elements.length > 0);

  // 3. Fallback tái tạo đồ thị từ sampleInput nếu cả simulation không có nodes/edges
  let fallbackNodes = frameWithNodes?.nodes;
  let fallbackEdges = frameWithEdges?.edges;

  if ((viewType === 'graph' || viewType === 'tree') && (!fallbackNodes || fallbackNodes.length === 0) && (!fallbackEdges || fallbackEdges.length === 0)) {
    if (simulation.sampleInput) {
      const lines = simulation.sampleInput.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const nodeSet = new Set<string>();
      const parsedEdges: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/);
        if (parts.length >= 2) {
          const u = parts[0];
          const v = parts[1];
          const w = parts[2];
          nodeSet.add(u);
          nodeSet.add(v);
          parsedEdges.push({ from: u, to: v, weight: w, highlight: false });
        }
      }

      const firstLine = lines[0]?.split(/\s+/);
      const n = parseInt(firstLine?.[0] || '0', 10);
      if (!isNaN(n) && n > 0 && n <= 50) {
        for (let i = 1; i <= n; i++) nodeSet.add(String(i));
      }

      fallbackNodes = Array.from(nodeSet).map(id => ({ id, label: id, highlight: false }));
      fallbackEdges = parsedEdges;
    }
  }

  // 4. Trích xuất đường đi từ variables hoặc description để tự động highlight
  let pathNodes: string[] = [];
  for (const [k, v] of Object.entries(variables)) {
    const str = String(v);
    if (str.includes('-') || str.includes('->') || str.includes('>')) {
      const parts = str.split(/->|-|>|\s+/).filter(Boolean);
      if (parts.length >= 2) {
        pathNodes = parts;
        break;
      }
    }
  }
  if (pathNodes.length === 0 && currentFrame.description) {
    const match = currentFrame.description.match(/\b(\d+(?:(?:\s*->\s*|\s*-\s*)\d+)+)\b/);
    if (match) {
      pathNodes = match[1].split(/->|-|\s+/).filter(Boolean);
    }
  }

  // Xây dựng effectiveFrame
  let effectiveNodes = (currentFrame.nodes && currentFrame.nodes.length > 0) ? currentFrame.nodes : fallbackNodes;
  let effectiveEdges = (currentFrame.edges && currentFrame.edges.length > 0) ? currentFrame.edges : fallbackEdges;

  // Tự động kích hoạt highlight nếu frame hiện tại chưa highlight nhưng có path
  if (pathNodes.length > 0 && effectiveNodes) {
    const hasAnyNodeHighlight = effectiveNodes.some(n => n.highlight);
    if (!hasAnyNodeHighlight) {
      const pathSet = new Set(pathNodes);
      effectiveNodes = effectiveNodes.map(n => ({
        ...n,
        highlight: pathSet.has(String(n.id))
      }));

      if (effectiveEdges) {
        effectiveEdges = effectiveEdges.map(e => {
          const from = String(e.from);
          const to = String(e.to);
          const isEdgeInPath = pathNodes.some((node, idx) => {
            if (idx === pathNodes.length - 1) return false;
            const next = pathNodes[idx + 1];
            return (from === node && to === next) || (from === next && to === node);
          });
          return {
            ...e,
            highlight: isEdgeInPath
          };
        });
      }
    }
  }

  // Tự động hoàn thiện đỉnh và cạnh cho cây nếu AI bị thiếu hoặc sinh sót
  if (viewType === 'tree') {
    const desc = currentFrame.description || '';
    const descMatch = desc.match(/(\d+)\s*đỉnh/i);
    const isLinearTree = desc.toLowerCase().includes('đường thẳng') || desc.toLowerCase().includes('suy biến') || desc.toLowerCase().includes('cha là i-1');
    
    let targetN = descMatch ? parseInt(descMatch[1], 10) : 0;
    if (!targetN || targetN <= 0) {
      const outLines = (simulation.sampleOutput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (outLines.length > 0) {
        const firstNum = parseInt(outLines[0], 10);
        if (!isNaN(firstNum) && firstNum > 1 && firstNum <= 100) targetN = firstNum;
      }
    }

    if (targetN > 1 && (!effectiveNodes || effectiveNodes.length < targetN)) {
      const existingIds = new Set((effectiveNodes || []).map(n => String(n.id)));
      const newNodes = effectiveNodes ? [...effectiveNodes] : [];
      for (let i = 1; i <= targetN; i++) {
        const sId = String(i);
        if (!existingIds.has(sId)) {
          newNodes.push({ id: sId, label: sId, highlight: false });
        }
      }
      effectiveNodes = newNodes;
    }

    if (!effectiveEdges || effectiveEdges.length < (effectiveNodes?.length || 0) - 1) {
      // Đọc cạnh từ sampleOutput
      const outLines = (simulation.sampleOutput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
      const parsedEdges: EdgeItem[] = [];
      for (let i = 0; i < outLines.length; i++) {
        const parts = outLines[i].split(/\s+/);
        if (parts.length >= 2) {
          const u = parts[0];
          const v = parts[1];
          if (u !== v && !isNaN(parseInt(u, 10)) && !isNaN(parseInt(v, 10))) {
            parsedEdges.push({ from: u, to: v, highlight: false });
          }
        }
      }

      if (parsedEdges.length >= (effectiveNodes?.length || 0) - 1 && parsedEdges.length > 0) {
        effectiveEdges = parsedEdges;
      } else if (isLinearTree && effectiveNodes && effectiveNodes.length > 1) {
        // Cây suy biến dạng đường thẳng i có cha là i-1
        effectiveEdges = [];
        for (let i = 2; i <= effectiveNodes.length; i++) {
          effectiveEdges.push({ from: String(i - 1), to: String(i), highlight: false });
        }
      }
    }
  }

  // Tự động hoàn thiện Grid nếu viewType là grid mà AI quên sinh mảng grid
  let effectiveGrid = (currentFrame.grid && currentFrame.grid.length > 0) ? currentFrame.grid : frameWithGrid?.grid;

  const isTrueGridProblem = titleSummary.includes('robot') || titleSummary.includes('mê cung') || titleSummary.includes('maze') || titleSummary.includes('lưới') || allTags.includes('robot') || allTags.includes('grid');

  if (viewType === 'grid' && (!effectiveGrid || effectiveGrid.length === 0)) {
    if (isTrueGridProblem) {
      // Thử đọc từ sampleInput (ví dụ: dòng 1 là số test case, dòng 2 là: "10 10 6 1")
      const lines = (simulation.sampleInput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
      let n = 0, m = 0, robotR = -1, robotC = -1;

      for (const line of lines) {
        const parts = line.split(/\s+/).map(Number).filter(v => !isNaN(v));
        if (parts.length === 1 && lines.length > 1 && n === 0) continue; // Bỏ qua dòng t (số test)
        if (parts.length >= 4 && n === 0) {
          // n m rb cb (như bài Robot Cleaner: 10 10 6 1)
          n = parts[0];
          m = parts[1];
          robotR = parts[2];
          robotC = parts[3];
          break;
        } else if (parts.length >= 2 && n === 0) {
          n = parts[0];
          m = parts[1];
          break;
        }
      }

      if (n > 0 && m > 0 && n <= 60 && m <= 60) {
        const newGrid: string[][] = [];
        for (let r = 1; r <= n; r++) {
          const row: string[] = [];
          for (let c = 1; c <= m; c++) {
            if (r === robotR && c === robotC) {
              row.push('🤖');
            } else if (robotR > 0 && (r === robotR || c === robotC)) {
              row.push('✓'); // Đã làm sạch cùng hàng hoặc cột
            } else {
              row.push('·');
            }
          }
          newGrid.push(row);
        }
        effectiveGrid = newGrid;
      }
    } else {
      // Không phải bài toán lưới/robot -> Chuyển về array
      viewType = 'array';
    }
  }

  const effectiveFrame: Frame = {
    ...currentFrame,
    nodes: effectiveNodes,
    edges: effectiveEdges,
    grid: effectiveGrid,
    intervals: (currentFrame.intervals && currentFrame.intervals.length > 0) ? currentFrame.intervals : frameWithIntervals?.intervals,
    elements: (currentFrame.elements && currentFrame.elements.length > 0) ? currentFrame.elements : frameWithElements?.elements,
  };

  // Xác định đỉnh gốc (rootId) linh hoạt & hỗ trợ đổi gốc động (Dynamic Tree Rerooting)
  let effectiveRootId = currentFrame.rootId;

  // 1. Kiểm tra xem frame hiện tại có biến đổi gốc không (ví dụ: variables.root, variables.gốc, variables.rootId)
  if (!effectiveRootId && currentFrame.variables) {
    for (const [k, v] of Object.entries(currentFrame.variables)) {
      const kLower = k.toLowerCase();
      if (kLower === 'root' || kLower === 'gốc' || kLower === 'rootid' || kLower.includes('đỉnh_gốc') || kLower.includes('new_root')) {
        effectiveRootId = String(v);
        break;
      }
    }
  }

  // 2. Kiểm tra trong description xem có thao tác đổi gốc không (ví dụ: "Đổi gốc sang đỉnh 3", "Reroot tại đỉnh 4")
  if (!effectiveRootId && currentFrame.description) {
    const rerootMatch = currentFrame.description.match(/(?:đổi gốc sang|chọn.*làm gốc|gốc mới là|reroot.*tại|gốc tại|root\s*=\s*)\s*(\d+)/i);
    if (rerootMatch) {
      effectiveRootId = rerootMatch[1];
    }
  }

  // 3. Fallback: Lấy từ simulation.rootId hoặc tìm trong đề bài
  if (!effectiveRootId) {
    effectiveRootId = simulation.rootId;
  }
  if (!effectiveRootId) {
    const textToSearch = `${simulation.problemTitle} ${simulation.problemSummary} ${simulation.sampleInput}`;
    const rootMatch = textToSearch.match(/(?:gốc|root)\s*(?:là|is|tại|=|:)?\s*(\d+)/i);
    if (rootMatch) {
      effectiveRootId = rootMatch[1];
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

        {/* Cảnh báo Output bạn nhập bị sai so với đề bài (hiển thị dạng text rõ ràng ở box visualise) */}
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

        {/* Thông báo thành công nếu Output người dùng nhập khớp hoàn toàn */}
        {simulation.userExpectedOutput && !simulation.outputMismatchWarning && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>✓ Output bạn nhập (<span className="font-bold text-emerald-300">{simulation.userExpectedOutput}</span>) hoàn toàn chính xác và khớp với kết quả thuật toán!</span>
          </div>
        )}
      </div>

      {/* 3. Khung Visualise tương ứng với dạng bài */}
      <div className="min-h-[260px] max-h-[620px] rounded-xl bg-midnight-950/90 border border-midnight-800 p-4 flex flex-col items-center justify-start relative overflow-auto">
        {viewType === 'grid' && <GridVisualizer frame={effectiveFrame} />}
        {viewType === 'tree' && <TreeVisualizer frame={effectiveFrame} rootId={effectiveRootId} />}
        {viewType === 'intervals' && <IntervalsVisualizer frame={effectiveFrame} />}
        {(viewType === 'graph' || viewType === 'circular') && (
          <GraphVisualizer frame={effectiveFrame} isCircular={viewType === 'circular'} />
        )}
        {viewType === 'array' && <ArrayVisualizer frame={effectiveFrame} />}
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
