import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowUp, RotateCcw, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { Frame, VisualizationSpec, BuildingData, BuildingFloor, ElevatorButton } from '../../types';

interface BuildingVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const BuildingVisualizer: React.FC<BuildingVisualizerProps> = ({ frame, spec }) => {
  // Trích xuất hoặc phục hồi BuildingData
  const buildingData: BuildingData = React.useMemo(() => {
    if (frame.buildingData) return frame.buildingData;

    // Phục hồi từ variables nếu có
    const vars = frame.variables || {};
    let totalFloors = Number(vars['tổng_số_tầng'] || vars['chiều_cao_H'] || vars['h'] || 15);
    let currentFloor = Number(vars['tầng_hiện_tại'] || vars['current_floor'] || 1);
    let visited: number[] = [];

    if (Array.isArray(vars['tầng_đã_đến'])) {
      visited = vars['tầng_đã_đến'].map(Number);
    } else if (typeof vars['tầng_đã_đến'] === 'string') {
      const matches = vars['tầng_đã_đến'].match(/\d+/g);
      if (matches) visited = matches.map(Number);
    }

    if (visited.length === 0) {
      visited = [currentFloor];
    }

    return {
      totalFloors: Math.max(totalFloors, 1),
      minFloor: 1,
      currentFloor,
      visitedFloors: visited,
      totalReached: visited.length
    };
  }, [frame.buildingData, frame.variables]);

  const totalFloors = Math.max(buildingData.totalFloors || 15, 1);
  const minFloor = buildingData.minFloor ?? 1;
  const currentFloor = buildingData.currentFloor ?? 1;
  const visitedSet = React.useMemo(() => {
    return new Set(buildingData.visitedFloors || [currentFloor]);
  }, [buildingData.visitedFloors, currentFloor]);

  const buttons: ElevatorButton[] = buildingData.buttons || [];
  const elevator = buildingData.elevator || {
    currentFloor,
    status: 'idle'
  };

  // Tạo danh sách các tầng từ trên xuống dưới (tầng cao nhất ở trên cùng)
  const floorList = React.useMemo(() => {
    const list: BuildingFloor[] = [];
    for (let f = totalFloors; f >= minFloor; f--) {
      list.push({
        floor: f,
        label: `Tầng ${f}`,
        isVisited: visitedSet.has(f),
        isCurrent: f === currentFloor
      });
    }
    return list;
  }, [totalFloors, minFloor, visitedSet, currentFloor]);

  // Tính toán chiều cao hợp lý của từng tầng trong tháp
  // Nếu số tầng ít (<= 15): hiển thị thoải mái từng tầng (cao 26px - 32px)
  // Nếu số tầng nhiều (> 20): co dãn vừa vặn hoặc hỗ trợ scroll
  const floorHeightClass = totalFloors <= 12 ? 'h-9' : totalFloors <= 20 ? 'h-7' : 'h-6';

  // Tỷ lệ độ cao hiện tại của thang máy (0% ở đáy tầng 1, 100% ở tầng h)
  const elevatorRatio = totalFloors > 1 ? ((currentFloor - minFloor) / (totalFloors - minFloor)) * 100 : 100;

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full p-2 sm:p-4 select-none">
      <div className="w-full max-w-5xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
        {/* 1. Header thông tin tòa nhà */}
        <div className="flex flex-wrap items-center justify-between border-b border-midnight-800 pb-3 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Building2 className="w-4 h-4 text-sakura-400" />
            <span className="text-sm">Trực quan hóa Tòa nhà & Thang máy (Building Shaft)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Tổng số tầng: <b className="text-white">{totalFloors}</b>
            </span>
            <span className="text-slate-400">
              Đã đến: <b className="text-emerald-400">{visitedSet.size}</b> / {totalFloors} tầng ({Math.round((visitedSet.size / totalFloors) * 100)}%)
            </span>
          </div>
        </div>

        {/* 2. Khu vực hiển thị chính: Tháp tòa nhà + Bảng điều khiển nút bấm */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Cột 1: Tháp Tòa Nhà (Building Tower) - 8/12 cols */}
          <div className="md:col-span-8 flex flex-col items-center bg-midnight-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            {/* Tiêu đề tháp & Trục tỷ lệ độ cao */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-2">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-sakura-400" />
                Giếng Thang Máy & Các Tầng
              </span>
              <span>Độ cao hiện tại: <b className="text-sakura-300">Tầng {currentFloor}</b> ({Math.round(elevatorRatio)}%)</span>
            </div>

