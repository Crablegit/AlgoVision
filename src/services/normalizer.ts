import { SimulationResult, Frame } from '../types';

export function normalizeOutput(str: string): string {
  return (str || '')
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .toLowerCase();
}

/**
 * Kế thừa dữ liệu giữa các frame để đảm bảo không bị mất đồ thị, lưới, chuỗi ở các frame trung gian
 */
export function normalizeSimulationFrames(sim: SimulationResult): SimulationResult {
  if (!sim || !sim.frames || sim.frames.length === 0) return sim;

  // Tìm các frame đầu tiên có dữ liệu cho từng cấu trúc
  const frameWithNodes = sim.frames.find(f => f.nodes && f.nodes.length > 0);
  const frameWithEdges = sim.frames.find(f => f.edges && f.edges.length > 0);
  const frameWithGrid = sim.frames.find(f => (f.grid && f.grid.length > 0) || f.gridData?.cells);
  const frameWithIntervals = sim.frames.find(f => f.intervals && f.intervals.length > 0);
  const frameWithElements = sim.frames.find(f => f.elements && f.elements.length > 0);
  const frameWithGeometry = sim.frames.find(f => f.geometryData);
  const frameWithString = sim.frames.find(f => f.stringData);
  const frameWithTimeline = sim.frames.find(f => f.timelineData);
  const frameWithMapping = sim.frames.find(f => f.mappingData);
  const frameWithContainers = sim.frames.find(f => f.containersData);
  const frameWithMovement = sim.frames.find(f => f.movementData);
  const frameWithBoard = sim.frames.find(f => f.boardData);
  const frameWithCircular = sim.frames.find(f => f.circularData);
  const frameWithStateMachine = sim.frames.find(f => f.stateMachineData);
  const frameWithGenericScene = sim.frames.find(f => f.genericSceneData);

  const showPointers = sim.visualizationSpec?.showPointers === true;

  // Theo dõi trạng thái tích lũy của Thùng chứa / Bình nước / Ba lô qua từng frame
  let runningContainers: any[] = frameWithContainers?.containersData?.containers
    ? JSON.parse(JSON.stringify(frameWithContainers.containersData.containers))
    : [];

  const normalizedFrames: Frame[] = sim.frames.map((f, idx) => {
    // Làm sạch pointers nếu không được yêu cầu
    let cleanPointers = f.pointers;
    if (cleanPointers && !showPointers) {
      const filtered: Record<string, number> = {};
      const desc = (f.description || '').toLowerCase();
      const hasPointerInDesc = desc.includes('con trỏ') || desc.includes('pointer');

      for (const [k, v] of Object.entries(cleanPointers)) {
        const kLower = k.toLowerCase();
        if ((kLower === 'left' || kLower === 'right' || kLower === 'l' || kLower === 'r') && !hasPointerInDesc) {
          continue;
        }
        filtered[k] = v;
      }
      cleanPointers = filtered;
    }

    // 1. Hợp nhất nodes: nếu frame gốc có đầy đủ đỉnh nhưng frame này chỉ gửi subset đỉnh (ví dụ chỉ 1 đỉnh highlight)
    // thì giữ lại toàn bộ các đỉnh cũ và chỉ cập nhật highlight/status cho các đỉnh có trong frame này.
    let effectiveNodes = f.nodes;
    if (frameWithNodes && frameWithNodes.nodes && frameWithNodes.nodes.length > 0) {
      if (!effectiveNodes || effectiveNodes.length === 0) {
        effectiveNodes = frameWithNodes.nodes;
      } else if (effectiveNodes.length < frameWithNodes.nodes.length) {
        const updateMap = new Map<string, any>();
        effectiveNodes.forEach(n => updateMap.set(String(n.id), n));
        effectiveNodes = frameWithNodes.nodes.map(baseNode => {
          const update = updateMap.get(String(baseNode.id));
          if (update) {
            return { ...baseNode, ...update, highlight: update.highlight ?? true };
          }
          return { ...baseNode, highlight: false };
        });
      }
    }

    // 2. Hợp nhất edges tương tự
    let effectiveEdges = f.edges;
    if (frameWithEdges && frameWithEdges.edges && frameWithEdges.edges.length > 0) {
      if (!effectiveEdges || effectiveEdges.length === 0) {
        effectiveEdges = frameWithEdges.edges;
      } else if (effectiveEdges.length < frameWithEdges.edges.length) {
        const updateMap = new Map<string, any>();
        effectiveEdges.forEach(e => {
          updateMap.set(`${e.from}--${e.to}`, e);
          updateMap.set(`${e.to}--${e.from}`, e);
        });
        effectiveEdges = frameWithEdges.edges.map(baseEdge => {
          const key = `${baseEdge.from}--${baseEdge.to}`;
          const update = updateMap.get(key);
          if (update) {
            return { ...baseEdge, ...update };
          }
          return { ...baseEdge, highlight: false };
        });
      }
    // 3. Hợp nhất và theo dõi trạng thái Thùng chứa / Hồ nước / Ba lô (containersData)
    let effectiveContainersData = f.containersData;
    if (frameWithContainers?.containersData?.containers) {
      const baseContainers = frameWithContainers.containersData.containers;
      if (!effectiveContainersData || !effectiveContainersData.containers || effectiveContainersData.containers.length === 0) {
        effectiveContainersData = {
          ...f.containersData,
          containers: runningContainers.map((c: any) => ({ ...c, highlight: false })),
          transfers: f.containersData?.transfers || []
        };
      } else if (effectiveContainersData.containers.length < baseContainers.length) {
        const updateMap = new Map<string, any>();
        effectiveContainersData.containers.forEach((c: any) => {
          if (c.id) updateMap.set(String(c.id), c);
          if (c.label) updateMap.set(String(c.label), c);
        });
        const merged = runningContainers.map((baseC: any) => {
          const update = updateMap.get(String(baseC.id)) || updateMap.get(String(baseC.label));
          if (update) {
            return { ...baseC, ...update, highlight: update.highlight ?? true };
          }
          return { ...baseC, highlight: false };
        });
        effectiveContainersData = {
          ...effectiveContainersData,
          containers: merged
        };
      }
    }

    // Kiểm tra nếu frame có variables về rót nước/chuyển đồ (như bài Fountain: R: 2, V: 8)
    if (effectiveContainersData?.containers && effectiveContainersData.containers.length > 0) {
      const v = f.variables || {};
      if (v.R !== undefined && v.V !== undefined) {
        const targetR = String(v.R);
        const amountV = Number(v.V);
        effectiveContainersData.containers = effectiveContainersData.containers.map((c: any, cIdx: number) => {
          const isTarget = String(c.id) === targetR || 
                           String(cIdx + 1) === targetR || 
                           (c.label && c.label.includes(targetR));
          if (isTarget) {
            return {
              ...c,
              currentAmount: Math.min(amountV, c.capacity || amountV),
              highlight: true,
              isOverflow: amountV > (c.capacity || amountV)
            };
          }
          return c;
        });
      }

      runningContainers = effectiveContainersData.containers.map((c: any) => ({ ...c }));
    }

    return {
      ...f,
      step: typeof f.step === 'number' ? f.step : idx,
      nodes: effectiveNodes,
      edges: effectiveEdges,
      grid: (f.grid && f.grid.length > 0) ? f.grid : frameWithGrid?.grid,
      gridData: f.gridData || frameWithGrid?.gridData,
      intervals: (f.intervals && f.intervals.length > 0) ? f.intervals : frameWithIntervals?.intervals,
      elements: (f.elements && f.elements.length > 0) ? f.elements : frameWithElements?.elements,
      geometryData: f.geometryData || frameWithGeometry?.geometryData,
      stringData: f.stringData || frameWithString?.stringData,
      timelineData: f.timelineData || frameWithTimeline?.timelineData,
      mappingData: f.mappingData || frameWithMapping?.mappingData,
      containersData: effectiveContainersData || frameWithContainers?.containersData,
      movementData: f.movementData || frameWithMovement?.movementData,
      boardData: f.boardData || frameWithBoard?.boardData,
      circularData: f.circularData || frameWithCircular?.circularData,
      stateMachineData: f.stateMachineData || frameWithStateMachine?.stateMachineData,
      genericSceneData: f.genericSceneData ? {
        ...f.genericSceneData,
        groups: (f.genericSceneData.groups && f.genericSceneData.groups.length > 0) ? f.genericSceneData.groups : frameWithGenericScene?.genericSceneData?.groups,
        arrows: (f.genericSceneData.arrows && f.genericSceneData.arrows.length > 0) ? f.genericSceneData.arrows : frameWithGenericScene?.genericSceneData?.arrows
      } : frameWithGenericScene?.genericSceneData,
      pointers: cleanPointers
    };
  });

  return {
    ...sim,
    frames: normalizedFrames
  };
}
