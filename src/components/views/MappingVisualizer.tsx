import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Frame, VisualizationSpec, MappingData, MappingElement, MappingLink } from '../../types';

interface MappingVisualizerProps {
  frame: Frame;
  spec?: VisualizationSpec;
}

export const MappingVisualizer: React.FC<MappingVisualizerProps> = ({ frame, spec }) => {
  const mappingData: MappingData = React.useMemo(() => {
    if (frame.mappingData) return frame.mappingData;

    // Fallback nếu có nodes và edges dạng bipartite (từ/đến)
    if (frame.nodes && frame.edges) {
      const leftElements: MappingElement[] = [];
      const rightElements: MappingElement[] = [];
      const links: MappingLink[] = [];

      frame.nodes.forEach((n, idx) => {
        // Tạm phân bổ nửa trái nửa phải nếu chưa có phân chia
        if (idx < Math.ceil(frame.nodes!.length / 2)) {
          leftElements.push({ id: n.id, label: n.label, highlight: n.highlight });
        } else {
          rightElements.push({ id: n.id, label: n.label, highlight: n.highlight });
        }
      });

      frame.edges.forEach((e, idx) => {
        links.push({
          id: `link-${idx}`,
          source: e.from,
          target: e.to,
          label: e.label || (e.weight !== undefined ? String(e.weight) : undefined),
          highlight: e.highlight
        });
      });

      return {
        sourceLane: { title: 'Tập nguồn (Domain)', elements: leftElements },
        targetLane: { title: 'Tập đích (Codomain)', elements: rightElements },
        links
      };
    }

    return {
      sourceLane: { title: 'Nguồn', elements: [] },
      targetLane: { title: 'Đích', elements: [] },
      links: []
    };
  }, [frame.mappingData, frame.nodes, frame.edges]);

  const sourceElements = mappingData.sourceLane?.elements || [];
  const targetElements = mappingData.targetLane?.elements || [];
  const links = mappingData.links || [];

  // Để vẽ đường cong Bézier chính xác, ta lưu tọa độ Y của các element DOM
  const containerRef = useRef<HTMLDivElement>(null);
  const [elemPositions, setElemPositions] = useState<Record<string, { x: number; y: number; isSource: boolean }>>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const positions: Record<string, { x: number; y: number; isSource: boolean }> = {};

    sourceElements.forEach(elem => {
      const dom = document.getElementById(`map-src-${elem.id}`);
      if (dom) {
        const rect = dom.getBoundingClientRect();
        positions[elem.id] = {
          x: rect.right - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
          isSource: true
        };
      }
    });

    targetElements.forEach(elem => {
      const dom = document.getElementById(`map-tgt-${elem.id}`);
      if (dom) {
        const rect = dom.getBoundingClientRect();
        positions[elem.id] = {
          x: rect.left - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
          isSource: false
        };
      }
    });

    setElemPositions(positions);
  }, [sourceElements, targetElements, links]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full p-3 select-none">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-midnight-950/90 border border-midnight-800 rounded-2xl p-6 shadow-2xl flex justify-between min-h-[360px]"
      >
        {/* SVG Layer để vẽ các đường nối cong Bézier */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker
              id="map-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker
              id="map-arrow-emerald"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {links.map((link, idx) => {
            const srcPos = elemPositions[link.source];
            const tgtPos = elemPositions[link.target];
            if (!srcPos || !tgtPos) return null;

            const isHl = link.highlight;
            const dx = Math.abs(tgtPos.x - srcPos.x) * 0.5;
            const pathD = `M ${srcPos.x} ${srcPos.y} C ${srcPos.x + dx} ${srcPos.y}, ${tgtPos.x - dx} ${tgtPos.y}, ${tgtPos.x} ${tgtPos.y}`;

            let strokeColor = "#475569";
            let markerId = "map-arrow";

            if (link.status === 'matched') {
              strokeColor = "#10b981";
              markerId = "map-arrow-emerald";
            } else if (link.status === 'conflict' || isHl) {
              strokeColor = "#f43f5e";
              markerId = "map-arrow";
            } else if (link.color) {
              strokeColor = link.color;
            }

            return (
              <g key={link.id || `link-${idx}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isHl ? 3 : 2}
                  strokeDasharray={link.dashed ? '5 5' : undefined}
                  markerEnd={`url(#${markerId})`}
                  className="transition-all duration-300"
                />
                {link.label && (
                  <text
                    x={(srcPos.x + tgtPos.x) / 2}
                    y={(srcPos.y + tgtPos.y) / 2 - 6}
                    fill="#f1f5f9"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-bold"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Cột Bên Trái: Nguồn / Domain */}
        <div className="flex flex-col gap-3 w-56 z-20">
          <div className="font-mono font-bold text-xs text-sakura-400 border-b border-midnight-800 pb-1.5 uppercase tracking-wider text-center">
            {mappingData.sourceLane?.title || 'Tập nguồn'}
          </div>
          <div className="flex flex-col gap-3">
            {sourceElements.map((elem) => {
              const isHl = elem.highlight;
              return (
                <motion.div
                  key={elem.id}
                  id={`map-src-${elem.id}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-3 rounded-xl border font-mono text-sm flex items-center justify-between transition-all ${
                    isHl
                      ? 'bg-sakura-500/20 border-sakura-400 text-sakura-200 shadow-sakura-glow font-bold'
                      : 'bg-midnight-900 border-midnight-700 text-slate-200'
                  }`}
                >
                  <span>{elem.label || elem.id}</span>
                  {elem.subLabel && <span className="text-xs text-slate-400">({elem.subLabel})</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Cột Bên Phải: Đích / Codomain */}
        <div className="flex flex-col gap-3 w-56 z-20">
          <div className="font-mono font-bold text-xs text-emerald-400 border-b border-midnight-800 pb-1.5 uppercase tracking-wider text-center">
            {mappingData.targetLane?.title || 'Tập đích'}
          </div>
          <div className="flex flex-col gap-3">
            {targetElements.map((elem) => {
              const isHl = elem.highlight;
              return (
                <motion.div
                  key={elem.id}
                  id={`map-tgt-${elem.id}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-3 rounded-xl border font-mono text-sm flex items-center justify-between transition-all ${
                    isHl
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)] font-bold'
                      : 'bg-midnight-900 border-midnight-700 text-slate-200'
                  }`}
                >
                  <span>{elem.label || elem.id}</span>
                  {elem.subLabel && <span className="text-xs text-slate-400">({elem.subLabel})</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
