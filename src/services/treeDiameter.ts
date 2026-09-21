import { NodeItem, EdgeItem } from '../types';

export interface DiameterResult {
  hasDiameter: boolean;
  endpoints: [string, string] | null;
  pathNodes: string[];
  pathEdgeKeys: Set<string>;
  diameterValue: number;
  reportedDiameter?: number;
  pathString: string;
  isRecalculated?: boolean;
}

export interface EdgeUpdateInfo {
  edgeKey: string;
  from: string;
  to: string;
  oldWeight?: string | number;
  newWeight: string | number;
  description?: string;
}

/**
 * Tạo khóa đồng nhất cho cạnh vô hướng: min(u, v) -- max(u, v)
 */
export function getUndirectedEdgeKey(u: string, v: string): string {
  const su = String(u).trim();
  const sv = String(v).trim();
  return su.localeCompare(sv, undefined, { numeric: true }) <= 0
    ? `${su}--${sv}`
    : `${sv}--${su}`;
}

/**
 * Trích xuất trọng số cạnh từ nhiều trường có thể có (weight, w, val, value, cost)
 */
export function getEdgeWeight(edge: any): number | undefined {
  if (!edge) return undefined;
  const raw = edge.weight ?? edge.w ?? edge.val ?? edge.value ?? edge.cost;
  if (raw === undefined || raw === null || raw === '') return undefined;
  const num = Number(raw);
  return isNaN(num) ? undefined : num;
}

/**
 * Phân tích chuỗi hoặc mảng diameterPath nếu model trả về
 * Hỗ trợ: [1, 3, 7], "1 -> 3 -> 7", "1 - 3 - 7", "1, 3, 7", "1 3 7"
 */
export function parseDiameterPath(rawPath: any): string[] | null {
  if (!rawPath) return null;
  if (Array.isArray(rawPath)) {
    return rawPath.map(x => String(x).trim()).filter(Boolean);
  }
  if (typeof rawPath === 'string') {
    const cleaned = rawPath.replace(/\[|\]/g, '').trim();
    if (!cleaned) return null;
    let parts: string[] = [];
    if (cleaned.includes('->')) {
      parts = cleaned.split('->');
    } else if (cleaned.includes('➔')) {
      parts = cleaned.split('➔');
    } else if (cleaned.includes('-')) {
      parts = cleaned.split('-');
    } else if (cleaned.includes(',')) {
      parts = cleaned.split(',');
    } else {
      parts = cleaned.split(/\s+/);
    }
    const result = parts.map(s => s.trim()).filter(Boolean);
    return result.length >= 2 ? result : null;
  }
  return null;
}

/**
 * Thuật toán 2-Pass BFS/Dijkstra tính chính xác 100% đường kính của cây có trọng số (hoặc không trọng số)
 */
export function calculateTreeDiameter(
  nodes: NodeItem[],
  edges: EdgeItem[],
  variables?: Record<string, any>,
  rootId?: string
): DiameterResult {
  const emptyResult: DiameterResult = {
    hasDiameter: false,
    endpoints: null,
    pathNodes: [],
    pathEdgeKeys: new Set(),
    diameterValue: 0,
    pathString: ''
  };

  if (!nodes || nodes.length < 2 || !edges || edges.length === 0) {
    return emptyResult;
  }

  // 1. Chuẩn hóa ID nodes và xây dựng danh sách kề
  const nodeIds = new Set<string>();
  nodes.forEach(n => nodeIds.add(String(n.id)));

  interface AdjEntry {
    to: string;
    weight: number;
    edge: EdgeItem;
  }
  const adj = new Map<string, AdjEntry[]>();
  nodeIds.forEach(id => adj.set(id, []));

  edges.forEach(e => {
    const u = String(e.from);
    const v = String(e.to);
    if (!nodeIds.has(u) || !nodeIds.has(v) || u === v) return;
    const w = getEdgeWeight(e) ?? 1; // Mặc định là 1 nếu không có trọng số
    adj.get(u)?.push({ to: v, weight: w, edge: e });
    adj.get(v)?.push({ to: u, weight: w, edge: e });
  });

  // 2. Kiểm tra xem model có cung cấp diameter hoặc diameterPath trong variables hay không
  let reportedDiameter: number | undefined = undefined;
  let candidatePath: string[] | null = null;

  if (variables) {
    for (const [k, v] of Object.entries(variables)) {
      const kLower = k.toLowerCase().replace(/_/g, '');
      if (kLower === 'diameter' || kLower === 'duongkinh' || kLower === 'treediameter') {
        const num = Number(v);
        if (!isNaN(num)) reportedDiameter = num;
      }
      if (kLower === 'diameterpath' || kLower === 'path' || kLower === 'duongdi') {
        candidatePath = parseDiameterPath(v);
      }
    }
  }

  // 3. Chọn đỉnh bắt đầu cho Pass 1
  const startNode = (rootId && nodeIds.has(String(rootId)))
    ? String(rootId)
    : (nodes[0]?.id ? String(nodes[0].id) : Array.from(nodeIds)[0]);

  if (!startNode || !adj.has(startNode)) {
    return emptyResult;
  }

  // Hàm BFS / Dijkstra tìm đỉnh xa nhất từ 1 nguồn
  function findFurthest(src: string): {
    furthestNode: string;
    maxDist: number;
    dist: Map<string, number>;
    parent: Map<string, { prev: string; weight: number }>;
  } {
    const dist = new Map<string, number>();
    const parent = new Map<string, { prev: string; weight: number }>();
    const queue: string[] = [src];
    dist.set(src, 0);

    let furthestNode = src;
    let maxDist = 0;

    // Do là cây (acyclic), BFS chuẩn là đủ tìm đường đi ngắn nhất / dài nhất
    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      const d = dist.get(u) || 0;

      if (d > maxDist) {
        maxDist = d;
        furthestNode = u;
      }

      for (const edgeEntry of adj.get(u) || []) {
        const v = edgeEntry.to;
        if (!dist.has(v)) {
          const newD = d + edgeEntry.weight;
          dist.set(v, newD);
          parent.set(v, { prev: u, weight: edgeEntry.weight });
          queue.push(v);
        }
      }
    }

    return { furthestNode, maxDist, dist, parent };
  }

  // Pass 1: Từ startNode, tìm đỉnh U xa nhất
  const pass1 = findFurthest(startNode);
  const u = pass1.furthestNode;

  // Pass 2: Từ U, tìm đỉnh V xa nhất và ghi vết parent để lấy đường đi
  const pass2 = findFurthest(u);
  const v = pass2.furthestNode;
  const computedDiameter = pass2.maxDist;

  // 4. Tái tạo đường đi từ V ngược về U
  const pathNodes: string[] = [];
  let curr = v;
  pathNodes.push(curr);
  while (curr !== u && pass2.parent.has(curr)) {
    const info = pass2.parent.get(curr)!;
    curr = info.prev;
    pathNodes.push(curr);
  }
  pathNodes.reverse(); // Đổi lại thành: U ➔ ... ➔ V

  // Khóa các cạnh trên đường kính
  const pathEdgeKeys = new Set<string>();
  for (let i = 0; i < pathNodes.length - 1; i++) {
    pathEdgeKeys.add(getUndirectedEdgeKey(pathNodes[i], pathNodes[i + 1]));
  }

  // Nếu model đã có candidatePath hợp lệ, ưu tiên dùng nếu khớp
  let finalPath = pathNodes;
  let finalEndpoints: [string, string] = [u, v];
  if (candidatePath && candidatePath.length >= 2) {
    const allInTree = candidatePath.every(id => nodeIds.has(id));
    if (allInTree) {
      finalPath = candidatePath;
      finalEndpoints = [candidatePath[0], candidatePath[candidatePath.length - 1]];
      pathEdgeKeys.clear();
      for (let i = 0; i < finalPath.length - 1; i++) {
        pathEdgeKeys.add(getUndirectedEdgeKey(finalPath[i], finalPath[i + 1]));
      }
    }
  }

  const diameterValue = reportedDiameter !== undefined ? reportedDiameter : computedDiameter;
  const pathString = finalPath.join(' ➔ ');

  return {
    hasDiameter: true,
    endpoints: finalEndpoints,
    pathNodes: finalPath,
    pathEdgeKeys,
    diameterValue,
    reportedDiameter,
    pathString
  };
}

