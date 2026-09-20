export type ElementStatus = 'normal' | 'comparing' | 'found' | 'swapping' | 'inactive' | 'done';

export interface Frame {
  step: number;
  description: string;
  elements: (number | string)[];
  highlights?: number[]; // Các chỉ số index đang được xét hoặc đổi màu
  pointers?: Record<string, number>; // Ví dụ: { left: 0, right: 4, mid: 2, i: 1 }
  variables?: Record<string, string | number | boolean | null>; // Biến phụ: { target: 9, sum: 15 }
  status?: ElementStatus;
}

export interface SimulationResult {
  problemTitle: string;
  problemSummary: string;
  exampleInput: string;
  frames: Frame[];
}
