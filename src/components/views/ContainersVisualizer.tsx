import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Droplets, Package, AlertCircle, Info, Sparkles } from 'lucide-react';
import { parseElementValue } from './ArrayVisualizer';
import { Frame, VisualizationSpec, ContainersData, ContainerBox, ContainerItem, ContainerTransfer } from '../../types';

interface ContainersVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const ContainersVisualizer: React.FC<ContainersVisualizerProps> = ({ frame, spec }) => {
  const containersData: ContainersData = useMemo(() => {
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

  const rawContainers: ContainerBox[] = containersData.containers || [];
  const transfers: ContainerTransfer[] = containersData.transfers || [];

  // Tự động nhận diện chế độ hiển thị: Dạng nước (hợp nhất) hay Dạng tĩnh khối (ba lô)
  const detectedMode = useMemo<'liquid' | 'blocks'>(() => {
    if (spec?.subType === 'knapsack' || spec?.subType === 'bins' || spec?.subType === 'stack-queue') {
      return 'blocks';
    }
    // Nếu có items bên trong container -> chế độ tĩnh khối
    if (rawContainers.some(c => c.items && c.items.length > 0)) {
      return 'blocks';
    }
    const desc = (frame.description || '').toLowerCase();
    if (
      desc.includes('balo') || 
      desc.includes('ba lô') || 
      desc.includes('knapsack') || 
      desc.includes('khối lượng') || 
      desc.includes('đồ vật') ||
      desc.includes('vật phẩm')
    ) {
      return 'blocks';
    }
    return 'liquid';
  }, [spec, rawContainers, frame.description]);

  // Cho phép người dùng chuyển đổi thủ công nếu muốn
  const [visualMode, setVisualMode] = useState<'liquid' | 'blocks'>(detectedMode);

  // Cập nhật chế độ khi bài toán thay đổi
  React.useEffect(() => {
    setVisualMode(detectedMode);
  }, [detectedMode]);

  // Bảng màu cho các khối vật phẩm (dạng tĩnh khối)
  const blockColors = [
    { bg: 'bg-emerald-500/80', border: 'border-emerald-400', text: 'text-emerald-100', shadow: 'shadow-emerald-500/30' },
    { bg: 'bg-amber-500/80', border: 'border-amber-400', text: 'text-amber-100', shadow: 'shadow-amber-500/30' },
    { bg: 'bg-purple-500/80', border: 'border-purple-400', text: 'text-purple-100', shadow: 'shadow-purple-500/30' },
    { bg: 'bg-rose-500/80', border: 'border-rose-400', text: 'text-rose-100', shadow: 'shadow-rose-500/30' },
    { bg: 'bg-sky-500/80', border: 'border-sky-400', text: 'text-sky-100', shadow: 'shadow-sky-500/30' },
    { bg: 'bg-indigo-500/80', border: 'border-indigo-400', text: 'text-indigo-100', shadow: 'shadow-indigo-500/30' }
  ];

  if (rawContainers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu thùng chứa / ba lô để trực quan hóa.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full p-3 select-none">
      <div className="w-full max-w-5xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Header & Mode Switch */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono gap-3">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            {visualMode === 'liquid' ? (
              <Droplets className="w-4 h-4 text-sky-400 animate-pulse" />
            ) : (
              <Package className="w-4 h-4 text-amber-400 animate-bounce" />
            )}
            <span>
              {visualMode === 'liquid'
                ? 'Trực quan hóa Dạng nước / Bể chứa / Hồ nước (Chất lỏng hợp nhất)'
                : 'Trực quan hóa Ba lô / Khối lượng / Vật phẩm (Tĩnh khối)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Dạng hợp nhất / Dạng tĩnh khối */}
            <div className="flex items-center p-1 rounded-xl bg-midnight-900 border border-slate-700 text-[11px] font-mono">
              <button
                onClick={() => setVisualMode('liquid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  visualMode === 'liquid'
                    ? 'bg-sky-500 text-midnight-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Droplets className="w-3 h-3" />
                <span>Dạng nước (Hợp nhất)</span>
              </button>

              <button
                onClick={() => setVisualMode('blocks')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  visualMode === 'blocks'
                    ? 'bg-amber-500 text-midnight-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3 h-3" />
                <span>Dạng tĩnh khối (Ba lô)</span>
              </button>
            </div>

            <span className="text-slate-400 hidden md:inline">
              Số lượng: <b className="text-white">{rawContainers.length}</b>
            </span>
          </div>
        </div>

        {/* Danh sách các Thùng / Hồ / Ba lô */}
        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8 py-6">
          {rawContainers.map((container, idx) => {
            const isHl = container.highlight;
            const capacity = container.capacity || 100;
            const currentAmount = container.currentAmount ?? 0;
            const fillPct = Math.min(Math.max((currentAmount / capacity) * 100, 0), 100);
            const isOverflow = container.isOverflow || currentAmount > capacity;

            // Vật phẩm bên trong nếu ở chế độ tĩnh khối
            let items: ContainerItem[] = container.items || [];
            // Nếu không có items nhưng đang ở chế độ tĩnh khối và có currentAmount > 0:
            // Tự động phân rã thành các khối mẫu đại diện
            if (items.length === 0 && visualMode === 'blocks' && currentAmount > 0) {
              items = [
                {
                  id: `it-${container.id}-1`,
                  label: `Vật phẩm (${currentAmount}kg)`,
                  weight: currentAmount,
                  value: currentAmount
                }
              ];
            }

            return (
              <div key={container.id || `c-${idx}`} className="flex flex-col items-center gap-2.5 w-32 sm:w-36 relative">
                {/* Tên và Dung tích / Đường kính */}
                <div className="flex flex-col items-center text-center font-mono">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {visualMode === 'liquid' ? (
                      <Droplets className="w-3 h-3 text-sky-400" />
                    ) : (
                      <Package className="w-3 h-3 text-amber-400" />
                    )}
                    {container.label || `Hồ ${idx + 1}`}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {currentAmount} / {capacity} {visualMode === 'liquid' ? 'L' : 'kg'}
                  </span>
                  {container.diameter && (
                    <span className="text-[10px] text-slate-400">
                      Đường kính: D = {container.diameter}
                    </span>
                  )}
                </div>

                {/* KHUNG CHỨA (Container Body) */}
                <div className="relative w-full">
                  {/* HIỆU ỨNG RÓT NƯỚC TỪ TRÊN XUỐNG (Dạng nước khi được Highlight/Rót) */}
                  {visualMode === 'liquid' && isHl && currentAmount > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-3 h-8 z-30 pointer-events-none flex flex-col items-center">
                      {/* Dòng nước chảy xuống */}
                      <motion.div
                        animate={{ opacity: [0.6, 1, 0.6], height: ['0%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="w-2 h-full bg-gradient-to-b from-sky-300 via-cyan-400 to-sky-500 rounded-full shadow-lg shadow-sky-400/50"
                      />
                    </div>
                  )}

                  {/* THÂN THÙNG / BỂ CHỨA / BA LÔ */}
                  <div
                    className={`relative w-full h-48 sm:h-56 rounded-b-2xl border-x-4 border-b-4 border-t-2 bg-midnight-900/70 flex flex-col justify-end overflow-hidden transition-all ${
                      isHl
                        ? 'border-sakura-400 shadow-sakura-glow ring-2 ring-sakura-400/30'
                        : visualMode === 'liquid'
                        ? 'border-sky-600/70 shadow-lg'
                        : 'border-amber-600/70 shadow-lg'
                    }`}
                  >
                    {/* Vạch chia dung tích (Graduation marks) */}
                    <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none opacity-25 z-20">
                      <div className="w-3 border-t border-white text-[8px] font-mono">100%</div>
                      <div className="w-2 border-t border-white text-[8px] font-mono">75%</div>
                      <div className="w-3 border-t border-white text-[8px] font-mono">50%</div>
                      <div className="w-2 border-t border-white text-[8px] font-mono">25%</div>
                    </div>

                    {/* ================= 1. DẠNG HỢP NHẤT NHƯ NƯỚC (LIQUID) ================= */}
                    {visualMode === 'liquid' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${fillPct}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                        className={`w-full relative flex flex-col items-center justify-center overflow-hidden transition-all ${
                          container.liquidColor ||
                          (isHl
                            ? 'bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-300'
                            : 'bg-gradient-to-t from-sky-700 via-sky-600 to-cyan-400')
                        }`}
                      >
                        {/* Mặt nước với gợn sóng lấp lánh */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 shadow-sm animate-pulse" />

                        {/* Bọt khí nước */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />

                        {/* Hiển thị số lượng & % trực tiếp trên mặt nước */}
                        {fillPct > 15 && (
                          <span className="font-mono font-black text-xs text-white drop-shadow-md z-10">
                            {currentAmount}L ({Math.round(fillPct)}%)
                          </span>
                        )}
                      </motion.div>
                    )}

                    {/* ================= 2. DẠNG TĨNH KHỐI (BLOCKS / KNAPSACK) ================= */}
                    {visualMode === 'blocks' && (
                      <div className="w-full h-full flex flex-col-reverse justify-start p-1.5 gap-1.5 overflow-y-auto z-10">
                        {items.length > 0 ? (
                          items.map((it, itIdx) => {
                            const colorScheme = blockColors[itIdx % blockColors.length];
                            const itWeight = it.weight ?? 1;
                            const blockHeightPct = Math.max(20, Math.min(60, (itWeight / capacity) * 100));

                            return (
                              <motion.div
                                key={it.id || itIdx}
                                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className={`w-full rounded-lg border-2 p-1 flex flex-col items-center justify-center shadow-md font-mono ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} ${colorScheme.shadow}`}
                                style={{ minHeight: `${blockHeightPct}%` }}
                              >
                                <div className="flex items-center gap-1 font-bold text-[11px] truncate max-w-full">
                                  <span>📦</span>
                                  <span className="truncate">{it.label || `Món ${itIdx + 1}`}</span>
                                </div>
                                {(it.weight !== undefined || it.value !== undefined) && (
                                  <div className="text-[9px] font-bold opacity-90">
                                    {it.weight !== undefined && `W:${it.weight}`}
                                    {it.value !== undefined && ` • V:${it.value}`}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px] italic border-2 border-dashed border-slate-700/50 rounded-xl p-2 text-center">
                            Trống (Chưa có đồ)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* HIỆU ỨNG TRÀN NƯỚC (KHI NƯỚC TRÀN XUỐNG HỒ DƯỚI) */}
                  {visualMode === 'liquid' && isOverflow && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none">
                      <motion.div
                        animate={{ height: ['0px', '24px'], opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80"
                      />
                      <span className="text-[9px] font-bold font-mono text-cyan-300 bg-midnight-950 px-1 rounded border border-cyan-500/50">
                        Tràn nước ↓
                      </span>
                    </div>
                  )}
                </div>

                {/* Mô tả trạng thái bên dưới */}
                {container.status && (
                  <span className="text-[10px] font-mono text-sakura-300 font-bold text-center px-1.5 py-0.5 rounded bg-midnight-900 border border-slate-700">
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
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sakura-400" />
              Thao tác Rót nước / Chuyển đồ (Transfers):
            </span>
            <div className="flex flex-wrap gap-2">
              {transfers.map((tr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-900 border border-sakura-500/40 text-sakura-300 font-bold shadow-md"
                >
                  <span className="text-white">{tr.from || tr.fromContainer}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sakura-400 animate-pulse" />
                  <span className="text-white">{tr.to || tr.toContainer}</span>
                  <span className="text-slate-400 font-normal">
                    (Lượng: <b className="text-cyan-300">{tr.amount}</b> {visualMode === 'liquid' ? 'L' : 'kg'})
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
