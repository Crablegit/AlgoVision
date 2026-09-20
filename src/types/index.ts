export type ViewType = 'grid' | 'graph' | 'tree' | 'intervals' | 'circular' | 'geometry' | 'array';

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
  viewType: ViewType;
  rootId?: string; // Đỉnh gốc của cây (nếu là dạng Tree)
  frames: Frame[];
}
