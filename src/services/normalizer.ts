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

    return {
      ...f,
      step: typeof f.step === 'number' ? f.step : idx,
      nodes: (f.nodes && f.nodes.length > 0) ? f.nodes : frameWithNodes?.nodes,
      edges: (f.edges && f.edges.length > 0) ? f.edges : frameWithEdges?.edges,
      grid: (f.grid && f.grid.length > 0) ? f.grid : frameWithGrid?.grid,
      gridData: f.gridData || frameWithGrid?.gridData,
      intervals: (f.intervals && f.intervals.length > 0) ? f.intervals : frameWithIntervals?.intervals,
      elements: (f.elements && f.elements.length > 0) ? f.elements : frameWithElements?.elements,
      geometryData: f.geometryData || frameWithGeometry?.geometryData,
      stringData: f.stringData || frameWithString?.stringData,
      timelineData: f.timelineData || frameWithTimeline?.timelineData,
      mappingData: f.mappingData || frameWithMapping?.mappingData,
      containersData: f.containersData || frameWithContainers?.containersData,
      movementData: f.movementData || frameWithMovement?.movementData,
      boardData: f.boardData || frameWithBoard?.boardData,
      circularData: f.circularData || frameWithCircular?.circularData,
      stateMachineData: f.stateMachineData || frameWithStateMachine?.stateMachineData,
      genericSceneData: f.genericSceneData || frameWithGenericScene?.genericSceneData,
      pointers: cleanPointers
    };
  });

  return {
    ...sim,
    frames: normalizedFrames
  };
}
