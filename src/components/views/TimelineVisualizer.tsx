import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { Frame, VisualizationSpec, TimelineData, TimelineLane, TimelineEvent, TimelineTask } from '../../types';

interface TimelineVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({ frame, spec }) => {
  const timelineData: TimelineData = React.useMemo(() => {
    if (frame.timelineData) return frame.timelineData;

    // Fallback: nếu frame có intervals, chuyển thành 1 lane tasks
    if (frame.intervals && frame.intervals.length > 0) {
      return {
        lanes: [{
          id: 'lane-1',
          label: 'Dòng thời gian',
          tasks: frame.intervals.map((iv, idx) => ({
            id: iv.id || `task-${idx}`,
            label: iv.label || `[${iv.start}, ${iv.end}]`,
            start: iv.start,
            end: iv.end,
            highlight: iv.highlight,
            color: iv.color
          }))
        }],
        currentTime: frame.currentTime
      };
    }

    return { lanes: [] };
  }, [frame.timelineData, frame.intervals, frame.currentTime]);

  const lanes: TimelineLane[] = timelineData.lanes || [];
  const events: TimelineEvent[] = timelineData.events || [];
  const currentTime = timelineData.currentTime;

  // Tính toán khoảng thời gian min/max để tỷ lệ hóa trục thời gian
  const timeBounds = useMemo(() => {
    let minT = Infinity;
    let maxT = -Infinity;

    lanes.forEach(lane => {
      (lane.tasks || []).forEach(t => {
        minT = Math.min(minT, t.start);
        maxT = Math.max(maxT, t.end);
      });
    });

    events.forEach(e => {
      minT = Math.min(minT, e.time);
      maxT = Math.max(maxT, e.time);
    });

    if (currentTime !== undefined) {
      minT = Math.min(minT, currentTime);
      maxT = Math.max(maxT, currentTime);
    }

    if (minT === Infinity) {
      minT = 0;
      maxT = 10;
    } else if (minT === maxT) {
      minT = Math.max(0, minT - 2);
      maxT += 2;
    }

    const span = maxT - minT;
    return { minT, maxT, span };
  }, [lanes, events, currentTime]);

  if (lanes.length === 0 && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        Chưa có dữ liệu dòng thời gian để trực quan hóa.
      </div>
    );
  }

  // Chuyển đổi mốc thời gian t thành % vị trí trên track (từ 0% đến 100%)
  const getPercent = (t: number) => {
    if (timeBounds.span === 0) return 0;
    return ((t - timeBounds.minT) / timeBounds.span) * 100;
  };

  // Tạo các vạch chia thời gian (ticks)
  const ticksCount = 6;
  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const t = timeBounds.minT + (i * timeBounds.span) / ticksCount;
    return Math.round(t * 10) / 10;
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div className="w-full max-w-5xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 overflow-x-auto">
        {/* Header timeline */}
        <div className="flex items-center justify-between border-b border-midnight-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-sakura-300 font-bold">
            <Clock className="w-4 h-4 text-sakura-400" />
            <span>Trực quan hóa Dòng thời gian / Lịch trình (Timeline)</span>
          </div>
          {currentTime !== undefined && (
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/40">
              Thời điểm hiện tại: t = {currentTime}
            </span>
          )}
        </div>

        {/* Trục đo thời gian (Time Axis with Ticks) */}
        <div className="relative w-full h-8 flex items-center border-b border-slate-700/60 ml-28 pr-4">
          {ticks.map((tVal, idx) => {
            const pct = getPercent(tVal);
            return (
              <div
                key={idx}
                className="absolute flex flex-col items-center -translate-x-1/2"
                style={{ left: `${pct}%` }}
              >
                <div className="w-0.5 h-2 bg-slate-500 mb-1" />
                <span className="text-[10px] font-mono text-slate-400">
                  {tVal}
                </span>
              </div>
            );
          })}
        </div>

        {/* Các hàng Lane / Track */}
        <div className="flex flex-col gap-4 relative">
          {lanes.map((lane, lIdx) => {
            const tasks: TimelineTask[] = lane.tasks || [];

            return (
              <div key={lane.id || `lane-${lIdx}`} className="flex items-center gap-4 w-full">
                {/* Tên Lane (ví dụ: Phòng 1, Máy A, Kênh truyền) */}
                <div className="w-24 shrink-0 font-mono text-xs font-bold text-slate-300 text-right truncate">
                  {lane.label || `Kênh ${lIdx + 1}`}
                </div>

                {/* Thanh track chứa các tasks */}
                <div className="relative flex-grow h-12 bg-midnight-900/80 rounded-xl border border-midnight-800 overflow-hidden">
                  {tasks.map((task, tIdx) => {
                    const leftPct = getPercent(task.start);
                    const widthPct = Math.max(getPercent(task.end) - leftPct, 1.5);
                    const isHl = task.highlight;

                    let barColor = "bg-sky-500/20 border-sky-400 text-sky-200";
                    let glow = "";

                    if (task.status === 'conflict') {
                      barColor = "bg-rose-950/80 border-rose-500 text-rose-300";
                      glow = "shadow-[0_0_12px_rgba(244,63,94,0.4)]";
                    } else if (task.status === 'active' || isHl) {
                      barColor = "bg-sakura-500/30 border-sakura-400 text-sakura-200 font-bold";
                      glow = "shadow-sakura-glow";
                    } else if (task.status === 'completed') {
                      barColor = "bg-emerald-950/70 border-emerald-500/70 text-emerald-300";
                    }

                    return (
                      <motion.div
                        key={task.id || `task-${tIdx}`}
                        initial={{ opacity: 0, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        className={`absolute top-1.5 bottom-1.5 rounded-lg border flex items-center justify-between px-2 text-xs font-mono select-none overflow-hidden transition-all ${barColor} ${glow}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`
                        }}
                      >
                        <span className="truncate font-medium">{task.label || `[${task.start}, ${task.end}]`}</span>
                        <span className="text-[9px] opacity-75 shrink-0 ml-1">
                          {task.start}-{task.end}
                        </span>
                      </motion.div>
                    );
                  })}

                  {/* Vạch thời gian hiện tại (Current Time Cursor) */}
                  {currentTime !== undefined && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-20 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      style={{ left: `${getPercent(currentTime)}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Các sự kiện điểm (Instant Events) nếu có */}
        {events.length > 0 && (
          <div className="flex flex-col gap-2 pt-3 border-t border-midnight-800">
            <span className="text-xs font-mono font-bold text-slate-400">Các sự kiện xảy ra:</span>
            <div className="flex flex-wrap gap-2">
              {events.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-midnight-900 border border-midnight-700 text-xs font-mono text-slate-300"
                >
                  <span className="text-sakura-400 font-bold">t={ev.time}:</span>
                  <span>{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
