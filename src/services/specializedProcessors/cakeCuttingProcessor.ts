import { SimulationResult, Frame, GeoBox } from '../../types';

interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function rectArea(r: Rect): number {
  const w = Math.max(0, r.x2 - r.x1);
  const h = Math.max(0, r.y2 - r.y1);
  return w * h;
}

function intersectRect(r1: Rect, r2: Rect): Rect | null {
  const x1 = Math.max(r1.x1, r2.x1);
  const y1 = Math.max(r1.y1, r2.y1);
  const x2 = Math.min(r1.x2, r2.x2);
  const y2 = Math.min(r1.y2, r2.y2);
  if (x1 < x2 && y1 < y2) {
    return { x1, y1, x2, y2 };
  }
  return null;
}

/**
 * Trừ hình chữ nhật I ra khỏi R, trả về danh sách các hình chữ nhật con rời nhau
 */
function subtractRect(R: Rect, I: Rect): Rect[] {
  const inter = intersectRect(R, I);
  if (!inter) return [R];

  const pieces: Rect[] = [];

  // Dưới
  if (R.y1 < inter.y1) {
    pieces.push({ x1: R.x1, y1: R.y1, x2: R.x2, y2: inter.y1 });
  }
  // Trên
  if (inter.y2 < R.y2) {
    pieces.push({ x1: R.x1, y1: inter.y2, x2: R.x2, y2: R.y2 });
  }
  // Trái
  if (R.x1 < inter.x1) {
    pieces.push({ x1: R.x1, y1: inter.y1, x2: inter.x1, y2: inter.y2 });
  }
  // Phải
  if (inter.x2 < R.x2) {
    pieces.push({ x1: inter.x2, y1: inter.y1, x2: R.x2, y2: inter.y2 });
  }

  return pieces.filter(p => rectArea(p) > 0);
}

/**
 * Xử lý bài toán Cake Cutting (Cắt bánh chữ nhật)
 */
