import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Frame, VisualizationSpec, GenericSceneData, SceneEntity, SceneGroup, SceneArrow } from '../../types';

interface GenericSceneVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const GenericSceneVisualizer: React.FC<GenericSceneVisualizerProps> = ({ frame, spec }) => {
  const sceneData: GenericSceneData = useMemo(() => {
    if (frame.genericSceneData) return frame.genericSceneData;

    // Fallback từ nodes/edges nếu có
    if (frame.nodes && frame.nodes.length > 0) {
      return {
        entities: frame.nodes.map((n, idx) => ({
          id: n.id,
          label: n.label || n.id,
          x: 120 + (idx % 3) * 220,
          y: 80 + Math.floor(idx / 3) * 110,
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

  const rawEntities: SceneEntity[] = sceneData.entities || [];
  const groups: SceneGroup[] = sceneData.groups || [];
  const arrows: SceneArrow[] = sceneData.arrows || [];

  // BASE DIMENSIONS
  const BASE_WIDTH = 760;
  const BASE_HEIGHT = 400;

  // Tính toán layout và triệt tiêu đè lấn (Anti-Overlap Engine)
  const { layoutMap, stageHeight } = useMemo(() => {
    if (rawEntities.length === 0) {
      return { layoutMap: new Map<string, { x: number; y: number; w: number; h: number }>(), stageHeight: BASE_HEIGHT };
    }

    // 1. Kiểm tra xem tọa độ có đang dùng hệ % (0..100) hay không
    const validCoords = rawEntities.filter(e => typeof e.x === 'number' && typeof e.y === 'number' && !isNaN(e.x) && !isNaN(e.y));
    const allPercent = validCoords.length > 0 && validCoords.every(e => e.x <= 100 && e.y <= 100);

    // 2. Ước tính kích thước thẻ (Bounding Box) và gán vị trí ban đầu
    const positions = rawEntities.map((ent, idx) => {
      const text = `${ent.label || ent.id} ${ent.status || ''}`;
      // Tính width dựa trên độ dài chuỗi
      const w = Math.max(160, Math.min(280, text.length * 8.5 + 44));
      const h = ent.status ? 58 : 46;

      let initX: number;
      let initY: number;

      if (typeof ent.x === 'number' && typeof ent.y === 'number' && !isNaN(ent.x) && !isNaN(ent.y)) {
        if (allPercent) {
          // Quy đổi từ % sang pixel có padding an toàn
          initX = (ent.x / 100) * (BASE_WIDTH - w - 40) + w / 2 + 20;
          initY = (ent.y / 100) * (BASE_HEIGHT - h - 40) + h / 2 + 20;
        } else if (ent.x <= 1 && ent.y <= 1 && ent.x >= 0 && ent.y >= 0) {
          // Tọa độ chuẩn hóa 0..1
          initX = ent.x * (BASE_WIDTH - w - 40) + w / 2 + 20;
          initY = ent.y * (BASE_HEIGHT - h - 40) + h / 2 + 20;
        } else {
          // Pixel trực tiếp
          initX = ent.x;
          initY = ent.y;
        }
      } else {
        // Fallback dạng lưới nếu không có tọa độ
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        initX = 140 + col * 250;
        initY = 70 + row * 100;
      }

      return {
        id: ent.id,
        x: initX,
        y: initY,
        w,
        h,
        original: ent
      };
    });

    // 3. Multi-pass Relaxation: Giải phóng toàn bộ va chạm / đè lấn
    const GAP_X = 24;
    const GAP_Y = 20;
    const MAX_PASSES = 30;

    for (let pass = 0; pass < MAX_PASSES; pass++) {
      let hasCollision = false;

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const pA = positions[i];
          const pB = positions[j];

          const reqDistX = (pA.w + pB.w) / 2 + GAP_X;
          const reqDistY = (pA.h + pB.h) / 2 + GAP_Y;

          const dx = pB.x - pA.x;
          const dy = pB.y - pA.y;

          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < reqDistX && absDy < reqDistY) {
            hasCollision = true;

            const overlapX = reqDistX - absDx;
            const overlapY = reqDistY - absDy;

            // Nếu 2 đối tượng thẳng hàng dọc hoặc gần như thẳng hàng (như trong ảnh Matryoshka)
            if (absDx < 60) {
              const pushY = overlapY;
              const signY = dy >= 0 ? 1 : -1;
              pB.y += pushY * 0.65 * signY;
              pA.y -= pushY * 0.35 * signY;
            } 
            // Nếu 2 đối tượng thẳng hàng ngang
            else if (absDy < 30) {
              const pushX = overlapX;
              const signX = dx >= 0 ? 1 : -1;
              pB.x += pushX * 0.65 * signX;
              pA.x -= pushX * 0.35 * signX;
            } 
            // Đè chéo: đẩy theo hướng có độ đè lấn nhỏ hơn
            else if (overlapY < overlapX) {
              const pushY = overlapY;
              const signY = dy >= 0 ? 1 : -1;
              pB.y += pushY * 0.65 * signY;
              pA.y -= pushY * 0.35 * signY;
            } else {
              const pushX = overlapX;
              const signX = dx >= 0 ? 1 : -1;
              pB.x += pushX * 0.65 * signX;
              pA.x -= pushX * 0.35 * signX;
            }
          }
        }
      }

      if (!hasCollision) break;
    }

    // 4. Giữ các đối tượng không bị trôi ra khỏi mép trái và mép trên
    positions.forEach(p => {
      p.x = Math.max(p.w / 2 + 16, p.x);
      p.y = Math.max(p.h / 2 + 16, p.y);
    });

    // 5. Tính chiều cao tối thiểu cần thiết để không bị cắt
    const maxBottomY = Math.max(...positions.map(p => p.y + p.h / 2));
    const finalStageHeight = Math.max(BASE_HEIGHT, Math.ceil(maxBottomY + 40));

    const map = new Map<string, { x: number; y: number; w: number; h: number }>();
    positions.forEach(p => {
      map.set(p.id, { x: Math.round(p.x), y: Math.round(p.y), w: p.w, h: p.h });
    });

    return { layoutMap: map, stageHeight: finalStageHeight };
  }, [rawEntities]);

  if (rawEntities.length === 0 && groups.length === 0) {
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
            Số đối tượng: <b className="text-white">{rawEntities.length}</b>
          </span>
        </div>

        {/* Khung bản đồ phối cảnh (Chiều cao động tự co giãn theo nội dung) */}
        <div 
          className="relative w-full bg-midnight-900/60 border border-midnight-800 rounded-xl overflow-hidden p-4 transition-all duration-300"
          style={{ minHeight: `${stageHeight}px` }}
        >
          {/* Nhóm / Containers trên scene */}
          {groups.map(grp => {
            const leftVal = typeof grp.x === 'number' && grp.x <= 100 ? `${grp.x}%` : `${grp.x}px`;
            const topVal = typeof grp.y === 'number' && grp.y <= 100 ? `${grp.y}%` : `${grp.y}px`;
            const widthVal = typeof grp.w === 'number' && grp.w <= 100 ? `${grp.w}%` : `${grp.w}px`;
            const heightVal = typeof grp.h === 'number' && grp.h <= 100 ? `${grp.h}%` : `${grp.h}px`;

            return (
              <div
                key={grp.id}
                className="absolute rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-900/30 p-2 pointer-events-none transition-all"
                style={{
                  left: leftVal,
                  top: topVal,
                  width: widthVal,
                  height: heightVal
                }}
              >
                <span className="text-[11px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-midnight-950/90 border border-slate-700">
                  {grp.title}
                </span>
              </div>
            );
          })}

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
              const src = layoutMap.get(arr.fromId);
              const tgt = layoutMap.get(arr.toId);
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
                      className="font-bold drop-shadow"
                    >
                      {arr.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Các thực thể (Entities) - Đã triệt tiêu 100% đè lấn */}
          {rawEntities.map((ent) => {
            const isHl = ent.highlight;
            const pos = layoutMap.get(ent.id);
            if (!pos) return null;

            const isQuery = (ent.label || ent.id || '').toLowerCase().includes('query') || 
                            (ent.label || ent.id || '').toLowerCase().includes('truy vấn');

            let cardStyle = 'bg-midnight-950/95 border-slate-700 text-slate-200 z-10';
            if (isHl) {
              cardStyle = 'bg-sakura-500/25 border-sakura-400 text-sakura-200 shadow-sakura-glow font-bold scale-105 z-30';
            } else if (isQuery) {
              cardStyle = 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200 shadow-lg z-20';
            }

            return (
              <motion.div
                key={ent.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-xs select-none shadow-xl transition-all ${cardStyle}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  minWidth: '140px',
                  maxWidth: '300px'
                }}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {ent.icon && <span className="text-base">{ent.icon}</span>}
                  {isQuery && <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="text-center">{ent.label || ent.id}</span>
                </div>

                {ent.status && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-midnight-900 border border-slate-700/80 text-slate-300">
                    {ent.status}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
