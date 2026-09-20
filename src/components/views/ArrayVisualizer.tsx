import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Frame } from '../../types';

interface ArrayVisualizerProps {
  frame: Frame;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ frame }) => {
  const elements = frame.elements || [];
  const highlights = frame.highlights || [];
  const pointers = frame.pointers || {};
  const status = frame.status || 'normal';

  // Lọc bỏ con trỏ thừa (đặc biệt là 'left' / 'right' tự sinh khi đề bài không hề dùng đến con trỏ)
  const validPointers = React.useMemo(() => {
    const result: Record<string, number> = {};
    const desc = (frame.description || '').toLowerCase();
    const mentionsPointer = 
      desc.includes('con trỏ') || 
      desc.includes('pointer') || 
      desc.includes('left') || 
      desc.includes('right') || 
      desc.includes('hai đầu') ||
      desc.includes('chỉ số l') ||
      desc.includes('chỉ số r') ||
      desc.includes(' l ') ||
      desc.includes(' r ');

    for (const [pName, pIdx] of Object.entries(pointers)) {
      const pLower = pName.toLowerCase();
      // Nếu là left hoặc right nhưng trong mô tả bước không hề nói đến con trỏ thì bỏ qua
      if ((pLower === 'left' || pLower === 'right') && !mentionsPointer) {
        continue;
      }
      result[pName] = pIdx;
    }
    return result;
  }, [pointers, frame.description]);

  const getPointersForIndex = (index: number): string[] => {
    const matched: string[] = [];
    for (const [pName, pIdx] of Object.entries(validPointers)) {
      if (pIdx === index) matched.push(pName);
    }
    return matched;
  };

  if (elements.length === 0) return null;

  const count = elements.length;

  // Thu phóng linh hoạt kích thước các ô và khoảng cách dựa trên số phần tử để luôn hiển thị vừa vặn, dễ nhìn
  let boxSizeClass = "w-14 h-16 sm:w-16 sm:h-20 text-lg sm:text-xl rounded-xl";
  let gapClass = "gap-3 sm:gap-4";
  let indexSizeClass = "text-[10px] sm:text-xs";
  let ptrBadgeClass = "text-[10px] px-2 py-0.5";
  let ptrArrowClass = "w-3.5 h-3.5";

  if (count > 24) {
    boxSizeClass = "w-7 h-9 sm:w-8 sm:h-10 text-xs sm:text-sm rounded-md";
    gapClass = "gap-1 sm:gap-1.5";
    indexSizeClass = "text-[8px] sm:text-[9px]";
    ptrBadgeClass = "text-[8px] px-1 py-0.2";
    ptrArrowClass = "w-2.5 h-2.5";
  } else if (count > 16) {
    boxSizeClass = "w-8 h-10 sm:w-10 sm:h-12 text-xs sm:text-sm rounded-lg";
    gapClass = "gap-1.5 sm:gap-2";
    indexSizeClass = "text-[9px] sm:text-[10px]";
    ptrBadgeClass = "text-[8px] px-1.5 py-0.5";
    ptrArrowClass = "w-3 h-3";
  } else if (count > 10) {
    boxSizeClass = "w-10 h-13 sm:w-12 sm:h-15 text-sm sm:text-base rounded-lg";
    gapClass = "gap-2 sm:gap-2.5";
    indexSizeClass = "text-[10px]";
    ptrBadgeClass = "text-[9px] px-1.5 py-0.5";
    ptrArrowClass = "w-3 h-3";
  } else if (count > 6) {
    boxSizeClass = "w-12 h-14 sm:w-14 sm:h-17 text-base sm:text-lg rounded-xl";
    gapClass = "gap-2.5 sm:gap-3";
    indexSizeClass = "text-[10px] sm:text-xs";
    ptrBadgeClass = "text-[10px] px-2 py-0.5";
    ptrArrowClass = "w-3.5 h-3.5";
  }

  return (
    <div className={`flex items-end justify-center ${gapClass} py-6 w-full max-w-full overflow-x-auto select-none`}>
      <AnimatePresence mode="popLayout">
        {elements.map((val, idx) => {
          const isHighlighted = highlights.includes(idx);
          const elementPointers = getPointersForIndex(idx);

          let blockStyle = "bg-midnight-900 border border-midnight-700 text-slate-200";
          let glowEffect = "";

          if (isHighlighted) {
            if (status === 'found' || status === 'done') {
              blockStyle = "bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300";
              glowEffect = "shadow-[0_0_15px_rgba(52,211,153,0.5)]";
            } else if (status === 'swapping') {
              blockStyle = "bg-rose-950/80 border-2 border-rose-400 text-rose-300";
              glowEffect = "shadow-[0_0_15px_rgba(251,113,133,0.5)]";
            } else {
              blockStyle = "bg-sakura-500/20 border-2 border-sakura-400 text-sakura-300";
              glowEffect = "shadow-sakura-glow";
            }
          }

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
              <span className={`${indexSizeClass} font-mono text-slate-500 font-bold`}>
                [{idx}]
              </span>

              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isHighlighted ? 1.08 : 1,
                  opacity: 1,
                  y: isHighlighted ? -4 : 0
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`${boxSizeClass} flex items-center justify-center font-mono font-bold select-none transition-all ${blockStyle} ${glowEffect}`}
              >
                {val}
              </motion.div>

              <div className="min-h-[36px] sm:min-h-[44px] flex flex-col items-center gap-1">
                {elementPointers.map((pName) => (
                  <motion.div
                    key={pName}
                    layoutId={`ptr-${pName}`}
                    initial={{ y: -4, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <ArrowDown className={`${ptrArrowClass} text-sakura-400 -mb-1 animate-bounce`} />
                    <span className={`${ptrBadgeClass} font-mono font-bold rounded bg-sakura-500 text-midnight-950 shadow-sm`}>
                      {pName}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
