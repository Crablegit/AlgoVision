import type { SimulationResult, Frame } from '../types';
import { hasTreeSemanticHint, isTreeTopology } from './treeTopology';

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

  // Nodes và edges là trạng thái theo thời gian. Không lấy dữ liệu của một frame ở tương lai
  // để hiển thị ở frame hiện tại: đây là nguyên nhân khiến đường vừa xây bị mất hoặc xuất hiện sai bước.
  let runningNodes: any[] = sim.baseScene?.nodes ? sim.baseScene.nodes.map(node => ({ ...node })) : [];
  let runningEdges: any[] = sim.baseScene?.edges ? sim.baseScene.edges.map(edge => ({ ...edge })) : [];

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

    // 1. Hợp nhất nodes theo ID, chỉ kế thừa dữ liệu từ các frame trước đó.
    if (f.nodes && f.nodes.length > 0) {
      const nodeUpdates = new Map(f.nodes.map(node => [String(node.id), node]));
      const retainedNodes = runningNodes.map(node => {
        const update = nodeUpdates.get(String(node.id));
        return update ? { ...node, ...update } : { ...node, highlight: false };
      });
      const newNodes = f.nodes.filter(node => !runningNodes.some(existing => String(existing.id) === String(node.id)));
      runningNodes = [...retainedNodes, ...newNodes];
    }
    const effectiveNodes = runningNodes.length > 0 ? runningNodes : f.nodes;

    // 2. Các cạnh có mặt ở một frame là đường đã tồn tại tại hoặc trước frame đó.
    // Hợp nhất theo ID/endpoints để một frame chỉ chứa đường mới vẫn giữ các đường đã xây trước đó.
    if (f.edges && f.edges.length > 0) {
      const getNormalizedWeight = (edge: any) => edge.weight ?? edge.w ?? edge.val ?? edge.value ?? edge.cost;
      const edgeKey = (edge: any) => {
        const u = String(edge.from);
        const v = String(edge.to);
        if (edge.directed) return `${u}->${v}`;
        return u.localeCompare(v, undefined, { numeric: true }) <= 0 ? `${u}--${v}` : `${v}--${u}`;
      };

      const normalizedInputEdges = f.edges.map(e => ({
        ...e,
        weight: getNormalizedWeight(e)
      }));

      const edgeUpdates = new Map(normalizedInputEdges.map(edge => [edgeKey(edge), edge]));
      const retainedEdges = runningEdges.map(edge => {
        const key = edgeKey(edge);
        if (edgeUpdates.has(key)) {
          const update = edgeUpdates.get(key)!;
          return {
            ...edge,
            ...update,
            weight: update.weight !== undefined ? update.weight : edge.weight
          };
        }
        return { ...edge, highlight: false };
      });
      const newEdges = normalizedInputEdges.filter(edge => !runningEdges.some(existing => edgeKey(existing) === edgeKey(edge)));
      runningEdges = [...retainedEdges, ...newEdges];
    }
    const effectiveEdges = runningEdges.length > 0 ? runningEdges : f.edges;

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

  // A tree may arrive as a base scene plus edge-only delta frames. Re-evaluate only
  // after sequential inheritance, so Custom Test keeps the same tree mode too.
  const shouldPromoteToTree = sim.viewType === 'graph'
    && hasTreeSemanticHint([
      sim.viewType,
      sim.visualizationSpec?.viewType,
      sim.subType,
      ...(sim.tags || []),
      sim.problemTitle,
      sim.problemSummary,
      sim.problemStatement
    ])
    && normalizedFrames.some(frame => isTreeTopology(frame.nodes, frame.edges));
  const viewType = shouldPromoteToTree ? 'tree' : sim.viewType;

  return {
    ...sim,
    viewType,
    visualizationSpec: shouldPromoteToTree
      ? { ...sim.visualizationSpec, viewType }
      : sim.visualizationSpec,
    frames: normalizedFrames
  };
}
