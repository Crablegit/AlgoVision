import { SimulationResult } from '../../types';
import { processDequeGame } from './dequeProcessor';
import { processDsu } from './dsuProcessor';
import { processPowerPlant } from './powerPlantProcessor';
import { processGridPath } from './gridPathProcessor';
import { processCakeCutting } from './cakeCuttingProcessor';

/**
 * Điều phối các bộ xử lý chuyên biệt (Specialized Processors)
 * QUY TẮC CỐT LÕI: CHỈ kích hoạt khi Gemini cung cấp simulationKind khớp rõ ràng hoặc tiêu đề bài toán đặc thù.
 * TUYỆT ĐỐI KHÔNG dùng heuristic thô sơ (như tự đoán 4 số là robot hay số âm là đồ thị).
 */
export function applySpecializedProcessor(
  sim: SimulationResult,
  expectedOutput?: string
): SimulationResult {
  if (!sim) return sim;

  const kind = sim.simulationKind;
  const titleSummary = (sim.problemTitle + ' ' + sim.problemSummary).toLowerCase();

  if (kind === 'cake-cutting' || titleSummary.includes('cake') || titleSummary.includes('cắt bánh')) {
    return processCakeCutting(sim, expectedOutput);
  }

  if (kind === 'power-plant') {
    return processPowerPlant(sim, expectedOutput);
  }

  if (kind === 'deque-game') {
    return processDequeGame(sim, expectedOutput);
  }

  if (kind === 'dsu') {
    return processDsu(sim, expectedOutput);
  }

  if (kind === 'grid-path') {
    return processGridPath(sim);
  }

  return sim;
}
