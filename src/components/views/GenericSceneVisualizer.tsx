import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { Frame, VisualizationSpec, GenericSceneData, SceneEntity, SceneGroup, SceneArrow } from '../../types';

interface GenericSceneVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const GenericSceneVisualizer: React.FC<GenericSceneVisualizerProps> = ({ frame, spec }) => {
  const sceneData: GenericSceneData = React.useMemo(() => {
    if (frame.genericSceneData) return frame.genericSceneData;

    // Fallback từ nodes/edges
    if (frame.nodes && frame.nodes.length > 0) {
      return {
        entities: frame.nodes.map((n, idx) => ({
          id: n.id,
          label: n.label || n.id,
          x: 100 + (idx % 4) * 140,
          y: 80 + Math.floor(idx / 4) * 120,
          highlight: n.highlight
        })),
        arrows: (frame.edges || []).map((e, idx) => ({
          id: `arrow-${idx}`,
          fromId: e.from,
          toId: e.to,
          label: e.label,
          highlight: e.highlight
        }))
      };
    }

    return { entities: [], groups: [], arrows: [] };
  }, [frame.genericSceneData, frame.nodes, frame.edges]);

  const entities: SceneEntity[] = sceneData.entities || [];
  const groups: SceneGroup[] = sceneData.groups || [];
  const arrows: SceneArrow[] = sceneData.arrows || [];

  const entityPosMap = React.useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    entities.forEach(ent => {
      map[ent.id] = { x: ent.x, y: ent.y };
    });
    return map;
  }, [entities]);

  if (entities.length === 0 && groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu phối cảnh để trực quan hóa.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div className="w-full max-w-4xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Layers className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Mô hình ngữ cảnh (Generic Scene)</span>
          </div>
          <span className="text-slate-400">
            Số đối tượng: <b className="text-white">{entities.length}</b>
          </span>
        </div>

        {/* Khung bản đồ phối cảnh */}
        <div className="relative w-full min-h-[380px] bg-midnight-900/60 border border-midnight-800 rounded-xl overflow-hidden p-4">
          {/* Nhóm / Containers trên scene */}
          {groups.map(grp => (
            <div
              key={grp.id}
              className="absolute rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-900/30 p-2 pointer-events-none"
              style={{
                left: grp.x,
                top: grp.y,
                width: grp.w,
                height: grp.h
              }}
            >
              <span className="text-[11px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-midnight-950/90 border border-slate-700">
                {grp.title}
              </span>
            </div>
          ))}

          {/* Mũi tên / Luồng liên kết giữa các entity */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="scene-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
              <marker
                id="scene-arrow-hl"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            {arrows.map((arr, idx) => {
              const src = entityPosMap[arr.fromId];
              const tgt = entityPosMap[arr.toId];
              if (!src || !tgt) return null;

              const isHl = arr.highlight;

              return (
                <g key={arr.id || `arr-${idx}`}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHl ? '#f43f5e' : '#38bdf8'}
                    strokeWidth={isHl ? 2.5 : 1.5}
                    strokeDasharray={arr.dashed ? '5 5' : undefined}
                    markerEnd={isHl ? 'url(#scene-arrow-hl)' : 'url(#scene-arrow)'}
                  />
                  {arr.label && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 6}
                      fill="#f1f5f9"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="font-bold"
                    >
                      {arr.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Các thực thể (Entities) */}
          {entities.map((ent) => {
            const isHl = ent.highlight;

            return (
              <motion.div
                key={ent.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-xs select-none shadow-lg transition-all ${
                  isHl
                    ? 'bg-sakura-500/20 border-sakura-400 text-sakura-200 shadow-sakura-glow font-bold scale-105 z-20'
                    : 'bg-midnight-950 border-slate-700 text-slate-200 z-10'
                }`}
                style={{
                  left: ent.x,
                  top: ent.y
                }}
              >
                {ent.icon && <span className="text-xl">{ent.icon}</span>}
                <span className="font-bold">{ent.label || ent.id}</span>
                {ent.status && (
                  <span className="text-[10px] text-slate-400">({ent.status})</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
