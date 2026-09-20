import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Compass } from 'lucide-react';
import { parseElementValue } from './ArrayVisualizer';
import { Frame, VisualizationSpec, CircularData, CircularItem, CircularPointer } from '../../types';

interface CircularVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({ frame, spec }) => {
  const indexBase = spec?.indexBase ?? 1;

  const circularData: CircularData = React.useMemo(() => {
    if (frame.circularData) return frame.circularData;

    // Fallback từ frame.elements hoặc frame.nodes
    if (frame.elements && frame.elements.length > 0) {
      return {
        items: frame.elements.map((val, idx) => {
          const parsed = parseElementValue(val);
          return {
            id: `item-${idx}`,
            label: String(parsed.value ?? ''),
            value: parsed.value,
            highlight: frame.highlights?.includes(idx) || parsed.isHighlighted,
            eliminated: frame.deleted?.includes(idx)
          };
        }),
        pointers: Object.entries(frame.pointers || {}).map(([label, targetIndex]) => ({
          id: `ptr-${label}`,
          label,
          targetIndex
        }))
      };
    }

    if (frame.nodes && frame.nodes.length > 0) {
      return {
        items: frame.nodes.map((node, idx) => ({
          id: node.id,
          label: node.label || node.id,
          highlight: node.highlight
        }))
      };
    }

    return { items: [] };
  }, [frame.circularData, frame.elements, frame.nodes, frame.highlights, frame.deleted, frame.pointers]);

  const items: CircularItem[] = circularData.items || [];
  const pointers: CircularPointer[] = circularData.pointers || [];
  const count = items.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu vòng tròn để trực quan hóa.
      </div>
    );
  }

  // Bán kính vòng tròn và tâm SVG
  const radius = 160;
  const cx = 220;
  const cy = 220;
  const svgSize = 440;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div className="w-full max-w-2xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <RotateCw className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Dạng vòng tròn (Circular / Josephus / Ring Buffer)</span>
          </div>
          <span className="text-slate-400">
            Số phần tử: <b className="text-white">{count}</b>
          </span>
        </div>

        {/* Khung Vòng tròn SVG */}
        <div className="relative flex items-center justify-center">
          <svg width={svgSize} height={svgSize} className="font-mono">
            {/* Vòng tròn quỹ đạo đứt nét */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="6 6"
            />

            {/* Các kim trỏ / con trỏ từ tâm (Circular Pointers) */}
            {pointers.map((ptr, idx) => {
              const targetIdx = typeof ptr.targetIndex === 'number' ? ptr.targetIndex : 0;
              const angle = (targetIdx / count) * 2 * Math.PI - Math.PI / 2;
              const px = cx + (radius - 28) * Math.cos(angle);
              const py = cy + (radius - 28) * Math.sin(angle);

              return (
                <g key={ptr.id || `ptr-${idx}`}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={px}
                    y2={py}
                    stroke={ptr.color || '#f43f5e'}
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  <circle cx={cx} cy={cy} r="5" fill="#f43f5e" />
                  <text
                    x={cx + 35 * Math.cos(angle)}
                    y={cy + 35 * Math.sin(angle)}
                    fill="#f43f5e"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {ptr.label}
                  </text>
                </g>
              );
            })}

            {/* Các phần tử sắp xếp trên vòng tròn */}
            {items.map((item, idx) => {
              const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
              const x = cx + radius * Math.cos(angle);
              const y = cy + radius * Math.sin(angle);

              const isHl = item.highlight;
              const isEliminated = item.eliminated;

              return (
                <g key={item.id || `item-${idx}`} className="cursor-pointer">
                  {/* Vòng hào quang nếu highlight */}
                  {isHl && (
                    <circle
                      cx={x}
                      cy={y}
                      r="26"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Nút tròn chính */}
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={isEliminated ? '#450a0a' : isHl ? '#881337' : '#0f172a'}
                    stroke={isEliminated ? '#ef4444' : isHl ? '#f43f5e' : '#475569'}
                    strokeWidth={isHl ? 3 : 2}
                    strokeDasharray={isEliminated ? '3 3' : undefined}
                  />

                  {/* Chữ / Giá trị bên trong */}
                  <text
                    x={x}
                    y={y + 4}
                    fill={isEliminated ? '#f87171' : isHl ? '#fda4af' : '#f1f5f9'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {item.label}
                  </text>

                  {/* Chỉ số index ngoài vòng */}
                  <text
                    x={cx + (radius + 32) * Math.cos(angle)}
                    y={cy + (radius + 32) * Math.sin(angle) + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    [{idx + indexBase}]
                  </text>

                  {/* Dấu gạch chéo đỏ nếu đã bị loại (Eliminated) */}
                  {isEliminated && (
                    <g>
                      <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} stroke="#f43f5e" strokeWidth="2.5" />
                      <line x1={x + 12} y1={y - 12} x2={x - 12} y2={y + 12} stroke="#f43f5e" strokeWidth="2.5" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Chú thích trạng thái */}
        <div className="w-full flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-midnight-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-500" />
            <span>Còn tồn tại</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-950 border border-rose-500" />
            <span className="text-rose-400">Đang xét / Đang trỏ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-950 border border-red-500 line-through text-red-400 text-[10px] flex items-center justify-center font-bold">✕</span>
            <span className="text-red-400">Đã bị loại (Eliminated)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
