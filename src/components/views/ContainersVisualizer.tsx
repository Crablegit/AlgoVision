import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Beaker } from 'lucide-react';
import { parseElementValue } from './ArrayVisualizer';
import { Frame, VisualizationSpec, ContainersData, ContainerEntity, ContainerTransfer } from '../../types';

interface ContainersVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const ContainersVisualizer: React.FC<ContainersVisualizerProps> = ({ frame, spec }) => {
  const containersData: ContainersData = React.useMemo(() => {
    if (frame.containersData) return frame.containersData;

    // Fallback: nếu có frame.elements, xem mỗi phần tử là 1 container
    if (frame.elements && frame.elements.length > 0) {
      return {
        containers: frame.elements.map((val, idx) => {
          const parsed = parseElementValue(val);
          const numVal = typeof parsed.value === 'number' ? parsed.value : Number(parsed.value) || 1;
          return {
            id: `c-${idx}`,
            label: parsed.label || `Thùng ${idx + 1}`,
            currentAmount: numVal,
            capacity: Math.max(numVal * 1.5, 10),
            highlight: frame.highlights?.includes(idx) || parsed.isHighlighted
          };
        })
      };
    }

    return { containers: [] };
  }, [frame.containersData, frame.elements, frame.highlights]);

  const containers: ContainerEntity[] = containersData.containers || [];
  const transfers: ContainerTransfer[] = containersData.transfers || [];

  if (containers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu thùng chứa để trực quan hóa.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full p-3 select-none">
      <div className="w-full max-w-5xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Beaker className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Thùng chứa / Bình nước / Balo (Containers)</span>
          </div>
          <span className="text-slate-400">
            Số lượng: <b className="text-white">{containers.length}</b> thùng
          </span>
        </div>

        {/* Danh sách các thùng chứa */}
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8 py-4">
          {containers.map((container, idx) => {
            const isHl = container.highlight;
            const capacity = container.capacity || 100;
            const currentAmount = container.currentAmount ?? 0;
            const fillPct = Math.min(Math.max((currentAmount / capacity) * 100, 0), 100);

            const items = container.items || [];

            return (
              <div key={container.id || `c-${idx}`} className="flex flex-col items-center gap-2 w-32 sm:w-36">
                {/* Tên và Dung tích */}
                <div className="flex flex-col items-center text-center font-mono">
                  <span className="text-xs font-bold text-slate-200">
                    {container.label || `Thùng ${idx + 1}`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentAmount} / {capacity}
                  </span>
                </div>

                {/* Khung Thùng Chứa (Container Body with Liquid Fill) */}
                <div
                  className={`relative w-full h-44 sm:h-52 rounded-b-2xl border-x-4 border-b-4 border-t-0 bg-midnight-900/60 flex flex-col justify-end overflow-hidden transition-all ${
                    isHl
                      ? 'border-sakura-400 shadow-sakura-glow'
                      : 'border-slate-600 shadow-lg'
                  }`}
                >
                  {/* Mực chất lỏng / Mức đong đầy */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${fillPct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`w-full relative flex items-center justify-center transition-colors ${
                      container.liquidColor || (isHl ? 'bg-sakura-500/50' : 'bg-sky-500/40')
                    }`}
                  >
                    {/* Bọt khí / gợn sóng mặt nước */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30" />
                    {fillPct > 15 && (
                      <span className="font-mono font-extrabold text-xs text-white drop-shadow">
                        {Math.round(fillPct)}%
                      </span>
                    )}
                  </motion.div>

                  {/* Các món đồ bên trong nếu là container chứa items (như Balo/Ngăn xếp) */}
                  {items.length > 0 && (
                    <div className="absolute inset-0 flex flex-col-reverse items-center justify-start p-1.5 gap-1 overflow-y-auto z-10">
                      {items.map((it, itIdx) => (
                        <div
                          key={it.id || itIdx}
                          className="w-full text-center px-1 py-0.5 rounded bg-midnight-950/80 border border-slate-700 text-[10px] font-mono text-slate-200 truncate"
                        >
                          {it.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mô tả trạng thái bên dưới */}
                {container.status && (
                  <span className="text-[10px] font-mono text-sakura-300 font-bold text-center">
                    {container.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Thông tin chuyển đổi / rót nước (Transfers) nếu có */}
        {transfers.length > 0 && (
          <div className="mt-2 pt-3 border-t border-midnight-800 flex flex-col gap-2 text-xs font-mono">
            <span className="text-slate-400 font-bold">Thao tác chuyển / Rót:</span>
            <div className="flex flex-wrap gap-2">
              {transfers.map((tr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight-900 border border-sakura-500/40 text-sakura-300 font-bold"
                >
                  <span>{tr.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sakura-400" />
                  <span>{tr.to}</span>
                  <span className="text-slate-400 font-normal">
                    (Lượng: <b className="text-white">{tr.amount}</b>)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
