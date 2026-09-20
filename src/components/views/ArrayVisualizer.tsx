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

  const getPointersForIndex = (index: number): string[] => {
    const matched: string[] = [];
    for (const [pName, pIdx] of Object.entries(pointers)) {
      if (pIdx === index) matched.push(pName);
    }
    return matched;
  };

  if (elements.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4 py-6 min-w-max overflow-x-auto">
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
            <div key={idx} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 font-bold">
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
                className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center font-mono font-bold text-lg sm:text-xl select-none transition-all ${blockStyle} ${glowEffect}`}
              >
                {val}
              </motion.div>

              <div className="min-h-[46px] flex flex-col items-center gap-1">
                {elementPointers.map((pName) => (
                  <motion.div
                    key={pName}
                    layoutId={`ptr-${pName}`}
                    initial={{ y: -4, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-sakura-400 -mb-1 animate-bounce" />
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sakura-500 text-midnight-950 shadow-sm">
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