            {/* Khung Tòa nhà (Building Frame) */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-4">
              {/* Thước đo tỷ lệ độ cao (Ruler bên trái) */}
              <div className="flex flex-col justify-between h-[360px] sm:h-[420px] text-[10px] font-mono text-slate-500 py-1 pr-1 border-r border-slate-800">
                <div className="flex items-center gap-1">
                  <span>100%</span>
                  <div className="w-2 h-px bg-slate-700" />
                </div>
                <div className="flex items-center gap-1">
                  <span>75%</span>
                  <div className="w-1.5 h-px bg-slate-700" />
                </div>
                <div className="flex items-center gap-1">
                  <span>50%</span>
                  <div className="w-2 h-px bg-slate-700" />
                </div>
                <div className="flex items-center gap-1">
                  <span>25%</span>
                  <div className="w-1.5 h-px bg-slate-700" />
                </div>
                <div className="flex items-center gap-1">
                  <span>0%</span>
                  <div className="w-2 h-px bg-slate-700" />
                </div>
              </div>

              {/* Thân tòa nhà có các tầng xếp chồng */}
              <div className="flex-1 max-w-lg h-[360px] sm:h-[420px] overflow-y-auto rounded-xl border-2 border-slate-700 bg-midnight-950/80 p-2 flex flex-col gap-1 relative shadow-inner">
                {floorList.map((fl) => {
                  const isCurrent = fl.isCurrent;
                  const isVisited = fl.isVisited;

                  let rowStyle = "border-slate-800/80 bg-midnight-900/40 text-slate-400";
                  if (isCurrent) {
                    rowStyle = "border-sakura-400 bg-sakura-500/20 text-sakura-200 shadow-sakura-glow font-bold";
                  } else if (isVisited) {
                    rowStyle = "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-semibold";
                  }

                  return (
                    <motion.div
                      key={fl.floor}
                      layout
                      className={`w-full ${floorHeightClass} px-3 rounded-lg border flex items-center justify-between text-xs font-mono transition-all ${rowStyle}`}
                    >
                      {/* Tên tầng & Đèn báo */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrent
                              ? 'bg-sakura-400 animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                              : isVisited
                              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                              : 'bg-slate-700'
                          }`}
                        />
                        <span className={isCurrent ? 'text-white font-bold' : ''}>
                          {fl.label}
                        </span>
                      </div>

                      {/* Trạng thái tầng */}
                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-sakura-500 text-midnight-950 font-extrabold text-[10px] shadow-sm animate-bounce">
                            🛗 Thang máy đang ở đây
                          </span>
                        )}
                        {!isCurrent && isVisited && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Đã đến
                          </span>
                        )}
                        {!isCurrent && !isVisited && (
                          <span className="text-[10px] text-slate-600">
                            Chưa tới
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Chân tòa nhà (Ground level) */}
            <div className="w-full max-w-lg mt-2 pt-2 border-t-2 border-slate-700 flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
              <span className="text-slate-500">Mặt đất (Tầng 1 - Khởi đầu)</span>
              <span className="text-slate-400">Tầng thượng (Tầng {totalFloors})</span>
            </div>
          </div>

          {/* Cột 2: Bảng Điều Khiển Nút Bấm & Thống kê - 4/12 cols */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {/* Bảng Nút Bấm Thang Máy */}
            <div className="bg-midnight-900/70 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-sakura-400" />
                Bảng Nút Bấm Thang Máy
              </span>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {buttons.length > 0 ? (
                  buttons.map((btn, bIdx) => {
                    const isActive = btn.isActive;
                    const isReset = btn.type === 'reset';

                    return (
                      <div
                        key={bIdx}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center font-mono transition-all ${
                          isActive
                            ? 'bg-sakura-500/20 border-sakura-400 text-sakura-300 shadow-sakura-glow font-bold scale-105'
                            : isReset
                            ? 'bg-midnight-950 border-slate-700 text-slate-300 hover:border-slate-500'
                            : 'bg-midnight-950 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {isReset ? (
                          <RotateCcw className={`w-4 h-4 ${isActive ? 'text-sakura-400 animate-spin' : 'text-slate-400'}`} />
                        ) : (
                          <ArrowUp className={`w-4 h-4 ${isActive ? 'text-sakura-400 animate-bounce' : 'text-slate-400'}`} />
                        )}
                        <span className="text-xs font-bold">{btn.label}</span>
                        <span className="text-[9px] text-slate-500">
                          {isReset ? 'Về tầng 1' : `+${btn.step} tầng`}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  // Nút mặc định nếu không có buttons trong data
                  <>
                    <div className="p-2.5 rounded-xl border border-slate-700 bg-midnight-950 flex flex-col items-center text-center font-mono">
                      <ArrowUp className="w-4 h-4 text-sakura-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">Nút 1 (+a)</span>
                      <span className="text-[9px] text-slate-400">Lên a tầng</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-700 bg-midnight-950 flex flex-col items-center text-center font-mono">
                      <ArrowUp className="w-4 h-4 text-sakura-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">Nút 2 (+b)</span>
                      <span className="text-[9px] text-slate-400">Lên b tầng</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-700 bg-midnight-950 flex flex-col items-center text-center font-mono">
                      <ArrowUp className="w-4 h-4 text-sakura-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">Nút 3 (+c)</span>
                      <span className="text-[9px] text-slate-400">Lên c tầng</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-700 bg-midnight-950 flex flex-col items-center text-center font-mono">
                      <RotateCcw className="w-4 h-4 text-amber-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">Nút 4 (Reset)</span>
                      <span className="text-[9px] text-slate-400">Về tầng 1</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Danh sách các tầng đã đến */}
            <div className="bg-midnight-900/70 border border-slate-700/60 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300">Tập các tầng đã đến:</span>
                <span className="text-emerald-400 font-bold">{visitedSet.size} tầng</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {Array.from(visitedSet)
                  .sort((a, b) => a - b)
                  .map((fl) => (
                    <span
                      key={fl}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        fl === currentFloor
                          ? 'bg-sakura-500 text-midnight-950 shadow-sm'
                          : 'bg-midnight-950 border border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      T{fl}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
