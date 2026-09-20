export type ViewType = 'grid' | 'graph' | 'tree' | 'intervals' | 'circular' | 'geometry' | 'array';

export type GeminiModelType = 'gemini-3.8-flash' | 'gemini-3.5-flash-lite' | 'gemini-3.1-flash-lite';

export interface ModelOption {
  id: GeminiModelType;
  name: string;
  badge: string;
  quota: string;
  desc: string;
}

export interface GridHighlight {
  r: number;
  c: number;
  status?: 'normal' | 'comparing' | 'found' | 'swapping' | 'robot' | 'blocked' | 'obstacle' | 'path';
  color?: string;
}

export interface NodeItem {
  id: string;
  label: string;
  x?: number;
  y?: number;
  highlight?: boolean;
  color?: string;
  group?: string | number; // DSU group
  weight?: string | number; // Trọng số / giá trị của đỉnh
  val?: string | number;
}

export interface EdgeItem {
  from: string;
  to: string;
  weight?: string | number;
  highlight?: boolean;
  color?: string;
}

export interface IntervalItem {
  id: string;
  label?: string;
  start: number;
  end: number;
  highlight?: boolean;
  color?: string;
  row?: number;
}

export interface Frame {
  step: number;
  description: string;

  // Dành cho Cây (Tree)
  rootId?: string; // Gốc của cây (xác định theo đề bài, không mặc định là 1)

  // Dành cho Grid 2D
  grid?: (string | number)[][];
  selectedBox?: { r1: number; c1: number; r2: number; c2: number };
  cellHighlights?: GridHighlight[];

  // Dành cho Graph / Tree / DSU / Shortest Path / Circular
  nodes?: NodeItem[];
  edges?: EdgeItem[];

  // Dành cho Trục số / Tập đoạn thẳng phủ nhau (Intervals)
  intervals?: IntervalItem[];
  axisRange?: { min: number; max: number };

  // Dành cho Array 1D
  elements?: (string | number)[];
  highlights?: number[];
  deleted?: number[]; // Danh sách chỉ số các phần tử đã bị xóa (ở đầu/cuối)
  pointers?: Record<string, number>;

  // Biến trạng thái
  variables?: Record<string, string | number | boolean | null>;
  status?: string;
}

export interface SimulationResult {
  problemTitle: string;
  problemSummary: string;
  tags: string[];
  sampleInput: string;
  sampleOutput: string;
  userExpectedOutput?: string; // Output mong muốn do người dùng nhập (nếu có)
  outputMismatchWarning?: string; // Cảnh báo dạng text nếu output của người dùng bị sai so với đề bài
  outputMatches?: boolean; // Cờ đánh dấu output có khớp với kết quả mong đợi hay không
  viewType: ViewType;
  rootId?: string; // Đỉnh gốc của cây (nếu là dạng Tree)
  frames: Frame[];
}
