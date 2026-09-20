import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Check, X } from 'lucide-react';
import { parseElementValue } from './ArrayVisualizer';
import { Frame, VisualizationSpec, StringData, StringLane } from '../../types';

interface StringVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const StringVisualizer: React.FC<StringVisualizerProps> = ({ frame, spec }) => {
  const indexBase = spec?.indexBase ?? 0;

  // Trích xuất lanes từ frame.stringData hoặc fallback từ frame.elements/frame.text
  const stringData: StringData = React.useMemo(() => {
    if (frame.stringData) return frame.stringData;

    // Fallback: nếu frame có elements là mảng ký tự hoặc chuỗi
    if (frame.elements && frame.elements.length > 0) {
      return {
        lanes: [{
          id: 's1',
          label: 'Chuỗi S',
          chars: frame.elements.map(e => String(parseElementValue(e).value ?? '')),
          pointers: frame.pointers,
          highlights: frame.highlights
        }]
      };
    }

    return { lanes: [] };
  }, [frame.stringData, frame.elements, frame.pointers, frame.highlights]);

  const lanes: StringLane[] = stringData.lanes || [];

  if (lanes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu chuỗi để trực quan hóa.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full p-3 select-none">
      <div className="w-full max-w-5xl flex flex-col gap-6 bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl overflow-x-auto">
        {lanes.map((lane, laneIdx) => {
          // Tách ký tự an toàn Unicode (hỗ trợ emoji, tiếng Việt có dấu)
          const chars: string[] = typeof lane.chars === 'string'
            ? Array.from(lane.chars as string)
            : Array.isArray(lane.chars)
              ? (lane.chars as any[]).flatMap(item => Array.from(String(item ?? '')))
              : [];

          const laneHighlights = lane.highlights || [];
          const lanePointers = lane.pointers || {};
          const substring = lane.substring;

          return (
            <div key={lane.id || `lane-${laneIdx}`} className="flex flex-col gap-2 w-full">
              {/* Tiêu đề của Lane (ví dụ: Chuỗi S (Văn bản), Chuỗi P (Mẫu tìm kiếm)) */}
              {lane.label && (
                <div className="flex items-center justify-between text-xs font-mono border-b border-midnight-800 pb-1">
                  <span className="font-bold text-sakura-300 tracking-wider">
                    {lane.label}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Độ dài: <b className="text-white">{chars.length}</b> ký tự
                  </span>
                </div>
              )}

              {/* Dãy các ô ký tự */}
              <div className="flex items-end gap-1 sm:gap-2 overflow-x-auto py-4 px-2">
                <AnimatePresence mode="popLayout">
                  {chars.map((char, cIdx) => {
                    const isHl = laneHighlights.includes(cIdx);
                    const inSubstring = substring && cIdx >= substring.start && cIdx <= substring.end;

                    // Tìm pointer trỏ vào chỉ số này
                    const ptrList: string[] = [];
                    for (const [pName, pVal] of Object.entries(lanePointers)) {
                      if (pVal === cIdx) ptrList.push(pName);
                    }

                    // Nhận diện trạng thái khớp/không khớp
                    const matchStatus = lane.matches?.[cIdx]; // 'match' | 'mismatch'

                    let boxStyle = "bg-midnight-900 border-midnight-700 text-slate-200";
                    let glow = "";

                    if (matchStatus === 'match') {
                      boxStyle = "bg-emerald-950/80 border-emerald-400 text-emerald-300 font-black";
                      glow = "shadow-[0_0_15px_rgba(52,211,153,0.4)]";
                    } else if (matchStatus === 'mismatch') {
                      boxStyle = "bg-rose-950/80 border-rose-400 text-rose-300 font-black";
                      glow = "shadow-[0_0_15px_rgba(244,63,94,0.4)]";
                    } else if (isHl || inSubstring) {
                      boxStyle = "bg-sakura-500/20 border-sakura-400 text-sakura-200 font-extrabold";
                      glow = "shadow-sakura-glow";
                    }

                    const displayIndex = cIdx + indexBase;

                    return (
                      <div key={`c-${cIdx}`} className="flex flex-col items-center gap-1 shrink-0">
                        {/* Chỉ số ký tự */}
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500 font-bold">
                          [{displayIndex}]
                        </span>

                        {/* Ô ký tự */}
                        <motion.div
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, y: isHl || inSubstring ? -3 : 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-mono border-2 select-none relative ${boxStyle} ${glow}`}
                        >
                          <span>{char === ' ' ? '␣' : char}</span>

                          {/* Icon khớp/lệch nhỏ ở góc */}
                          {matchStatus === 'match' && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 absolute top-1 right-1" />
                          )}
                          {matchStatus === 'mismatch' && (
                            <X className="w-3.5 h-3.5 text-rose-400 absolute top-1 right-1" />
                          )}
                        </motion.div>

                        {/* Con trỏ Pointers trỏ vào */}
                        <div className="min-h-[30px] flex flex-col items-center gap-0.5 mt-0.5">
                          {ptrList.map((pName) => (
                            <motion.div
                              key={pName}
                              initial={{ y: -3, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="flex flex-col items-center"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-sakura-400 -mb-0.5 animate-bounce" />
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

              {/* Báo hiệu đoạn substring nếu có */}
              {substring && (
                <div className="text-[11px] font-mono text-sakura-300 flex items-center gap-2 pl-2">
                  <span className="w-2 h-2 rounded-full bg-sakura-400 animate-pulse" />
                  <span>
                    Xâu con đang xét: <b>[{substring.start + indexBase}..{substring.end + indexBase}]</b>
                    {substring.label && ` - ${substring.label}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Danh sách các thao tác chuỗi (Operations / Edits) nếu có */}
        {stringData.operations && stringData.operations.length > 0 && (
          <div className="mt-2 pt-3 border-t border-midnight-800 flex flex-col gap-1.5 text-xs font-mono">
            <span className="text-slate-400 font-bold">Thao tác chuỗi đang thực hiện:</span>
            <div className="flex flex-wrap gap-2">
              {stringData.operations.map((op, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                    op.type === 'match' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' :
                    op.type === 'mismatch' ? 'bg-rose-950/60 border-rose-500/50 text-rose-300' :
                    op.type === 'insert' ? 'bg-sky-950/60 border-sky-500/50 text-sky-300' :
                    op.type === 'delete' ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' :
                    'bg-midnight-900 border-midnight-700 text-slate-300'
                  }`}
                >
                  {op.description || `${op.type.toUpperCase()}: ${op.char || ''}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
