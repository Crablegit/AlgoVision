import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Navigation } from 'lucide-react';
import { Frame, VisualizationSpec, MovementData, MovingEntity, Obstacle } from '../../types';

interface MovementVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const MovementVisualizer: React.FC<MovementVisualizerProps> = ({ frame, spec }) => {
  const indexBase = spec?.indexBase ?? 1;

  const movementData: MovementData = React.useMemo(() => {
    if (frame.movementData) return frame.movementData;

    // Fallback từ frame.grid nếu có ô robot
    if (frame.grid && frame.grid.length > 0) {
      const rows = frame.grid.length;
      const cols = frame.grid[0]?.length || 0;
      const entities: MovingEntity[] = [];
      const obstacles: Obstacle[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = String(frame.grid[r][c] ?? '');
          if (val.includes('🤖') || val === 'R') {
            entities.push({
              id: 'robot-1',
              label: 'Robot',
              icon: '🤖',
              x: c,
              y: r,
              direction: 'S'
            });
          } else if (val === 'X' || val === '#') {
            obstacles.push({ x: c, y: r, label: 'Vật cản' });
          }
        }
      }

      return {
        fieldWidth: cols,
        fieldHeight: rows,
        entities,
        obstacles
      };
    }

    return {
      fieldWidth: 10,
      fieldHeight: 10,
      entities: []
    };
  }, [frame.movementData, frame.grid]);

  const fieldW = movementData.fieldWidth || 10;
  const fieldH = movementData.fieldHeight || 10;
  const entities: MovingEntity[] = movementData.entities || [];
  const obstacles: Obstacle[] = movementData.obstacles || [];

  // Hướng sang góc xoay (degrees)
  const getDirectionAngle = (dir?: string) => {
    switch (dir?.toUpperCase()) {
      case 'N': case 'UP': return 0;
      case 'E': case 'RIGHT': return 90;
      case 'S': case 'DOWN': return 180;
      case 'W': case 'LEFT': return 270;
      case 'NE': return 45;
      case 'SE': return 135;
      case 'SW': return 225;
      case 'NW': return 315;
      default: return 0;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div className="w-full max-w-4xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Compass className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Di chuyển / Robot / Đối tượng chuyển động (Movement)</span>
          </div>
          <span className="text-slate-400">
            Kích thước trường: {fieldW} × {fieldH}
          </span>
        </div>

        {/* Bản đồ 2D hiển thị sân di chuyển */}
        <div className="relative w-full aspect-square max-w-[500px] bg-midnight-900/90 border-2 border-slate-700/80 rounded-2xl p-2 shadow-inner overflow-hidden">
          {/* Lưới tọa độ ngầm */}
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${fieldW}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${fieldH}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: fieldH }).map((_, r) =>
              Array.from({ length: fieldW }).map((_, c) => {
                const isObstacle = obstacles.some(obs => obs.x === c && obs.y === r);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`border border-slate-800/40 flex items-center justify-center ${
                      isObstacle ? 'bg-rose-950/70 text-rose-400 font-bold' : ''
                    }`}
                  >
                    {isObstacle && '✕'}
                  </div>
                );
              })
            )}
          </div>

          {/* Vết tích di chuyển (Trails) */}
          {entities.map(ent => {
            if (!ent.trail || ent.trail.length < 2) return null;
            return (
              <svg key={`trail-${ent.id}`} className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  points={ent.trail.map(pt => {
                    const cx = ((pt.x + 0.5) / fieldW) * 100;
                    const cy = ((pt.y + 0.5) / fieldH) * 100;
                    return `${cx}%,${cy}%`;
                  }).join(' ')}
                  fill="none"
                  stroke={ent.color || '#38bdf8'}
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.7"
                />
              </svg>
            );
          })}

          {/* Các thực thể di chuyển (Entities) */}
          {entities.map((ent) => {
            const leftPct = ((ent.x + 0.5) / fieldW) * 100;
            const topPct = ((ent.y + 0.5) / fieldH) * 100;
            const angle = getDirectionAngle(ent.direction);

            return (
              <motion.div
                key={ent.id}
                initial={false}
                animate={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  rotate: angle
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-sakura-500 text-midnight-950 flex items-center justify-center font-bold text-xl shadow-sakura-glow border-2 border-sakura-200">
                    {ent.icon || '🤖'}
                  </div>
                  {ent.direction && (
                    <Navigation className="w-4 h-4 text-white absolute -top-3 drop-shadow" />
                  )}
                </div>
                <span className="font-mono font-bold text-[10px] text-white bg-midnight-950/90 px-1.5 py-0.5 rounded mt-1 border border-slate-700 whitespace-nowrap">
                  {ent.label || ent.id} ({ent.x + indexBase}, {ent.y + indexBase})
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Bảng trạng thái di chuyển & Lệnh đang thực hiện */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-midnight-800">
          <div className="flex items-center gap-4">
            {entities.map(ent => (
              <div key={ent.id} className="flex items-center gap-2">
                <span className="text-sakura-400 font-bold">{ent.label || ent.id}:</span>
                <span className="text-slate-300">
                  Tọa độ: [{ent.x + indexBase}, {ent.y + indexBase}] | Hướng: <b className="text-white">{ent.direction || '—'}</b>
                </span>
              </div>
            ))}
          </div>
          {movementData.currentAction && (
            <div className="px-3 py-1 rounded bg-sakura-500/20 border border-sakura-400 text-sakura-300 font-bold">
              Lệnh: {movementData.currentAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