export function processCakeCutting(sim: SimulationResult, expectedOutput?: string): SimulationResult {
  if (!sim) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return sim;

  // Đọc T test cases
  let lineIdx = 0;
  let numTests = 1;

  const firstLineParts = lines[0].split(/\s+/);
  if (firstLineParts.length === 1 && !isNaN(parseInt(firstLineParts[0], 10)) && lines.length > 2) {
    numTests = parseInt(firstLineParts[0], 10);
    lineIdx = 1;
  }

  interface TestCase {
    w: number;
    h: number;
    q: number;
    cuts: { x: number; y: number; hor: string; ver: string }[];
  }

  const testCases: TestCase[] = [];

  while (lineIdx < lines.length && testCases.length < numTests) {
    const headerParts = lines[lineIdx].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (headerParts.length >= 3) {
      const w = headerParts[0];
      const h = headerParts[1];
      const q = headerParts[2];
      lineIdx++;

      const cuts: { x: number; y: number; hor: string; ver: string }[] = [];
      for (let i = 0; i < q && lineIdx < lines.length; i++, lineIdx++) {
        const cutParts = lines[lineIdx].split(/\s+/);
        if (cutParts.length >= 4) {
          cuts.push({
            x: Number(cutParts[0]),
            y: Number(cutParts[1]),
            hor: cutParts[2].toUpperCase(),
            ver: cutParts[3].toUpperCase()
          });
        }
      }
      testCases.push({ w, h, q, cuts });
    } else {
      lineIdx++;
    }
  }

  if (testCases.length === 0) return sim;

  const frames: Frame[] = [];
  let step = 0;
  const allOutputs: number[] = [];

  testCases.forEach((tc, tcIdx) => {
    const { w, h, q, cuts } = tc;
    const tcNum = tcIdx + 1;

    let cakePieces: Rect[] = [{ x1: 0, y1: 0, x2: w, y2: h }];
    const takenPieces: Rect[] = [];

    // Frame 0 của Test case: Chiếc bánh nguyên vẹn
    frames.push({
      step: step++,
      description: `Test Case ${tcNum}/${testCases.length}: Khởi tạo chiếc bánh hình chữ nhật kích thước ${w} × ${h} (tọa độ từ (0, 0) đến (${w}, ${h})). Tổng diện tích ban đầu = ${w * h}. Có ${q} người bạn chuẩn bị nhận bánh.`,
      geometryData: {
        boxes: [
          {
            id: `cake-${tcNum}`,
            x1: 0,
            y1: 0,
            x2: w,
            y2: h,
            label: `Bánh ban đầu (${w} × ${h})`,
            area: w * h,
            strokeColor: '#38bdf8',
            fillColor: 'rgba(56, 189, 248, 0.15)'
          }
        ],
        coordinateSystem: 'cartesian'
      },
      status: 'normal',
      variables: {
        'test_case': `${tcNum}/${testCases.length}`,
        'chiều_rộng_W': w,
        'chiều_cao_H': h,
        'tổng_diện_tích': w * h,
        'số_người_bạn': q
      }
    });

    // Duyệt qua từng người bạn và đường cắt
    cuts.forEach((cut, cIdx) => {
      const friendNum = cIdx + 1;
      const { x, y, hor, ver } = cut;

      // Góc phần tư cắt Q
      const qx1 = hor === 'R' ? x : 0;
      const qx2 = hor === 'R' ? w : x;
      const qy1 = ver === 'U' ? y : 0;
      const qy2 = ver === 'U' ? h : y;

      const cutQuadrant: Rect = { x1: qx1, y1: qy1, x2: qx2, y2: qy2 };

      // Tìm phần giao giữa góc phần tư cắt và các miếng bánh còn lại
      let receivedArea = 0;
      const newCakePieces: Rect[] = [];
      const newTakenThisStep: Rect[] = [];

      cakePieces.forEach(p => {
        const inter = intersectRect(p, cutQuadrant);
        if (inter) {
          receivedArea += rectArea(inter);
          newTakenThisStep.push(inter);
          // Cắt miếng inter ra khỏi miếng p
          const remainingFromP = subtractRect(p, inter);
          newCakePieces.push(...remainingFromP);
        } else {
          newCakePieces.push(p);
        }
      });

      cakePieces = newCakePieces;
      takenPieces.push(...newTakenThisStep);
      allOutputs.push(receivedArea);

      // Tạo các hộp để vẽ trên Canvas
      const boxes: GeoBox[] = [];

      // 1. Khung chiếc bánh tổng thể ban đầu (viền mờ)
      boxes.push({
        id: `outer-${friendNum}`,
        x1: 0,
        y1: 0,
        x2: w,
        y2: h,
        strokeColor: '#334155',
        fillColor: 'transparent',
        dashed: true
      });

      // 2. Các phần bánh đã lấy đi ở các bước trước
      takenPieces.slice(0, takenPieces.length - newTakenThisStep.length).forEach((tp, tpIdx) => {
        boxes.push({
          id: `taken-prev-${tpIdx}`,
          x1: tp.x1,
          y1: tp.y1,
          x2: tp.x2,
          y2: tp.y2,
          isTaken: true,
          fillColor: 'rgba(30, 41, 59, 0.7)',
          strokeColor: '#475569'
        });
      });

      // 3. Các miếng bánh còn lại sau bước cắt này
      cakePieces.forEach((cp, cpIdx) => {
        boxes.push({
          id: `remain-${cpIdx}`,
          x1: cp.x1,
          y1: cp.y1,
          x2: cp.x2,
          y2: cp.y2,
          fillColor: 'rgba(56, 189, 248, 0.18)',
          strokeColor: '#38bdf8',
          label: `Còn lại (${cp.x2 - cp.x1}×${cp.y2 - cp.y1})`,
          area: rectArea(cp)
        });
      });

      // 4. Miếng bánh vừa cắt được cho người bạn này (Highlight nổi bật)
      if (newTakenThisStep.length > 0) {
        newTakenThisStep.forEach((np, npIdx) => {
          boxes.push({
            id: `cut-now-${npIdx}`,
            x1: np.x1,
            y1: np.y1,
            x2: np.x2,
            y2: np.y2,
            highlight: true,
            isCut: true,
            fillColor: 'rgba(244, 63, 94, 0.45)',
            strokeColor: '#f43f5e',
            label: `Bạn ${friendNum} nhận`,
            area: `DT = ${receivedArea}`
          });
        });
      }

      // Các đường cắt (Segments) xuất phát từ (x, y)
      const segments: any[] = [];
      // Đường ngang (Horizontal cut)
      segments.push({
        id: `cut-h-${friendNum}`,
        x1: x,
        y1: y,
        x2: hor === 'R' ? w : 0,
        y2: y,
        color: 'rose',
        highlight: true,
        dashed: true,
        label: `Cắt ${hor === 'R' ? 'Phải' : 'Trái'}`
      });
      // Đường dọc (Vertical cut)
      segments.push({
        id: `cut-v-${friendNum}`,
        x1: x,
        y1: y,
        x2: x,
        y2: ver === 'U' ? h : 0,
        color: 'rose',
        highlight: true,
        dashed: true,
        label: `Cắt ${ver === 'U' ? 'Lên' : 'Xuống'}`
      });

      const totalRemain = cakePieces.reduce((acc, p) => acc + rectArea(p), 0);

      frames.push({
        step: step++,
        description: `Truy vấn ${friendNum}/${q} (Test ${tcNum}): Người bạn ${friendNum} chỉ vào điểm (${x}, ${y}) và yêu cầu 2 nhát cắt hướng ${hor === 'R' ? 'Phải (R)' : 'Trái (L)'} và ${ver === 'U' ? 'Lên (U)' : 'Xuống (D)'}:\n- Góc phần tư tạo thành: [${qx1}..${qx2}] × [${qy1}..${qy2}].\n- Phần bánh còn lại nằm trong góc phần tư này có DIỆN TÍCH = ${receivedArea}.\n=> BẠN ${friendNum} NHẬN ĐƯỢC: ${receivedArea} (Bánh còn lại: ${totalRemain}).`,
        geometryData: {
          points: [
            {
              id: `cut-pt-${friendNum}`,
              x,
              y,
              label: `(${x}, ${y})`,
              highlight: true,
              color: 'rose'
            }
          ],
          segments,
          boxes,
          coordinateSystem: 'cartesian'
        },
        status: receivedArea > 0 ? 'found' : 'normal',
        variables: {
          'người_bạn': `${friendNum}/${q}`,
          'điểm_cắt': `(${x}, ${y})`,
          'hướng_cắt': `${hor} ${ver}`,
          'diện_tích_nhận_được': receivedArea,
          'diện_tích_bánh_còn_lại': totalRemain
        }
      });
    });
  });

  const computedOutput = allOutputs.join('\n');

  return {
    ...sim,
    sampleOutput: computedOutput,
    viewType: 'geometry',
    subType: 'cake-cutting',
    visualizationSpec: {
      viewType: 'geometry',
      subType: 'cake-cutting'
    },
    frames
  };
}
