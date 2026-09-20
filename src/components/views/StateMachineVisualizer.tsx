import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ArrowRight } from 'lucide-react';
import { Frame, VisualizationSpec, StateMachineData, StateNode, StateTransition } from '../../types';

interface StateMachineVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const StateMachineVisualizer: React.FC<StateMachineVisualizerProps> = ({ frame, spec }) => {
  const fsmData: StateMachineData = React.useMemo(() => {
    if (frame.stateMachineData) return frame.stateMachineData;

    // Fallback từ nodes/edges
    if (frame.nodes && frame.nodes.length > 0) {
      return {
        states: frame.nodes.map((n, idx) => ({
          id: n.id,
          label: n.label || n.id,
          isInitial: idx === 0,
          isAccepting: idx === frame.nodes!.length - 1,
          isCurrent: n.highlight
        })),
        transitions: (frame.edges || []).map((e, idx) => ({
          id: `t-${idx}`,
          from: e.from,
          to: e.to,
          symbol: e.label || (e.weight !== undefined ? String(e.weight) : 'ε'),
          highlight: e.highlight
        }))
      };
    }

    return { states: [], transitions: [] };
  }, [frame.stateMachineData, frame.nodes, frame.edges]);

  const states: StateNode[] = fsmData.states || [];
  const transitions: StateTransition[] = fsmData.transitions || [];
  const tape = fsmData.tape || [];
  const tapeIndex = fsmData.tapeIndex ?? 0;

  // Tính toán vị trí các state theo vòng tròn hoặc hàng ngang
  const statePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const n = states.length;
    if (n === 0) return pos;

    const cx = 350;
    const cy = 200;
    const rx = Math.min(260, 50 + n * 35);
    const ry = 120;

    states.forEach((s, idx) => {
      const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
      pos[s.id] = {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle)
      };
    });

    return pos;
  }, [states]);

  if (states.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu máy trạng thái để trực quan hóa.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div className="w-full max-w-4xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Cpu className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Máy trạng thái / Hữu hạn tự động (FSM / Automata)</span>
          </div>
          <span className="text-slate-400">
            Số trạng thái: <b className="text-white">{states.length}</b>
          </span>
        </div>

        {/* Khung vẽ đồ thị máy trạng thái SVG */}
        <div className="relative w-full overflow-x-auto flex justify-center">
          <svg width="700" height="380" className="font-mono">
            <defs>
              <marker
                id="fsm-arrow"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
              <marker
                id="fsm-arrow-hl"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Các chuyển trạng thái (Transitions) */}
            {transitions.map((tr, idx) => {
              const fromPos = statePositions[tr.from];
              const toPos = statePositions[tr.to];
              if (!fromPos || !toPos) return null;

              const isHl = tr.highlight;
              const isSelfLoop = tr.from === tr.to;

              if (isSelfLoop) {
                // Vẽ self-loop vòng lên trên
                const loopPath = `M ${fromPos.x - 12} ${fromPos.y - 20} C ${fromPos.x - 30} ${fromPos.y - 70}, ${fromPos.x + 30} ${fromPos.y - 70}, ${fromPos.x + 12} ${fromPos.y - 20}`;
                return (
                  <g key={tr.id || `tr-${idx}`}>
                    <path
                      d={loopPath}
                      fill="none"
                      stroke={isHl ? '#f43f5e' : '#64748b'}
                      strokeWidth={isHl ? 2.5 : 1.5}
                      markerEnd={isHl ? 'url(#fsm-arrow-hl)' : 'url(#fsm-arrow)'}
                    />
                    <text
                      x={fromPos.x}
                      y={fromPos.y - 65}
                      fill={isHl ? '#fda4af' : '#cbd5e1'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {tr.symbol}
                    </text>
                  </g>
                );
              }

              // Đường cong nhẹ giữa 2 trạng thái
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const cx = (fromPos.x + toPos.x) / 2 - dy * 0.2;
              const cy = (fromPos.y + toPos.y) / 2 + dx * 0.2;

              const pathD = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;

              return (
                <g key={tr.id || `tr-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHl ? '#f43f5e' : '#64748b'}
                    strokeWidth={isHl ? 2.5 : 1.5}
                    markerEnd={isHl ? 'url(#fsm-arrow-hl)' : 'url(#fsm-arrow)'}
                    className="transition-all duration-300"
                  />
                  <text
                    x={cx}
                    y={cy - 4}
                    fill={isHl ? '#fda4af' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {tr.symbol}
                  </text>
                </g>
              );
            })}

            {/* Các trạng thái (States) */}
            {states.map((st) => {
              const pos = statePositions[st.id];
              if (!pos) return null;

              const isCurrent = st.isCurrent;
              const isAccepting = st.isAccepting;
              const isInitial = st.isInitial;

              return (
                <g key={st.id} className="cursor-pointer">
                  {/* Mũi tên chỉ trạng thái khởi đầu */}
                  {isInitial && (
                    <g>
                      <line
                        x1={pos.x - 45}
                        y1={pos.y}
                        x2={pos.x - 24}
                        y2={pos.y}
                        stroke="#38bdf8"
                        strokeWidth="2"
                        markerEnd="url(#fsm-arrow)"
                      />
                      <text x={pos.x - 50} y={pos.y + 4} fill="#38bdf8" fontSize="10" textAnchor="end">
                        Start
                      </text>
                    </g>
                  )}

                  {/* Vòng đôi cho accepting/final state */}
                  {isAccepting && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="26"
                      fill="none"
                      stroke={isCurrent ? '#f43f5e' : '#10b981'}
                      strokeWidth="1.8"
                    />
                  )}

                  {/* Nút chính */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="22"
                    fill={isCurrent ? '#881337' : '#0f172a'}
                    stroke={isCurrent ? '#f43f5e' : isAccepting ? '#10b981' : '#475569'}
                    strokeWidth={isCurrent ? 3 : 2}
                  />

                  {/* Tên trạng thái */}
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    fill={isCurrent ? '#fda4af' : '#f1f5f9'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {st.label || st.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Băng ghi dữ liệu đầu vào (Input Tape) nếu có */}
        {tape.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2 pt-3 border-t border-midnight-800">
            <span className="text-xs font-mono font-bold text-slate-400">Băng đọc ký tự (Input Tape):</span>
            <div className="flex items-center gap-1 overflow-x-auto p-2">
              {tape.map((ch, idx) => {
                const isCurrentChar = idx === tapeIndex;
                return (
                  <div
                    key={idx}
                    className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-xs rounded border transition-all ${
                      isCurrentChar
                        ? 'bg-sakura-500 text-midnight-950 border-white shadow-sakura-glow scale-110'
                        : idx < tapeIndex
                        ? 'bg-midnight-900/40 text-slate-500 border-slate-800'
                        : 'bg-midnight-900 text-slate-200 border-slate-700'
                    }`}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
