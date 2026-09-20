import { SimulationResult, Frame, NodeItem, EdgeItem } from '../../types';

function normalizeOutput(str: string): string {
  return str.trim().replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
}

/**
 * Xử lý bài toán DSU (Union-Find / Các thùng nước / Bình thông nhau)
 * Chỉ kích hoạt khi simulationKind === 'dsu'
 */
export function processDsu(sim: SimulationResult, expectedOutput?: string): SimulationResult {
  if (!sim) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return sim;

  const queries: { u: number; v: number; type: number }[] = [];
  let maxNode = 0;

  for (const line of lines) {
    const parts = line.split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (parts.length >= 3) {
      queries.push({ u: parts[0], v: parts[1], type: parts[2] });
      maxNode = Math.max(maxNode, parts[0], parts[1]);
    }
  }

  if (queries.length === 0 || maxNode === 0) return sim;

  // Cấu trúc DSU
  const parent: number[] = Array.from({ length: maxNode + 1 }, (_, i) => i);
  const find = (i: number): number => {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  };
  const union = (i: number, j: number): boolean => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  };

  const accumulatedEdges: EdgeItem[] = [];
  const frames: Frame[] = [];
  let step = 0;
  const outputs: number[] = [];

  // Frame 0: Khởi tạo
  const initialNodes: NodeItem[] = Array.from({ length: maxNode }, (_, i) => ({
    id: String(i + 1),
    label: String(i + 1),
    group: String(i + 1),
    highlight: false
  }));

  frames.push({
    step: step++,
    description: `Khởi tạo ${maxNode} thùng nước độc lập (chưa có van nối nào được mở). Mỗi thùng mang một màu riêng biệt đại diện cho tập hợp liên thông ban đầu.`,
    nodes: initialNodes,
    edges: [],
    status: 'normal',
    variables: {
      'tổng_số_thùng': maxNode,
      'số_truy_vấn': queries.length
    }
  });

  queries.forEach((q, idx) => {
    const qNum = idx + 1;
    const { u, v, type } = q;

    if (type === 1) {
      // Mở van / Nối
      union(u, v);
      accumulatedEdges.push({
        from: String(u),
        to: String(v),
        highlight: true,
        color: 'emerald'
      });

      const currentNodes: NodeItem[] = Array.from({ length: maxNode }, (_, i) => {
        const id = i + 1;
        const root = find(id);
        const isCurrent = id === u || id === v;
        return {
          id: String(id),
          label: String(id),
          group: String(root),
          highlight: isCurrent,
          color: isCurrent ? 'emerald' : undefined
        };
      });

      frames.push({
        step: step++,
        description: `Truy vấn ${qNum}/${queries.length} [Thao tác 1 - MỞ VAN NỐI]: Mở van nối giữa thùng ${u} và thùng ${v}. Hai thùng này (và các thùng liên thông với chúng) đã hòa làm một hệ thống có cùng màu sắc.`,
        nodes: currentNodes,
        edges: [...accumulatedEdges],
        status: 'normal',
        variables: {
          'thao_tác': `Mở van (${u}, ${v})`,
          'truy_vấn_hiện_tại': `${qNum}/${queries.length}`
        }
      });
    } else if (type === 2) {
      // Kiểm tra liên thông
      const isConnected = find(u) === find(v);
      const resVal = isConnected ? 1 : 0;
      outputs.push(resVal);

      const currentNodes: NodeItem[] = Array.from({ length: maxNode }, (_, i) => {
        const id = i + 1;
        const root = find(id);
        const isTarget = id === u || id === v;
        return {
          id: String(id),
          label: String(id),
          group: String(root),
          highlight: isTarget,
          color: isTarget ? (isConnected ? 'emerald' : 'rose') : undefined
        };
      });

      frames.push({
        step: step++,
        description: `Truy vấn ${qNum}/${queries.length} [Thao tác 2 - KIỂM TRA LIÊN THÔNG]: Thùng ${u} và thùng ${v} ${
          isConnected
            ? 'ĐÃ LIÊN THÔNG VỚI NHAU (cùng thuộc hệ thống) => Kết quả: 1'
            : 'CHƯA LIÊN THÔNG VỚI NHAU (thuộc hai hệ thống tách biệt) => Kết quả: 0'
        }.`,
        nodes: currentNodes,
        edges: [...accumulatedEdges],
        status: isConnected ? 'found' : 'normal',
        variables: {
          'thao_tác': `Kiểm tra liên thông (${u}, ${v})`,
          'kết_quả': resVal
        }
      });
    }
  });

  const computedOutput = outputs.join('\n');
  return {
    ...sim,
    sampleOutput: computedOutput || sim.sampleOutput,
    viewType: 'graph',
    frames
  };
}
