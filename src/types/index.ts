export type ViewType =
  | 'array'
  | 'grid'
  | 'tree'
  | 'graph'
  | 'intervals'
  | 'circular'
  | 'geometry'
  | 'string'
  | 'timeline'
  | 'mapping'
  | 'containers'
  | 'movement'
  | 'board'
  | 'state-machine'
  | 'generic-scene';

export type GeminiModelType = 'gemini-3.8-flash' | 'gemini-3.5-flash-lite' | 'gemini-3.1-flash-lite';

export interface ModelOption {
  id: GeminiModelType;
  name: string;
  badge: string;
  quota: string;
  desc: string;
}

// ==================== VISUALIZATION SPEC & BASE SCENE ====================

export interface LegendItem {
  label: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface EntityTypeSpec {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface VisualizationSpec {
  showPointers?: boolean;
  indexBase?: 0 | 1;
  legend?: LegendItem[];
  entityTypes?: EntityTypeSpec[];
  layoutMode?: string;
  colorScheme?: Record<string, string>;
  customLabels?: Record<string, string>;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// ==================== 1. GRID & MATRIX ====================

export interface GridHighlight {
  r: number;
  c: number;
  status?: 'normal' | 'comparing' | 'found' | 'swapping' | 'robot' | 'blocked' | 'obstacle' | 'path' | 'current' | 'target';
  color?: string;
  label?: string;
}

export interface GridData {
  gridMode?: 'maze' | 'matrix' | 'board' | 'map' | 'multi-agent';
  grid?: (string | number)[][];
  rowLabels?: string[];
  columnLabels?: string[];
  startCells?: { r: number; c: number; label?: string }[];
  goalCells?: { r: number; c: number; label?: string }[];
  selectedBox?: { r1: number; c1: number; r2: number; c2: number };
  cellHighlights?: GridHighlight[];
}

// ==================== 2. GRAPH & TREE ====================

export interface NodeItem {
  id: string;
  label: string;
  secondaryLabel?: string;
  x?: number;
  y?: number;
  highlight?: boolean;
  color?: string;
  group?: string | number; // DSU group
  weight?: string | number; // Trọng số / giá trị của đỉnh
  val?: string | number;
  status?: string; // 'lit' | 'plant' | 'off' | 'active'
  entityType?: string;
  icon?: string;
}

export interface EdgeItem {
  id?: string;
  from: string;
  to: string;
  directed?: boolean;
  weight?: string | number;
  label?: string;
  highlight?: boolean;
  color?: string;
  type?: 'solid' | 'dashed' | 'dotted';
  curvature?: number; // Cho cạnh song song hoặc cong
  state?: string;
}

// ==================== 3. INTERVALS ====================

export interface IntervalItem {
  id: string;
  label?: string;
  start: number;
  end: number;
  highlight?: boolean;
  color?: string;
  row?: number;
}

// ==================== 4. GEOMETRY ====================

export interface GeoPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
  highlight?: boolean;
  state?: string;
}

export interface GeoSegment {
  id?: string;
  from: string | { x: number; y: number };
  to: string | { x: number; y: number };
  label?: string;
  color?: string;
  highlight?: boolean;
  dashed?: boolean;
}

export interface GeoPolygon {
  id?: string;
  pointIds?: string[];
  points?: { x: number; y: number }[];
  label?: string;
  color?: string;
  fillOpacity?: number;
  highlight?: boolean;
}

export interface GeoCircle {
  id?: string;
  center: string | { x: number; y: number };
  radius: number;
  label?: string;
  color?: string;
  highlight?: boolean;
}

export interface GeoVector {
  id?: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  color?: string;
}

export interface GeoBox {
  id?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  subLabel?: string;
  area?: number | string;
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  dashed?: boolean;
  highlight?: boolean;
  isCut?: boolean;
  isTaken?: boolean;
  pattern?: 'solid' | 'striped' | 'taken';
}

export interface GeometryData {
  points?: any[];
  segments?: any[];
  polygons?: any[];
  circles?: any[];
  vectors?: any[];
  boxes?: GeoBox[];
  coordinateSystem?: 'cartesian' | 'screen';
  selectedRegion?: { minX: number; maxX: number; minY: number; maxY: number };
  axisRange?: { minX: number; maxX: number; minY: number; maxY: number };
  equalAspectRatio?: boolean;
  annotations?: { x: number; y: number; text: string; color?: string }[];
}

// ==================== 5. STRING ====================

export interface StringLane {
  id: string;
  label?: string;
  characters: string[]; // Sử dụng mảng ký tự hỗ trợ Unicode / Grapheme
  highlightIndices?: number[];
  colors?: Record<number, string>;
  ranges?: { start: number; end: number; label?: string; color?: string }[];
}

export interface StringLink {
  fromLane: string;
  fromIndex: number;
  toLane: string;
  toIndex: number;
  label?: string;
  color?: string;
}

export interface StringData {
  stringLanes?: StringLane[];
  links?: StringLink[];
  activeIndex?: number;
  operation?: {
    type: 'insert' | 'delete' | 'replace' | 'match' | 'mismatch' | 'move';
    targetIndex?: number;
    description?: string;
  };
  annotations?: string[];
}

// ==================== 6. TIMELINE / SCHEDULING ====================

export interface TimelineEvent {
  id: string;
  time: number;
  laneId?: string;
  label: string;
  color?: string;
  highlight?: boolean;
}

export interface TimelineTask {
  id: string;
  laneId: string;
  start: number;
  end: number;
  label: string;
  color?: string;
  highlight?: boolean;
}

export interface TimelineLane {
  id: string;
  label: string;
}

export interface TimelineData {
  unit?: string;
  minTime?: number;
  maxTime?: number;
  lanes?: TimelineLane[];
  events?: TimelineEvent[];
  tasks?: TimelineTask[];
  currentTime?: number;
  selectedEvents?: string[];
  overlaps?: { time: number; description?: string }[];
}

// ==================== 7. MAPPING / MULTI-LANE ARRAY ====================

export interface MappingElement {
  id: string; // Stable ID
  label: string;
  value?: string | number;
  color?: string;
  highlight?: boolean;
  state?: string;
}

export interface MappingLane {
  id: string;
  label: string;
  elements: MappingElement[];
}

export interface MappingLink {
  fromLane: string;
  fromId: string;
  toLane: string;
  toId: string;
  label?: string;
  color?: string;
  highlight?: boolean;
}

export interface MappingData {
  lanes?: MappingLane[];
  links?: MappingLink[];
  selectedLinks?: string[];
  operation?: string;
}

// ==================== 8. CONTAINERS ====================

export interface ContainerItem {
  id: string;
  label: string;
  containerId: string;
  order?: number;
  color?: string;
  value?: string | number;
}

export interface ContainerBox {
  id: string;
  label: string;
  capacity?: number;
  currentAmount?: number;
  layout?: 'vertical' | 'horizontal' | 'grid';
  color?: string;
  isFull?: boolean;
  isEmpty?: boolean;
}

export interface ContainerTransfer {
  fromContainer: string;
  toContainer: string;
  itemIds?: string[];
  amount?: number;
  label?: string;
}

export interface ContainersData {
  containers?: ContainerBox[];
  items?: ContainerItem[];
  transfers?: ContainerTransfer[];
  selectedContainer?: string;
  overflowContainers?: string[];
}

// ==================== 9. MOVEMENT ====================

export interface MovingEntity {
  id: string;
  type?: string;
  icon?: string;
  label?: string;
  position: { x: number; y: number };
  direction?: 'N' | 'E' | 'S' | 'W' | 'NE' | 'NW' | 'SE' | 'SW' | number;
  trail?: { x: number; y: number }[];
  color?: string;
  status?: string;
}

export interface MovementData {
  entities?: MovingEntity[];
  obstacles?: { x: number; y: number; label?: string }[];
  targets?: { x: number; y: number; label?: string }[];
  paths?: { x: number; y: number }[][];
  activeCommand?: string;
  commands?: string[];
  coordinateSystem?: 'grid' | 'plane';
  bounds?: { width: number; height: number };
}

// ==================== 10. BOARD ====================

export interface BoardPiece {
  id: string;
  r: number;
  c: number;
  symbol: string;
  label?: string;
  owner?: string | number;
  color?: string;
  highlight?: boolean;
}

export interface BoardData {
  rows: number;
  cols: number;
  pieces?: BoardPiece[];
  turn?: string | number;
  selectedCell?: { r: number; c: number };
  legalMoves?: { r: number; c: number }[];
  lastMove?: { from?: { r: number; c: number }; to: { r: number; c: number } };
}

// ==================== 11. CIRCULAR ====================

export interface CircularNode {
  id: string;
  label: string;
  val?: string | number;
  color?: string;
  highlight?: boolean;
  status?: string;
  order?: number;
}

export interface CircularData {
  circularMode?: 'clock' | 'josephus' | 'seating' | 'wheel' | 'cyclic-array' | 'compass';
  nodes?: CircularNode[];
  rotationOffset?: number;
  direction?: 'cw' | 'ccw';
  activeArc?: { startAngle: number; endAngle: number; color?: string };
  pointers?: { angle: number; label?: string; color?: string; length?: number }[];
  centerLabel?: string;
  ticks?: { angle: number; label: string }[];
}

// ==================== 12. STATE MACHINE ====================

export interface StateItem {
  id: string;
  label: string;
  isInitial?: boolean;
  isFinal?: boolean;
  color?: string;
}

export interface StateTransition {
  from: string;
  to: string;
  event: string;
  label?: string;
  highlight?: boolean;
}

export interface StateMachineData {
  states?: StateItem[];
  transitions?: StateTransition[];
  currentState?: string;
  activeTransition?: { from: string; to: string; event: string };
  transitionLabel?: string;
}

// ==================== 13. GENERIC SCENE ====================

export interface GenericSceneEntity {
  id: string;
  type: 'box' | 'circle' | 'text' | 'icon' | 'container' | 'arrow' | 'group' | 'counter';
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  value?: string | number;
  icon?: string;
  color?: string;
  highlight?: boolean;
  children?: GenericSceneEntity[];
  connectsTo?: string;
}

export interface GenericSceneData {
  entities?: GenericSceneEntity[];
  annotations?: { x: number; y: number; text: string; color?: string }[];
}

// ==================== FRAME & SIMULATION RESULT ====================

export interface Frame {
  step: number;
  testCase?: number;
  title?: string;
  description: string;
  event?: string;
  outputContribution?: string;

  // Dành cho Cây (Tree)
  rootId?: string;

  // Dành cho Grid 2D
  grid?: (string | number)[][];
  selectedBox?: { r1: number; c1: number; r2: number; c2: number };
  cellHighlights?: GridHighlight[];
  gridData?: GridData;

  // Dành cho Graph / Tree / DSU
  nodes?: NodeItem[];
  edges?: EdgeItem[];

  // Dành cho Trục số (Intervals)
  intervals?: IntervalItem[];
  axisRange?: { min: number; max: number };

  // Dành cho Array 1D
  elements?: (string | number | { id?: string; value: string | number; label?: string; color?: string })[];
  highlights?: number[];
  deleted?: number[];
  ranges?: { start: number; end: number; label?: string; color?: string }[];
  pointers?: Record<string, number>;

  // Dữ liệu cho các ViewType mới
  geometry?: GeometryData;
  stringData?: StringData;
  timeline?: TimelineData;
  mapping?: MappingData;
  containers?: ContainersData;
  movement?: MovementData;
  board?: BoardData;
  circular?: CircularData;
  stateMachine?: StateMachineData;
  genericScene?: GenericSceneData;

  // Biến trạng thái
  variables?: Record<string, any>;
  status?: string;
}

export interface BaseScene {
  nodes?: NodeItem[];
  edges?: EdgeItem[];
  grid?: (string | number)[][];
  containers?: ContainerBox[];
  lanes?: MappingLane[];
  board?: { rows: number; cols: number };
}

export interface SimulationResult {
  problemTitle: string;
  problemSummary: string;
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;

  tags: string[];
  sampleInput: string;
  sampleOutput: string;
  userExpectedOutput?: string;
  outputMismatchWarning?: string;
  outputMatches?: boolean;

  viewType: ViewType;
  subType?: string;
  simulationKind?: string;
  indexBase?: 0 | 1;
  rootId?: string;

  semanticRules?: string[];
  visualizationSpec?: VisualizationSpec;
  baseScene?: BaseScene;

  frames: Frame[];
}
