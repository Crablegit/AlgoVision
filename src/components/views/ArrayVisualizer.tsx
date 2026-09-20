import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Frame } from '../../types';

interface ArrayVisualizerProps {
  frame: Frame;
  spec?: any;
}

export interface ElementDisplayInfo {
  value: string | number;
  label?: string;
  color?: string;
  isHighlighted?: boolean;
}

export function parseElementValue(val: any): ElementDisplayInfo {
  if (val === null || val === undefined) {
    return { value: '' };
  }

  if (typeof val === 'number' || typeof val === 'boolean') {
    return { value: val };
  }

  if (typeof val === 'string') {
    return { value: val };
  }

  if (typeof val === 'object') {
    let primary: any = undefined;
    let label: string | undefined = undefined;
    let color: string | undefined = val.color;
    let isHighlighted: boolean | undefined = val.highlight ?? val.isHighlighted;

    if (val.value !== undefined) primary = val.value;
    else if (val.val !== undefined) primary = val.val;
    else if (val.num !== undefined) primary = val.num;
    else if (val.number !== undefined) primary = val.number;
    else if (val.item !== undefined) primary = val.item;
    else if (val.element !== undefined) primary = val.element;
    else if (val.text !== undefined) primary = val.text;
    else if (val.content !== undefined) primary = val.content;
    else if (val.data !== undefined) primary = val.data;
    else if (val.v !== undefined) primary = val.v;

    // Check label
    if (val.label !== undefined && val.label !== primary) {
      label = String(val.label);
    } else if (val.annotation !== undefined) {
      label = String(val.annotation);
    } else if (val.sub !== undefined) {
      label = String(val.sub);
    }

    if (primary === undefined) {
      const ignore = new Set(['id', 'index', 'idx', 'key', 'color', 'highlight', 'status', 'isdeleted', 'deleted']);
      const key = Object.keys(val).find(k => !ignore.has(k.toLowerCase()));
      if (key && val[key] !== undefined) {
        primary = val[key];
      } else if (val.id !== undefined) {
        primary = val.id;
      } else {
        const values = Object.values(val);
        primary = values.length > 0 ? values[0] : '';
      }
    }

    if (typeof primary === 'object' && primary !== null) {
      const nested = parseElementValue(primary);
      primary = nested.value;
      if (!label && nested.label) label = nested.label;
      if (!color && nested.color) color = nested.color;
    }

    return {
      value: primary !== undefined && primary !== null ? primary : '',
      label,
      color,
      isHighlighted
    };
  }

  return { value: String(val) };
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ frame, spec }) => {
  const elements = frame.elements || [];
  const highlights = frame.highlights || [];
  const pointers = frame.pointers || {};
  const status = frame.status || 'normal';
  const showPointers = spec?.showPointers === true;
  const indexBase = spec?.indexBase ?? 0;

  // Lọc con trỏ: chỉ hiển thị khi con trỏ được định nghĩa rõ ràng hoặc spec yêu cầu
  const validPointers = React.useMemo(() => {
    const result: Record<string, number> = {};
    const desc = (frame.description || '').toLowerCase();
    const mentionsPointer = 
      showPointers ||
      desc.includes('con trỏ') || 
      desc.includes('pointer') || 
      desc.includes('chỉ số l') ||
      desc.includes('chỉ số r');

    for (const [pName, pIdx] of Object.entries(pointers)) {
      const pLower = pName.toLowerCase();
      // Nếu là left hoặc right nhưng trong mô tả và spec không dùng con trỏ thì bỏ qua
      if ((pLower === 'left' || pLower === 'right' || pLower === 'l' || pLower === 'r') && !mentionsPointer) {
        continue;
      }
      result[pName] = pIdx;
    }
    return result;
  }, [pointers, frame.description, showPointers]);

  const getPointersForIndex = (index: number): string[] => {
    const matched: string[] = [];
    for (const [pName, pIdx] of Object.entries(validPointers)) {
      if (pIdx === index) matched.push(pName);
    }
    return matched;
  };

  if (elements.length === 0) return null;

  const count = elements.length;
  // Tìm độ dài chuỗi dài nhất trong các phần tử để tự động cân bằng kích thước ô và cỡ chữ
  const maxTextLen = Math.max(
    ...elements.map(e => String(parseElementValue(e).value ?? '').length),
    0
  );

  // Phóng to kích thước các ô để lấp đầy khung hiển thị một cách cân đối, không bị co cụm lại quá nhỏ
  let itemColClass = "w-28 sm:w-36 md:w-44 max-w-[180px] flex-1";
  let boxSizeClass = "w-full h-24 sm:h-28 md:h-32 text-2xl sm:text-3xl md:text-4xl rounded-2xl p-2";
  let gapClass = "gap-3 sm:gap-5";
  let indexSizeClass = "text-xs sm:text-sm font-bold";
  let ptrBadgeClass = "text-xs sm:text-sm px-2.5 sm:px-3 py-1 font-bold";
  let ptrArrowClass = "w-4 h-4";

  if (maxTextLen > 14) {
    itemColClass = "min-w-[200px] sm:min-w-[240px] md:min-w-[280px] max-w-[360px] flex-1";
    boxSizeClass = "w-full min-h-[100px] sm:min-h-[115px] h-auto rounded-2xl p-3 sm:p-4";
    gapClass = "gap-3 sm:gap-4";
    indexSizeClass = "text-xs sm:text-sm font-bold";
    ptrBadgeClass = "text-xs px-2.5 py-1";
    ptrArrowClass = "w-4 h-4";
  } else if (maxTextLen > 6) {
    itemColClass = "min-w-[110px] sm:min-w-[130px] md:min-w-[160px] max-w-[200px] flex-1";
    boxSizeClass = "w-full min-h-[80px] sm:min-h-[90px] h-auto text-lg sm:text-xl rounded-2xl p-2.5";
    gapClass = "gap-2.5 sm:gap-4";
    indexSizeClass = "text-xs sm:text-sm";
    ptrBadgeClass = "text-xs px-2.5 py-0.5";
    ptrArrowClass = "w-3.5 h-3.5";
  } else if (count > 16) {
    itemColClass = "min-w-[36px] sm:min-w-[44px] md:min-w-[54px] max-w-[68px] flex-1";
    boxSizeClass = "w-full h-14 sm:h-16 text-sm sm:text-base rounded-lg p-1";
    gapClass = "gap-1 sm:gap-1.5";
    indexSizeClass = "text-[9px] sm:text-[10px]";
    ptrBadgeClass = "text-[8px] px-1.5 py-0.5";
    ptrArrowClass = "w-3 h-3";
  } else if (count > 9) {
    itemColClass = "min-w-[50px] sm:min-w-[65px] md:min-w-[78px] max-w-[95px] flex-1";
    boxSizeClass = "w-full h-16 sm:h-20 text-base sm:text-lg rounded-xl p-1.5";
    gapClass = "gap-2 sm:gap-2.5";
    indexSizeClass = "text-[10px] sm:text-xs";
    ptrBadgeClass = "text-[9px] px-2 py-0.5";
    ptrArrowClass = "w-3 h-3";
  } else if (count > 5) {
    itemColClass = "w-20 sm:w-24 md:w-28 max-w-[130px] flex-1";
    boxSizeClass = "w-full h-20 sm:h-24 text-xl sm:text-2xl rounded-xl p-2";
    gapClass = "gap-2.5 sm:gap-3.5";
    indexSizeClass = "text-xs";
    ptrBadgeClass = "text-xs px-2.5 py-0.5";
    ptrArrowClass = "w-3.5 h-3.5";
  }

  // Định dạng nội dung hiển thị bên trong ô
  const renderElementContent = (val: any) => {
    const parsed = parseElementValue(val);
    const str = String(parsed.value ?? '');

    // Nếu chuỗi có dạng "Giá_trị - Ghi_chú/Lý_do" (ví dụ: "(30, 50) - Không thỏa mãn tổng")
    if (str.includes(' - ')) {
      const [head, ...rest] = str.split(' - ');
      const tail = rest.join(' - ');
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 text-center w-full px-2 py-1">
          <span className="font-extrabold text-sm sm:text-base md:text-lg text-white tracking-wide">
            {head}
          </span>
          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-300 leading-snug">
            {tail}
          </span>
        </div>
      );
    }

    // Nếu chuỗi có dạng "Key: Value"
    if (str.includes(': ') && str.length > 8) {
      const [head, ...rest] = str.split(': ');
      const tail = rest.join(': ');
      return (
        <div className="flex flex-col items-center justify-center gap-1 text-center w-full px-2 py-1">
          <span className="text-[11px] text-slate-400 font-mono">{head}:</span>
          <span className="font-bold text-xs sm:text-sm md:text-base text-white">{tail}</span>
        </div>
      );
    }

    // Nếu có label phụ kèm theo
    if (parsed.label) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5 text-center w-full px-1">
          <span className="font-extrabold text-lg sm:text-2xl md:text-3xl text-white tracking-wide">
            {str}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-400">
            {parsed.label}
          </span>
        </div>
      );
    }

    return <span className="break-words text-center px-1">{str}</span>;
  };

  // Tự động khôi phục highlights từ description nếu AI quên sinh highlights
  let effectiveHighlights = highlights;
  if ((!effectiveHighlights || effectiveHighlights.length === 0) && frame.description) {
    const match = frame.description.match(/(?:chỉ số|đoạn|từ)\s*(\d+)\s*(?:đến|tới|-)\s*(\d+)/i);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      if (!isNaN(start) && !isNaN(end) && start <= end && end < elements.length) {
        effectiveHighlights = [];
        for (let i = start; i <= end; i++) effectiveHighlights.push(i);
      }
    }
  }

  return (
    <div className={`flex items-end justify-center ${gapClass} py-8 px-2 sm:px-4 w-full max-w-full overflow-x-auto select-none`}>
      <AnimatePresence mode="popLayout">
        {elements.map((val, idx) => {
          const parsed = parseElementValue(val);
          const isHighlighted = (effectiveHighlights || []).includes(idx) || parsed.isHighlighted === true;
          const elementPointers = getPointersForIndex(idx);

          // Nhận diện phần tử đã bị xóa (ở đầu hoặc ở cuối dãy)
          const isObject = typeof val === 'object' && val !== null;
          const isExplicitlyDeleted = (frame.deleted && frame.deleted.includes(idx)) || (isObject && (val.deleted === true || val.isDeleted === true));
          const isWindowSubarrayProblem = frame.variables && (frame.variables['xóa_đầu'] !== undefined || frame.variables['số_bước_xóa'] !== undefined || frame.variables['đoạn_giữ_lại'] !== undefined || frame.variables['đoạn_tối_ưu'] !== undefined);
          const isDeleted = isExplicitlyDeleted || (isWindowSubarrayProblem && !isHighlighted);

          let blockStyle = "bg-midnight-900 border border-midnight-700 text-slate-200";
          let glowEffect = "";

          if (isDeleted) {
            blockStyle = "bg-rose-950/20 border-2 border-dashed border-rose-500/50 text-rose-300/40 line-through select-none opacity-50";
            glowEffect = "shadow-[0_0_8px_rgba(244,63,94,0.15)]";
          } else if (isHighlighted) {
            if (status === 'found' || status === 'done') {
              blockStyle = "bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300";
              glowEffect = "shadow-[0_0_20px_rgba(52,211,153,0.5)]";
            } else if (status === 'swapping') {
              blockStyle = "bg-rose-950/80 border-2 border-rose-400 text-rose-300";
              glowEffect = "shadow-[0_0_15px_rgba(251,113,133,0.5)]";
            } else {
              blockStyle = "bg-sakura-500/20 border-2 border-sakura-400 text-sakura-300";
              glowEffect = "shadow-sakura-glow";
            }
          } else if (parsed.color) {
            blockStyle = `border-2 text-white`;
          }

          const displayIndex = idx + indexBase;

          return (
            <div key={idx} className={`flex flex-col items-center gap-1.5 ${itemColClass}`}>
              <span className={`${indexSizeClass} font-mono font-bold mb-0.5 ${isDeleted ? 'text-rose-400/80' : isHighlighted ? 'text-emerald-400' : 'text-slate-500'}`}>
                [{displayIndex}] {isDeleted && <span className="text-[9px] text-rose-400/90 font-normal">✕</span>}
              </span>

              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isHighlighted ? 1.04 : isDeleted ? 0.95 : 1,
                  opacity: 1,
                  y: isHighlighted ? -4 : 0
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`${boxSizeClass} flex items-center justify-center font-mono font-bold select-none transition-all ${blockStyle} ${glowEffect}`}
              >
                {renderElementContent(val)}
              </motion.div>

              <div className="min-h-[36px] sm:min-h-[44px] flex flex-col items-center gap-1 mt-1">
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