/**
 * Phát hiện cạnh nào vừa được cập nhật trọng số giữa frame trước và frame hiện tại
 */
export function detectUpdatedEdges(
  currentEdges: EdgeItem[],
  previousEdges?: EdgeItem[],
  currentVariables?: Record<string, any>
): EdgeUpdateInfo[] {
  const updates: EdgeUpdateInfo[] = [];

  // 1. So sánh trực tiếp trọng số cạnh giữa currentEdges và previousEdges
  if (previousEdges && previousEdges.length > 0) {
    const prevWeightMap = new Map<string, number | string>();
    previousEdges.forEach(e => {
      const key = getUndirectedEdgeKey(e.from, e.to);
      const w = e.weight ?? e.w ?? e.val ?? e.value;
      if (w !== undefined) prevWeightMap.set(key, w);
    });

    currentEdges.forEach(e => {
      const key = getUndirectedEdgeKey(e.from, e.to);
      const currW = e.weight ?? e.w ?? e.val ?? e.value;
      if (currW !== undefined && prevWeightMap.has(key)) {
        const prevW = prevWeightMap.get(key);
        if (String(prevW) !== String(currW)) {
          updates.push({
            edgeKey: key,
            from: String(e.from),
            to: String(e.to),
            oldWeight: prevW,
            newWeight: currW,
            description: `Cạnh (${e.from}, ${e.to}): ${prevW} ➔ ${currW}`
          });
        }
      }
    });
  }

  // 2. Kiểm tra nếu currentVariables có ghi rõ truy vấn cập nhật cạnh (u, v, w)
  if (currentVariables && updates.length === 0) {
    let u: string | undefined = undefined;
    let v: string | undefined = undefined;
    let w: string | number | undefined = undefined;

    for (const [key, val] of Object.entries(currentVariables)) {
      const k = key.toLowerCase();
      if (k === 'u' || k === 'from' || k === 'edge_u' || k === 'node1') u = String(val);
      if (k === 'v' || k === 'to' || k === 'edge_v' || k === 'node2') v = String(val);
      if (k === 'w' || k === 'weight' || k === 'new_weight' || k === 'c' || k === 'cost') w = val as any;
      if (k === 'updatededge' || k === 'edge_update' || k === 'query') {
        if (typeof val === 'object' && val !== null) {
          u = String(val.u ?? val.from ?? u);
          v = String(val.v ?? val.to ?? v);
          w = val.w ?? val.weight ?? val.newWeight ?? w;
        }
      }
    }

    if (u && v && w !== undefined) {
      const key = getUndirectedEdgeKey(u, v);
      updates.push({
        edgeKey: key,
        from: u,
        to: v,
        newWeight: w,
        description: `Truy vấn cập nhật (${u}, ${v}) = ${w}`
      });
    }
  }

  return updates;
}
