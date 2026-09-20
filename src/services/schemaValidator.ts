import { SimulationResult, Frame, ViewType } from '../types';

const VALID_VIEW_TYPES: Set<ViewType> = new Set([
  'array',
  'grid',
  'tree',
  'graph',
  'intervals',
  'circular',
  'geometry',
  'string',
  'timeline',
  'mapping',
  'containers',
  'movement',
  'board',
  'state-machine',
  'generic-scene'
]);

function cleanElements(raw: any[] | undefined): (string | number | { id?: string; value: string | number; label?: string; color?: string; highlight?: boolean })[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((el, idx) => {
    if (el === null || el === undefined) return '';
    if (typeof el === 'number' || typeof el === 'boolean' || typeof el === 'string') return el;
    if (typeof el === 'object') {
      let val = el.value ?? el.val ?? el.num ?? el.number ?? el.item ?? el.element ?? el.text ?? el.content ?? el.data;
      if (val === undefined) {
        const ignore = new Set(['id', 'index', 'idx', 'key', 'color', 'highlight', 'status', 'isdeleted', 'deleted']);
        const key = Object.keys(el).find(k => !ignore.has(k.toLowerCase()));
        if (key && el[key] !== undefined) {
          val = el[key];
        } else if (el.id !== undefined) {
          val = el.id;
        } else if (el.label !== undefined) {
          val = el.label;
        } else {
          const values = Object.values(el);
          val = values.length > 0 ? values[0] : '';
        }
      }
      if (typeof val === 'object' && val !== null) {
        val = val.value ?? val.val ?? val.label ?? JSON.stringify(val);
      }

      // Nếu không có nhãn phụ, màu sắc hay highlight riêng biệt thì đưa về giá trị nguyên thủy trực tiếp
      if (!el.label && !el.color && !el.highlight) {
        return val;
      }

      return {
        id: el.id !== undefined ? String(el.id) : `el-${idx}`,
        value: val,
        label: el.label !== undefined ? String(el.label) : undefined,
        color: el.color ? String(el.color) : undefined,
        highlight: el.highlight ? Boolean(el.highlight) : undefined
      };
    }
    return String(el);
  });
}

/**
 * Kiểm tra và làm sạch JSON trả về từ Gemini
 */
export function validateAndCleanSimulationResult(rawText: string): SimulationResult {
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    // Thử trích xuất khối JSON từ markdown ```json ... ```
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      parsed = JSON.parse(match[1]);
    } else {
      throw new Error("Không thể phân tích dữ liệu JSON trả về từ mô hình AI.");
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error("Dữ liệu trả về không đúng định dạng đối tượng.");
  }

  // 1. Chuẩn hóa viewType
  let viewType: ViewType = 'array';
  const rawView = String(parsed.viewType || '').toLowerCase().trim() as ViewType;
  if (VALID_VIEW_TYPES.has(rawView)) {
    viewType = rawView;
  } else {
    // Phân loại dự phòng
    if (rawView.includes('tree')) viewType = 'tree';
    else if (rawView.includes('grid')) viewType = 'grid';
    else if (rawView.includes('interval')) viewType = 'intervals';
    else if (rawView.includes('circ')) viewType = 'circular';
    else if (rawView.includes('geom')) viewType = 'geometry';
    else if (rawView.includes('string') || rawView.includes('xau')) viewType = 'string';
    else if (rawView.includes('time')) viewType = 'timeline';
    else if (rawView.includes('map')) viewType = 'mapping';
    else if (rawView.includes('container') || rawView.includes('jug')) viewType = 'containers';
    else if (rawView.includes('move')) viewType = 'movement';
    else if (rawView.includes('board') || rawView.includes('chess')) viewType = 'board';
    else if (rawView.includes('state') || rawView.includes('automata')) viewType = 'state-machine';
    else if (rawView.includes('scene')) viewType = 'generic-scene';
    else if (rawView.includes('graph')) viewType = 'graph';
  }

  // 2. Chuẩn hóa frames
  const rawFrames: any[] = Array.isArray(parsed.frames) ? parsed.frames : [];
  const frames: Frame[] = rawFrames.map((f, idx) => ({
    step: typeof f.step === 'number' ? f.step : idx,
    description: String(f.description || `Bước ${idx + 1}`),
    status: f.status || 'normal',
    elements: cleanElements(f.elements),
    highlights: Array.isArray(f.highlights) ? f.highlights : undefined,
    pointers: typeof f.pointers === 'object' && f.pointers !== null ? f.pointers : undefined,
    grid: Array.isArray(f.grid) ? f.grid : undefined,
    gridData: f.gridData,
    cellHighlights: Array.isArray(f.cellHighlights) ? f.cellHighlights : undefined,
    selectedBox: f.selectedBox,
    nodes: Array.isArray(f.nodes) ? f.nodes : undefined,
    edges: Array.isArray(f.edges) ? f.edges : undefined,
    rootId: f.rootId ? String(f.rootId) : undefined,
    intervals: Array.isArray(f.intervals) ? f.intervals : undefined,
    geometryData: f.geometryData,
    stringData: f.stringData,
    timelineData: f.timelineData,
    mappingData: f.mappingData,
    containersData: f.containersData,
    movementData: f.movementData,
    boardData: f.boardData,
    circularData: f.circularData,
    stateMachineData: f.stateMachineData,
    genericSceneData: f.genericSceneData,
    variables: typeof f.variables === 'object' && f.variables !== null ? f.variables : undefined,
    deleted: Array.isArray(f.deleted) ? f.deleted : undefined
  }));

  if (frames.length === 0) {
    frames.push({
      step: 0,
      description: "Khởi tạo trạng thái ban đầu của bài toán",
      status: 'normal',
      elements: []
    });
  }

  return {
    problemTitle: String(parsed.problemTitle || "Bài toán chưa đặt tên"),
    problemSummary: String(parsed.problemSummary || ""),
    problemStatement: parsed.problemStatement ? String(parsed.problemStatement) : undefined,
    inputFormat: parsed.inputFormat ? String(parsed.inputFormat) : undefined,
    outputFormat: parsed.outputFormat ? String(parsed.outputFormat) : undefined,
    constraints: parsed.constraints ? String(parsed.constraints) : undefined,
    semanticRules: Array.isArray(parsed.semanticRules) ? parsed.semanticRules : undefined,
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    sampleInput: String(parsed.sampleInput || ""),
    sampleOutput: String(parsed.sampleOutput || ""),
    userExpectedOutput: parsed.userExpectedOutput ? String(parsed.userExpectedOutput) : undefined,
    outputMatches: parsed.outputMatches !== undefined ? Boolean(parsed.outputMatches) : true,
    outputMismatchWarning: parsed.outputMismatchWarning ? String(parsed.outputMismatchWarning) : undefined,
    viewType,
    subType: parsed.subType ? String(parsed.subType) : undefined,
    indexBase: parsed.indexBase === 0 ? 0 : 1,
    visualizationSpec: parsed.visualizationSpec || {
      viewType,
      subType: parsed.subType,
      indexBase: parsed.indexBase === 0 ? 0 : 1
    },
    rootId: parsed.rootId ? String(parsed.rootId) : undefined,
    simulationKind: parsed.simulationKind,
    frames
  };
}
