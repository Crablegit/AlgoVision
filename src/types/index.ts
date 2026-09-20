export type ViewType = 'grid' | 'graph' | 'intervals' | 'circular' | 'geometry' | 'array';

export interface GridHighlight {
  r: number;
  c: number;
  status?: 'normal' | 'comparing' | 'found' | 'swapping';
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
  row?: number; // Tầng của đoạn trên trục số
}

export interface Frame {
  step: number;
  description: string;

  // Dành cho Grid 2D
  grid?: (string | number)[][];
  selectedBox?: { r1: number; c1: number; r2: number; c2: number };
  cellHighlights?: GridHighlight[];

  // Dành cho Graph / Tree / DSU / Shortest Path / Circular
  nodes?: NodeItem[];
  edges?: EdgeItem[];

  // Dành cho Trục số / Tập đoạn thẳng phủ nhau (Intervals / Number Line)
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
  tags: string[]; // Ví dụ: ["2D-Grid", "Subrectangle"], ["Intervals", "Greedy"], ["Graph", "DSU"]
  sampleInput: string;
  sampleOutput: string;
  viewType: ViewType;
  frames: Frame[];
}
