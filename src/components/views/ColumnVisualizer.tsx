import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowDown, Droplets } from 'lucide-react';
import { Frame, VisualizationSpec, ColumnData, ColumnItem } from '../../types';
import { parseElementValue } from './ArrayVisualizer';

interface ColumnVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const ColumnVisualizer: React.FC<ColumnVisualizerProps> = ({ frame, spec }) => {
  // Trích xuất hoặc chuyển đổi sang ColumnData
  const columnData: ColumnData = React.useMemo(() => {
    if (frame.columnData && frame.columnData.columns && frame.columnData.columns.length > 0) {
      return frame.columnData;
    }

    // Chuyển đổi từ frame.elements nếu có
    if (frame.elements && frame.elements.length > 0) {
      const heights = frame.elements.map((el) => {
        const parsed = parseElementValue(el);
        const num = typeof parsed.value === 'number' ? parsed.value : Number(parsed.value) || 0;
        return num;
      });

      const maxH = Math.max(...heights, 1);

      const cols: ColumnItem[] = frame.elements.map((el, idx) => {
        const parsed = parseElementValue(el);
        const num = heights[idx];
        const isHl = frame.highlights?.includes(idx) || parsed.isHighlighted === true;

        // Trích xuất waterHeight từ variables nếu có (Trapping Rain Water)
        let waterHeight: number | undefined = undefined;
        if (frame.variables) {
          const waterArr = frame.variables['nước_đọng'] || frame.variables['trapped_water'] || frame.variables['water'];
          if (Array.isArray(waterArr) && waterArr[idx] !== undefined) {
            waterHeight = Number(waterArr[idx]);
          }
        }

        return {
          id: `col-${idx}`,
          height: num,
          maxHeight: maxH,
          label: parsed.label || `[${idx}]`,
          subLabel: `h = ${num}`,
          highlight: isHl,
          color: parsed.color,
          waterHeight
        };
      });

      return {
        columns: cols,
        maxHeight: maxH,
        pointers: frame.pointers
      };
    }

    return { columns: [] };
  }, [frame.columnData, frame.elements, frame.highlights, frame.pointers, frame.variables]);

  const columns = columnData.columns || [];
  const count = columns.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu cột / thanh đứng để trực quan hóa.
      </div>
    );
  }

  // Tìm chiều cao lớn nhất (kèm cả nước đọng nếu có) để tỷ lệ chuẩn xác tuyệt đối
  const maxColumnHeight = React.useMemo(() => {
    let max = columnData.maxHeight || 1;
    for (const c of columns) {
      const totalH = c.height + (c.waterHeight || 0);
      if (totalH > max) max = totalH;
    }
    return Math.max(max, 1);
  }, [columns, columnData.maxHeight]);

  // Chiều cao khung vẽ thanh đứng (px)
  const MAX_CANVAS_HEIGHT = 260; // px

  // Tính toán chiều rộng (w) và khoảng cách (gap) của từng cột để đảm bảo:
  // - Khi số cột ít: không bị biến thành que mỏng, có độ dày đầm chắc (52px - 76px)
  // - Khi số cột nhiều: tự động co lại vừa vặn (14px - 28px) không tràn khung
  let colWidthClass = "w-16 sm:w-20"; // mặc định N <= 4
  let colGapClass = "gap-4 sm:gap-6";
  let labelSizeClass = "text-xs sm:text-sm font-bold";
  let subLabelSizeClass = "text-[11px] sm:text-xs";
  let ptrArrowClass = "w-4 h-4";
  let ptrBadgeClass = "text-xs px-2.5 py-0.5";

  if (count > 25) {
    colWidthClass = "w-3 sm:w-4 min-w-[12px]";
    colGapClass = "gap-1";
    labelSizeClass = "text-[8px]";
    subLabelSizeClass = "text-[7px]";
    ptrArrowClass = "w-2.5 h-2.5";
    ptrBadgeClass = "text-[8px] px-1 py-0.2";
  } else if (count > 16) {
    colWidthClass = "w-5 sm:w-7 min-w-[20px]";
    colGapClass = "gap-1.5 sm:gap-2";
    labelSizeClass = "text-[9px] sm:text-[10px]";
    subLabelSizeClass = "text-[8px] sm:text-[9px]";
    ptrArrowClass = "w-3 h-3";
    ptrBadgeClass = "text-[9px] px-1.5 py-0.5";
  } else if (count > 10) {
    colWidthClass = "w-8 sm:w-11 min-w-[32px]";
    colGapClass = "gap-2 sm:gap-3";
    labelSizeClass = "text-[10px] sm:text-xs";
    subLabelSizeClass = "text-[9px] sm:text-[10px]";
    ptrArrowClass = "w-3.5 h-3.5";
    ptrBadgeClass = "text-[10px] px-2 py-0.5";
  } else if (count > 5) {
    colWidthClass = "w-12 sm:w-14 min-w-[44px]";
    colGapClass = "gap-3 sm:gap-4";
    labelSizeClass = "text-xs font-bold";
    subLabelSizeClass = "text-[10px] sm:text-xs";
    ptrArrowClass = "w-3.5 h-3.5";
    ptrBadgeClass = "text-xs px-2 py-0.5";
  }

  // Tính tổng nước đọng nếu có
  const totalWater = React.useMemo(() => {
    return columns.reduce((acc, c) => acc + (c.waterHeight || 0), 0);
  }, [columns]);

  const pointers = columnData.pointers || frame.pointers || {};
  const getPointersForIndex = (index: number): string[] => {
    const matched: string[] = [];
    for (const [pName, pIdx] of Object.entries(pointers)) {
      if (pIdx === index) matched.push(pName);
    }
    return matched;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full p-2 sm:p-4 select-none">
      <div className="w-full max-w-5xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-midnight-800 pb-3 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <BarChart3 className="w-4 h-4 text-sakura-400" />
            <span className="text-sm">Trực quan hóa Tỷ lệ Độ cao Cột (Column Height Ratio)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Số lượng cột: <b className="text-white">{count}</b>
            </span>
            <span className="text-slate-400">
              Độ cao lớn nhất: <b className="text-sakura-300">{maxColumnHeight}</b>
            </span>
            {totalWater > 0 && (
              <span className="flex items-center gap-1 text-cyan-400 font-bold bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-500/40">
                <Droplets className="w-3.5 h-3.5" />
                Tổng nước đọng: {totalWater}
              </span>
            )}
          </div>
        </div>

        {/* Khung vẽ các cột (Columns Stage with Y-Axis and Gridlines) */}
        <div className="relative w-full flex items-end justify-center pt-8 pb-4 px-2 sm:px-6 bg-midnight-900/40 rounded-xl border border-midnight-800/80 overflow-x-auto min-h-[340px]">
          {/* Lưới tọa độ độ cao (Horizontal Gridlines) */}
          <div className="absolute inset-x-4 top-8 bottom-12 flex flex-col justify-between pointer-events-none z-0">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
              const val = Math.round(maxColumnHeight * ratio * 10) / 10;
              return (
                <div key={ratio} className="w-full flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-600 w-8 text-right shrink-0">
                    {val}
                  </span>
                  <div className="w-full h-px border-b border-dashed border-slate-800/80" />
                </div>
              );
            })}
          </div>

          {/* Danh sách các cột đứng */}
          <div className={`flex items-end justify-center ${colGapClass} relative z-10 pl-10 pr-4`}>
            {columns.map((col, idx) => {
              const h = col.height;
              const waterH = col.waterHeight || 0;
              const isHl = col.highlight;
              const colPointers = getPointersForIndex(idx);

              // Tỷ lệ chiều cao toán học
              const heightRatio = h / maxColumnHeight;
              const barHeightPx = Math.max(heightRatio * MAX_CANVAS_HEIGHT, h > 0 ? 8 : 2);

              // Chiều cao lớp nước đọng theo tỷ lệ
              const waterRatio = waterH / maxColumnHeight;
              const waterHeightPx = waterRatio * MAX_CANVAS_HEIGHT;

              let barBg = "bg-slate-700/80 border-slate-500/60";
              let barGlow = "";

              if (isHl) {
                barBg = "bg-gradient-to-t from-sakura-600 to-sakura-400 border-sakura-300";
                barGlow = "shadow-sakura-glow";
              } else if (col.status === 'peak') {
                barBg = "bg-gradient-to-t from-amber-600 to-amber-400 border-amber-300";
                barGlow = "shadow-[0_0_12px_rgba(251,191,36,0.4)]";
              } else if (col.color) {
                barBg = col.color;
              } else {
                barBg = "bg-gradient-to-t from-midnight-900 to-midnight-800 border-slate-600/80";
              }

              return (
                <div
                  key={col.id || idx}
                  className={`flex flex-col items-center justify-end ${colWidthClass} shrink-0`}
                >
                  {/* Nhãn chiều cao phía trên cột */}
                  <div className="flex flex-col items-center mb-1 text-center font-mono">
                    <span className={`${labelSizeClass} ${isHl ? 'text-sakura-300 font-extrabold' : 'text-slate-300'}`}>
                      {h}
                    </span>
                    {waterH > 0 && (
                      <span className="text-[10px] text-cyan-400 font-bold flex items-center">
                        +{waterH}💧
                      </span>
                    )}
                  </div>

                  {/* Lớp Nước Đọng (Trapping Rain Water Layer) */}
                  {waterH > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: waterHeightPx }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="w-full rounded-t-md bg-cyan-500/40 border-t-2 border-x border-cyan-400/80 shadow-[0_0_14px_rgba(6,182,212,0.4)] relative flex items-center justify-center overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-200/50" />
                    </motion.div>
                  )}

                  {/* Cột chính (Solid Pillar Bar) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeightPx }}
                    transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                    className={`w-full ${waterH > 0 ? 'rounded-b-lg' : 'rounded-t-lg rounded-b-sm'} border-2 transition-all flex flex-col justify-end items-center p-1 ${barBg} ${barGlow}`}
                  >
                    {/* Đường vân / gờ nổi trên thân cột */}
                    <div className="w-full h-1 bg-white/10 rounded-full mb-1" />
                  </motion.div>

                  {/* Nhãn chỉ số cột bên dưới (Index) */}
                  <div className="mt-1.5 flex flex-col items-center font-mono">
                    <span className={`${subLabelSizeClass} ${isHl ? 'text-sakura-300 font-bold' : 'text-slate-500'}`}>
                      {col.label || `[${idx}]`}
                    </span>
                  </div>

                  {/* Con trỏ (Pointers: L, R, i...) */}
                  <div className="min-h-[30px] flex flex-col items-center gap-0.5 mt-0.5">
                    {colPointers.map((pName) => (
                      <motion.div
                        key={pName}
                        initial={{ y: -4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <ArrowDown className={`${ptrArrowClass} text-sakura-400 animate-bounce -mb-0.5`} />
                        <span className={`${ptrBadgeClass} font-mono font-bold rounded bg-sakura-500 text-midnight-950 shadow-sm`}>
                          {pName}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung hiển thị công thức / diện tích chữ nhật nếu có */}
        {columnData.highlightRange && (
          <div className="p-3 rounded-xl bg-midnight-900 border border-sakura-500/40 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Vùng hình chữ nhật: từ cột <b>{columnData.highlightRange.start}</b> đến <b>{columnData.highlightRange.end}</b>
            </span>
            {columnData.highlightRange.area !== undefined && (
              <span className="text-sakura-300 font-bold text-sm">
                Diện tích lớn nhất: {columnData.highlightRange.area}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
