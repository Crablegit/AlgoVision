import { SimulationResult } from '../types';

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

export function getGeminiApiUrl(model: string = DEFAULT_GEMINI_MODEL): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model.trim()}:generateContent`;
}

/**
 * Kiểm tra xem Gemini API Key có hợp lệ hay không
 */
export async function testGeminiApiKey(apiKey: string, model: string = DEFAULT_GEMINI_MODEL): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${getGeminiApiUrl(model)}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'OK' }] }],
        generationConfig: { maxOutputTokens: 5 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { 
        valid: false, 
        error: errData?.error?.message || `Lỗi Gemini API (${res.status})` 
      };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || "Không thể kết nối tới Google Gemini API." };
  }
}

/**
 * Phân tích đề bài và trực quan hóa theo Input & Output mẫu (ưu tiên theo ô nhập của người dùng nếu có)
 */
export async function visualizeProblemExample(
  problemText: string,
  imageBase64: string | null,
  userSampleInput: string,
  userSampleOutput: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng nhập Gemini API Key của bạn trước khi tiếp tục.");
  }

  const systemInstruction = `
Bạn là công cụ trực quan hóa đề bài thi lập trình thi đấu (CP Problem Visualizer).
QUY TẮC BẮT BUỘC:
1. NẾU NGƯỜI DÙNG CUNG CẤP "Input mẫu" hoặc "Output mẫu":
   - BẮT BUỘC 100% PHẢI DÙNG CHÍNH XÁC DỮ LIỆU NÀY ĐỂ MÔ PHỎNG.
   - TUYỆT ĐỐI KHÔNG THAY ĐỔI, KHÔNG TỰ BỊA RA TEST KHÁC.
2. NẾU NGƯỜI DÙNG ĐỂ TRỐNG:
   - Hãy đọc đề bài (từ ảnh chụp hoặc văn bản) và trích xuất đúng Test ví dụ trong đề bài để mô phỏng.

3. QUY TẮC BẮT BUỘC VỀ ĐA TEST CASE / NHIỀU TRUY VẤN (T >= 2 HOẶC INPUT CÓ NHIỀU TEST):
   - Nếu Input mẫu chứa NHIỀU TEST CASE (ví dụ: dòng đầu là số lượng test T >= 2, hoặc Input gồm nhiều khối test tương ứng với nhiều dòng trong Output mẫu):
     + BẮT BUỘC 100% PHẢI MÔ PHỎNG LẦN LƯỢT TẤT CẢ CÁC TEST CASE / TRUY VẤN ĐÓ TRONG DANH SÁCH "frames".
     + TUYỆT ĐỐI NGHIÊM CẤM CHỈ CHẠY TEST CASE 1 RỒI DỪNG LẠI!
     + Quy trình mô phỏng đa test case:
       1. Mô phỏng chi tiết Test Case 1 cho đến khi đạt được kết quả của Test Case 1 (dòng 1 của Output mẫu).
       2. Ngay sau khi Test Case 1 kết thúc, tạo một frame chuyển tiếp rõ ràng:
          * "description": "=== HOÀN THÀNH TEST 1. BẮT ĐẦU TEST CASE 2: <thông số test 2> ==="
          * Cập nhật "elements" (hoặc "grid", "nodes", "edges") sang dữ liệu mới của Test Case 2.
          * Reset lại các biến "variables", "pointers", "highlights" theo Test Case 2.
       3. Tiếp tục mô phỏng từng bước của Test Case 2 cho đến khi ra kết quả của Test Case 2 (dòng 2 của Output mẫu).
       4. Nếu có Test Case 3, 4: Lặp lại tương tự cho đến khi hoàn thành toàn bộ tất cả các test case trong Input!

4. QUY TẮC VỀ CON TRỎ (pointers):
   - CHỈ THÊM "pointers" khi thuật toán THỰC SỰ SỬ DỤNG CON TRỎ (ví dụ: thuật toán Hai con trỏ Two Pointers có biến left/right rõ ràng di chuyển, hoặc Binary Search có low/mid/high).
   - NẾU BÀI TOÁN HOẶC BƯỚC NÀY KHÔNG DÙNG ĐẾN CON TRỎ (ví dụ: bài toán mảng thông thường, quy hoạch động, prefix sum, biến đổi mảng, đồ thị...):
     TUYỆT ĐỐI ĐỂ TRỐNG: "pointers": {}
     TUYỆT ĐỐI KHÔNG TỰ ĐỘNG ĐÚT "left", "right" VÀO KHI ĐỀ KHÔNG DÙNG ĐẾN!

5. XÁC ĐỊNH viewType TRỰC QUAN HÓA TỐI ƯU (CHỈ CHỌN 1 TRONG CÁC TỪ KHÓA SAU):
   - "graph": Dành cho mọi bài toán ĐỒ THỊ và DSU (Tập hợp rời nhau / Các thùng nước / Bình thông nhau / Thành phần liên thông, Dijkstra/BFS, chu trình).
     + BẮT BUỘC VỚI BÀI TOÁN DSU (MỞ VAN / HỢP NHẤT / KIỂM TRA LIÊN THÔNG):
       * KHI MỞ VAN / NỐI (Union X và Y):
         - BẮT BUỘC thêm cạnh { "from": "X", "to": "Y" } vào "edges".
         - TUYỆT ĐỐI KHÔNG ĐƯỢC XÓA CẠNH NÀY Ở CÁC BƯỚC SAU! Mọi cạnh đã mở van từ trước PHẢI ĐƯỢC GIỮ LẠI ĐẦY ĐỦ trong "edges" của tất cả các frame sau (đồ thị tích lũy dần các cạnh).
         - Các đỉnh thuộc cùng một thành phần liên thông gán cùng một "group" (để hiển thị cùng màu nhóm).
       * KHI KIỂM TRA LIÊN THÔNG (Check X và Y):
         - Đánh dấu "highlight": true cho đỉnh X và Y.
         - NẾU LIÊN THÔNG (Output: 1): Gán "color": "emerald" cho X, Y và các cạnh nối giữa chúng. Ghi rõ trong description: "ĐÃ LIÊN THÔNG -> Output: 1".
         - NẾU KHÔNG LIÊN THÔNG (Output: 0): Gán "color": "rose" cho X, Y. Ghi rõ trong description: "KHÔNG LIÊN THÔNG -> Output: 0".
         - TẤT CẢ CÁC CẠNH ĐÃ MỞ VAN TRƯỚC ĐÓ VẪN PHẢI ĐƯỢC GIỮ NGUYÊN trong "edges"!
     + MỌI FRAME đều PHẢI chứa mảng "nodes" (đủ tất cả các đỉnh) và mảng "edges" (đủ tất cả các cạnh tích lũy).
     + Ở mỗi bước, đỉnh và cạnh nào đang được xét hoặc thuộc đường đi hiện tại thì đặt "highlight": true.
     + Các đỉnh/cạnh khác đặt "highlight": false. TUYỆT ĐỐI KHÔNG BỎ TRỐNG "nodes" hay "edges" ở các frame sau.
   - "tree": BẮT BUỘC DÙNG khi đề bài nói về CÂY (tree, rooted tree, binary tree, cây có gốc, LCA, cây con, đường đi trên cây, đổi gốc - rerooting, v.v.).
     + ĐỈNH GỐC (rootId): Đọc kỹ đề bài để xác định gốc là đỉnh nào. Nếu có đổi gốc (rerooting) thì đặt "rootId" thành đỉnh gốc mới.
     + BẮT BUỘC: Nếu cây có N đỉnh, mảng "nodes" PHẢI chứa ĐỦ TẤT CẢ N đỉnh (từ 1 đến N), và mảng "edges" PHẢI chứa ĐỦ TẤT CẢ N-1 cạnh.
   - "grid": Dành cho bài toán BẢNG 2D / MA TRẬN / TÌM ĐƯỜNG ĐI TRÊN LƯỚI / ROBOT TRÊN SÀN.
   - "intervals": Nếu là các đoạn thẳng trên trục số, bài toán phủ đoạn, khoảng thời gian [start, end].
   - "circular": Nếu là vòng tròn, mảng xoay vòng, bài toán Josephus.
   - "array": Nếu là mảng 1D thông thường, 2 con trỏ, binary search.

6. QUY TẮC MÔ PHỎNG CHI TIẾT TỪNG BƯỚC:
   - KHOẢNG BƯỚC HỮU HẠN (<= 20 BƯỚC): BẮT BUỘC 100% PHẢI TẠO ĐỦ TẤT CẢ CÁC BƯỚC LIÊN TỤC TỪ 0 ĐẾN KẾT QUẢ. TUYỆT ĐỐI KHÔNG ĐƯỢC NHẢY CÓC.
   - NẾU SỐ BƯỚC LỚN HƠN 20: Mô phỏng khoảng 8 - 15 bước tiêu biểu nhất.
7. TUYỆT ĐỐI KHÔNG phân tích thuật toán, KHÔNG giảng giải độ phức tạp O(n).

Trả về định dạng JSON DUY NHẤT theo schema sau:
{
  "problemTitle": "Tên bài toán",
  "problemSummary": "Tóm tắt ngắn gọn yêu cầu",
  "tags": ["Tree", "DFS", ...],
  "sampleInput": "Nội dung Input mẫu",
  "sampleOutput": "Nội dung Output mẫu",
  "viewType": "tree" | "grid" | "intervals" | "graph" | "circular" | "array",
  "rootId": "id_của_đỉnh_gốc_nếu_là_cây",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả bước này bằng tiếng Việt",
      "rootId": "id_của_đỉnh_gốc_nếu_là_cây",
      "grid": [["V", "W"], ["P", "Q"]],
      "selectedBox": {"r1": 0, "c1": 0, "r2": 1, "c2": 1},
      "cellHighlights": [{"r": 0, "c": 1, "status": "found"}],
      "intervals": [{"id": "1", "label": "Đoạn [1, 5]", "start": 1, "end": 5, "highlight": true}],
      "axisRange": {"min": 0, "max": 10},
      "nodes": [{"id": "1", "label": "1", "weight": 10, "highlight": true}],
      "edges": [{"from": "1", "to": "2", "weight": 5, "highlight": true}],
      "elements": [1, 2, 3],
      "highlights": [0, 1],
      "pointers": {},
      "variables": {"diện_tích": 25}
    }
  ]
}
`;

  const parts: any[] = [{ text: systemInstruction }];

  if (imageBase64) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  let promptContent = "";
  if (userSampleInput) {
    promptContent += `INPUT MẪU NGƯỜI DÙNG CUNG CẤP (BẮT BUỘC DÙNG TEST NÀY):\n${userSampleInput}\n\n`;
  }
  if (userSampleOutput) {
    promptContent += `OUTPUT MẪU NGƯỜI DÙNG CUNG CẤP (BẮT BUỘC KẾT THÚC VỚI KẾT QUẢ NÀY):\n${userSampleOutput}\n\n`;
  }
  promptContent += `LƯU Ý QUAN TRỌNG:
- NẾU INPUT CÓ NHIỀU TEST CASE (T >= 2 hoặc nhiều bộ dữ liệu): BẮT BUỘC mô phỏng LẦN LƯỢT TẤT CẢ các test case trong danh sách frames (hết test 1 thì tạo frame chuyển tiếp sang test 2 và chạy tiếp). TUYỆT ĐỐI KHÔNG dừng lại sau test 1!
- CHỈ thêm pointers khi đề bài/thuật toán thực sự cần con trỏ. Nếu không dùng con trỏ, để trống pointers: {}.\n\n`;

  if (problemText && problemText.trim()) {
    promptContent += `NỘI DUNG ĐỀ BÀI HOẶC GHI CHÚ:\n${problemText.trim()}`;
  } else if (!userSampleInput) {
    promptContent += `Hãy đọc đề bài từ hình ảnh đính kèm, trích xuất đúng Test ví dụ 1 (Input 1 & Output 1) và mô phỏng chính xác test đó.`;
  }

  parts.push({ text: promptContent });

  try {
    const res = await fetch(`${getGeminiApiUrl(model)}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi Gemini API (${res.status})`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) throw new Error("Không nhận được phản hồi từ Gemini.");

    const parsed: SimulationResult = JSON.parse(rawText);
    return ensureFullSimulationSteps(parsed);
  } catch (error: any) {
    console.error("Lỗi trực quan hóa:", error);
    throw error;
  }
}

/**
 * Trực quan hóa Custom Test Case do người dùng tự nhập
 */
export async function visualizeCustomTest(
  problemTitle: string,
  problemSummary: string,
  viewType: string,
  customTestInput: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng nhập Gemini API Key.");
  }

  const prompt = `
Bài toán: "${problemTitle}"
Mô tả: "${problemSummary}"
Dạng trực quan hóa (viewType): "${viewType}"

Người dùng muốn mô phỏng với CUSTOM TEST CASE sau:
${customTestInput}

QUY TẮC MÔ PHỎNG:
- NẾU INPUT CÓ NHIỀU TEST CASE (T >= 2 hoặc nhiều bộ test/truy vấn): BẮT BUỘC mô phỏng LẦN LƯỢT TẤT CẢ các test case trong danh sách frames (hết test 1 thì chuyển sang test 2 và chạy tiếp). TUYỆT ĐỐI KHÔNG dừng lại sau test 1!
- Nếu số bước hữu hạn và dưới 20 bước: BẮT BUỘC 100% PHẢI MÔ TẢ ĐẦY ĐỦ TỪNG BƯỚC MỘT (t=0, t=1, t=2... đến kết quả). TUYỆT ĐỐI KHÔNG ĐƯỢC NHẢY CÓC!
- Nếu số bước lớn (> 20): Mô phỏng khoảng 8 - 15 bước tiêu biểu.
- CHỈ thêm pointers khi thuật toán dùng con trỏ. Nếu không dùng con trỏ, để trống pointers: {}.

Hãy mô phỏng từng bước test này theo đúng định dạng "${viewType}" và trả về JSON:
{
  "problemTitle": "${problemTitle}",
  "problemSummary": "${problemSummary}",
  "tags": ["Custom-Test"],
  "sampleInput": "${customTestInput}",
  "sampleOutput": "Kết quả tương ứng",
  "viewType": "${viewType}",
  "rootId": "id_của_đỉnh_gốc_nếu_là_cây",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả bước này bằng tiếng Việt",
      "rootId": "id_của_đỉnh_gốc_nếu_là_cây",
      "grid": ...,
      "selectedBox": ...,
      "cellHighlights": ...,
      "intervals": ...,
      "nodes": ...,
      "edges": ...,
      "elements": ...,
      "highlights": ...,
      "pointers": {},
      "variables": ...
    }
  ]
}
`;

  try {
    const res = await fetch(`${getGeminiApiUrl(model)}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi Gemini API (${res.status})`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed: SimulationResult = JSON.parse(rawText);
    return ensureFullSimulationSteps(parsed);
  } catch (error: any) {
    console.error("Lỗi custom test:", error);
    throw error;
  }
}

/**
 * Tìm tất cả các đường đi hợp lệ từ (1, 1) đến (m, n) chỉ đi sang phải hoặc xuống dưới, tránh ô cấm
 */
function findGridPaths(
  m: number,
  n: number,
  obstacles: Set<string>,
  maxPaths: number = 15
): { r: number; c: number }[][] {
  const allPaths: { r: number; c: number }[][] = [];

  function dfs(r: number, c: number, currentPath: { r: number; c: number }[]) {
    if (allPaths.length >= maxPaths) return;
    if (r === m && c === n) {
      allPaths.push([...currentPath]);
      return;
    }

    // Đi sang phải: (r, c + 1)
    if (c + 1 <= n && !obstacles.has(`${r},${c + 1}`)) {
      currentPath.push({ r: r, c: c + 1 });
      dfs(r, c + 1, currentPath);
      currentPath.pop();
    }

    // Đi xuống dưới: (r + 1, c)
    if (r + 1 <= m && !obstacles.has(`${r + 1},${c}`)) {
      currentPath.push({ r: r + 1, c: c });
      dfs(r + 1, currentPath);
      currentPath.pop();
    }
  }

  if (!obstacles.has('1,1') && !obstacles.has(`${m},${n}`)) {
    dfs(1, 1, [{ r: 1, c: 1 }]);
  }

  return allPaths;
}

/**
 * Tự động phân tách và tạo hoạt ảnh từng bước cho các đường đi trên lưới (Grid Pathfinding)
 * Với mỗi cách đi: Biểu diễn lại con robot đi những ô nào, tích màu đường đi đó.
 * Khi chuyển sang cách đi mới: Xóa đường đi cũ đi, robot đi lại từ đầu từ (1, 1).
 */
function expandGridPathSimulation(sim: SimulationResult): SimulationResult {
  if (!sim) return sim;

  // 1. Xác định kích thước lưới m x n và tập các ô cấm từ sampleInput hoặc frames
  let m = 0, n = 0;
  const obstacles = new Set<string>();

  const inLines = (sim.sampleInput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (inLines.length > 0) {
    const firstParts = inLines[0].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (firstParts.length >= 2) {
      m = firstParts[0];
      n = firstParts[1];
    }
    for (let i = 1; i < inLines.length; i++) {
      const parts = inLines[i].split(/\s+/).map(Number).filter(v => !isNaN(v));
      if (parts.length >= 2) {
        obstacles.add(`${parts[0]},${parts[1]}`);
      }
    }
  }

  if (m === 0 || n === 0) {
    for (const f of sim.frames || []) {
      if (f.grid && f.grid.length > 0) {
        m = f.grid.length;
        n = f.grid[0]?.length || 0;
        for (let r = 0; r < m; r++) {
          for (let c = 0; c < n; c++) {
            const val = String(f.grid[r][c]);
            if (val === 'X' || val === 'x' || val === '#' || val === 'B') {
              obstacles.add(`${r + 1},${c + 1}`);
            }
          }
        }
        break;
      }
    }
  }

  // 2. Tìm danh sách các đường đi
  let paths: { r: number; c: number }[][] = [];

  // Cách A: Nếu m, n hợp lệ và là bài toán robot tìm đường trên lưới (chỉ sang phải hoặc xuống dưới)
  const isGridPathProblem = 
    (sim.problemTitle + ' ' + sim.problemSummary + ' ' + (sim.tags || []).join(' ')).toLowerCase().includes('đường đi') ||
    (sim.problemTitle + ' ' + sim.problemSummary).toLowerCase().includes('robot') ||
    (sim.problemTitle + ' ' + sim.problemSummary).toLowerCase().includes('lưới') ||
    sim.viewType === 'grid';

  if (isGridPathProblem && m > 0 && n > 0 && m <= 25 && n <= 25) {
    paths = findGridPaths(m, n, obstacles, 15);
  }

  // Cách B: Nếu cách A không sinh được (hoặc đề có quy tắc di chuyển khác), thử trích xuất từ frames của AI
  if (paths.length === 0 && sim.frames) {
    for (let i = 0; i < sim.frames.length; i++) {
      const f = sim.frames[i];
      const desc = f.description || '';
      const coordRegex = /(?:\(|\b)(\d+)\s*,\s*(\d+)(?:\)|\b)/g;
      const coords: { r: number; c: number }[] = [];
      let match;
      while ((match = coordRegex.exec(desc)) !== null) {
        const r = parseInt(match[1], 10);
        const c = parseInt(match[2], 10);
        if (!isNaN(r) && !isNaN(c)) {
          coords.push({ r, c });
        }
      }
      if (coords.length >= 3) {
        paths.push(coords);
      }
    }
  }

  if (paths.length === 0 || m === 0 || n === 0) return sim;

  // 3. Xây dựng chuỗi hoạt ảnh từng bước cho từng cách đi
  // Mỗi cách đi có 1 màu riêng trong bảng màu phong phú (Xanh lá, Xanh lam, Tím, Vàng cam)
  const PATH_PALETTES = ['emerald', 'sky', 'purple', 'amber'];
  const expandedFrames: any[] = [];
  let currentStep = 0;

  // Frame 0: Khởi tạo lưới ban đầu
  const initialGrid: string[][] = [];
  const initialHighlights: any[] = [];
  for (let r = 1; r <= m; r++) {
    const row: string[] = [];
    for (let c = 1; c <= n; c++) {
      if (obstacles.has(`${r},${c}`)) {
        row.push('X');
        initialHighlights.push({ r: r - 1, c: c - 1, status: 'blocked' });
      } else if (r === 1 && c === 1) {
        row.push('🤖');
        initialHighlights.push({ r: 0, c: 0, status: 'robot' });
      } else {
        row.push('·');
      }
    }
    initialGrid.push(row);
  }

  expandedFrames.push({
    step: currentStep++,
    description: `Khởi tạo lưới ${m} x ${n} với ${obstacles.size} ô cấm (màu đỏ). Robot bắt đầu tại ô xuất phát (1, 1). Có tất cả ${paths.length} cách đi thỏa mãn.`,
    grid: initialGrid,
    cellHighlights: initialHighlights,
    variables: {
      'kích_thước': `${m}x${n}`,
      'số_ô_cấm': obstacles.size,
      'tổng_số_cách_đi': paths.length
    }
  });

  // Duyệt qua từng cách đi
  paths.forEach((coords, pIdx) => {
    const pathNum = pIdx + 1;
    const pathColor = PATH_PALETTES[pIdx % PATH_PALETTES.length];

    for (let s = 0; s < coords.length; s++) {
      const curPt = coords[s];
      const prevPt = s > 0 ? coords[s - 1] : null;
      const stepGrid: string[][] = [];
      const cellHighlights: any[] = [];

      for (let r = 1; r <= m; r++) {
        const row: string[] = [];
        for (let c = 1; c <= n; c++) {
          const key = `${r},${c}`;
          if (obstacles.has(key)) {
            row.push('X');
            cellHighlights.push({ r: r - 1, c: c - 1, status: 'blocked' });
          } else if (r === curPt.r && c === curPt.c) {
            row.push('🤖');
            cellHighlights.push({ r: r - 1, c: c - 1, status: 'robot' });
          } else {
            // Kiểm tra xem ô này có thuộc các bước trước của CÁCH ĐI HIỆN TẠI không
            let visitedInCurrentPath = false;
            for (let prev = 0; prev < s; prev++) {
              if (coords[prev].r === r && coords[prev].c === c) {
                visitedInCurrentPath = true;
                break;
              }
            }

            if (visitedInCurrentPath) {
              row.push('✓');
              cellHighlights.push({ r: r - 1, c: c - 1, status: 'path', color: pathColor });
            } else {
              row.push('·');
            }
          }
        }
        stepGrid.push(row);
      }

      let desc = '';
      if (s === 0) {
        desc = `Cách đi ${pathNum}/${paths.length}: Xóa đường đi cũ, robot bắt đầu lại từ ô xuất phát (${curPt.r}, ${curPt.c}).`;
      } else if (s === coords.length - 1) {
        desc = `Cách đi ${pathNum}/${paths.length}: Robot đã tới đích (${curPt.r}, ${curPt.c}) thành công! Tìm thấy cách đi thứ ${pathNum}.`;
      } else {
        let dir = 'tiếp tục';
        if (prevPt) {
          if (curPt.r === prevPt.r + 1) dir = 'xuống dưới';
          else if (curPt.c === prevPt.c + 1) dir = 'sang phải';
        }
        desc = `Cách đi ${pathNum}/${paths.length} (bước ${s + 1}/${coords.length}): Robot đi ${dir} đến (${curPt.r}, ${curPt.c}).`;
      }

      expandedFrames.push({
        step: currentStep++,
        description: desc,
        grid: stepGrid,
        cellHighlights,
        variables: {
          'đang_duyệt': `Cách đi ${pathNum}/${paths.length}`,
          'vị_trí_robot': `(${curPt.r}, ${curPt.c})`,
          'bước_hiện_tại': `${s + 1}/${coords.length}`,
          'màu_đường_đi': pathColor
        }
      });
    }
  });

  return {
    ...sim,
    viewType: 'grid',
    frames: expandedFrames
  };
}

/**
 * Tự động mô phỏng chuẩn xác từng thao tác cho bài toán DSU (Các thùng nước / Bình thông nhau / Union-Find)
 * - Thao tác 1 (Nối / Mở van): Thêm cạnh nối mới vào đồ thị và KHÔNG BAO GIỜ XÓA ĐI ở các bước sau (tích lũy cạnh).
 * - Thao tác 2 (Kiểm tra liên thông): Tô màu xanh lá (emerald) nếu ĐÃ LIÊN THÔNG (output 1) hoặc đỏ (rose) nếu KHÔNG LIÊN THÔNG (output 0).
 */
function expandDsuSimulation(sim: SimulationResult): SimulationResult {
  if (!sim) return sim;

  const titleSummary = (sim.problemTitle + ' ' + sim.problemSummary + ' ' + (sim.tags || []).join(' ')).toLowerCase();
  const isDsuProblem = titleSummary.includes('thùng nước') ||
                       titleSummary.includes('dsu') ||
                       titleSummary.includes('bình thông') ||
                       titleSummary.includes('disjoint set') ||
                       titleSummary.includes('union-find') ||
                       titleSummary.includes('liên thông');

  const rawInput = (sim.sampleInput || '').trim();
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return sim;

  // Trích xuất các truy vấn DSU (u, v, type)
  const queries: { u: number; v: number; type: number }[] = [];
  let maxNode = 0;

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (parts.length === 3) {
      let u = 0, v = 0, type = 0;
      if (parts[2] === 1 || parts[2] === 2) {
        u = parts[0];
        v = parts[1];
        type = parts[2];
      } else if (parts[0] === 1 || parts[0] === 2) {
        type = parts[0];
        u = parts[1];
        v = parts[2];
      }

      if (type === 1 || type === 2) {
        queries.push({ u, v, type });
        if (u > maxNode) maxNode = u;
        if (v > maxNode) maxNode = v;
      }
    }
  }

  // Nếu không có ít nhất 2 truy vấn dạng DSU thì bỏ qua
  if (queries.length < 2 && !isDsuProblem) return sim;
  if (maxNode === 0) return sim;

  // Khởi tạo cấu trúc DSU
  const parent: number[] = [];
  for (let i = 0; i <= maxNode; i++) parent.push(i);

  function find(i: number): number {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(i: number, j: number) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  }

  // Danh sách cạnh tích lũy (CÁC CẠNH ĐÃ NỐI TỒN TẠI SUỐT QUÁ TRÌNH, KHÔNG BAO GIỜ BỊ XÓA)
  const accumulatedEdges: { from: string; to: string }[] = [];
  const frames: any[] = [];
  let currentStep = 0;

  // Frame 0: Khởi tạo các thùng nước ban đầu (mỗi thùng là 1 nhóm độc lập)
  const initialNodes: any[] = [];
  for (let i = 1; i <= maxNode; i++) {
    initialNodes.push({
      id: String(i),
      label: `Thùng ${i}`,
      group: i,
      highlight: false
    });
  }

  frames.push({
    step: currentStep++,
    description: `Khởi tạo trạng thái ban đầu: Có ${maxNode} thùng nước độc lập (từ 1 đến ${maxNode}). Tất cả các van đều đang ĐÓNG (chưa có đường ống nối thông nào).`,
    nodes: initialNodes,
    edges: [],
    variables: {
      'tổng_số_thùng': maxNode,
      'số_van_đang_mở': 0,
      'trạng_thái': 'Tất cả van đang đóng'
    }
  });

  // Duyệt qua từng yêu cầu/truy vấn
  queries.forEach((q, qIdx) => {
    const uStr = String(q.u);
    const vStr = String(q.v);

    if (q.type === 1) {
      // THAO TÁC LOẠI 1: MỞ VAN NỐI u VÀ v (UNION)
      union(q.u, q.v);

      // Thêm cạnh mới vào danh sách tích lũy nếu chưa tồn tại
      const edgeExists = accumulatedEdges.some(
        e => (e.from === uStr && e.to === vStr) || (e.from === vStr && e.to === uStr)
      );
      if (!edgeExists) {
        accumulatedEdges.push({ from: uStr, to: vStr });
      }

      // Cập nhật đỉnh với group mới của DSU
      const currentNodes = [];
      for (let i = 1; i <= maxNode; i++) {
        const isTarget = (i === q.u || i === q.v);
        currentNodes.push({
          id: String(i),
          label: `Thùng ${i}`,
          group: find(i),
          highlight: isTarget,
          color: isTarget ? 'sakura' : undefined
        });
      }

      // Cạnh vừa nối được highlight sakura, các cạnh cũ vẫn giữ nguyên
      const currentEdges = accumulatedEdges.map(e => {
        const isNew = (e.from === uStr && e.to === vStr) || (e.from === vStr && e.to === uStr);
        return {
          from: e.from,
          to: e.to,
          highlight: isNew,
          color: isNew ? 'sakura' : undefined
        };
      });

      frames.push({
        step: currentStep++,
        description: `Yêu cầu ${qIdx + 1} (${q.u} ${q.v} 1): MỞ VAN nối giữa thùng ${q.u} và thùng ${q.v}. Hai thùng này giờ đã thông nhau và thuộc cùng Nhóm ${find(q.u)}.`,
        nodes: currentNodes,
        edges: currentEdges,
        variables: {
          'yêu_cầu': `Mở van (${q.u}, ${q.v})`,
          'số_van_đang_mở': accumulatedEdges.length,
          'nhóm_bình_thông': `Thùng ${q.u} & ${q.v} -> Nhóm ${find(q.u)}`
        }
      });
    } else {
      // THAO TÁC LOẠI 2: KIỂM TRA LIÊN THÔNG u VÀ v (FIND / CHECK)
      const connected = (find(q.u) === find(q.v));
      const resultVal = connected ? 1 : 0;

      // Giữ nguyên toàn bộ các cạnh đã mở từ trước!
      // Nếu liên thông: tô màu xanh lá (emerald) cho u, v
      // Nếu chưa liên thông: tô màu đỏ (rose) cho u, v
      const currentNodes = [];
      for (let i = 1; i <= maxNode; i++) {
        const isTarget = (i === q.u || i === q.v);
        let nodeColor: string | undefined = undefined;
        if (isTarget) {
          nodeColor = connected ? 'emerald' : 'rose';
        }

        currentNodes.push({
          id: String(i),
          label: `Thùng ${i}`,
          group: find(i),
          highlight: isTarget,
          color: nodeColor
        });
      }

      const currentEdges = accumulatedEdges.map(e => {
        const uRoot = find(q.u);
        const eRoot = find(Number(e.from));
        const isInSameComp = (connected && eRoot === uRoot);
        return {
          from: e.from,
          to: e.to,
          highlight: isInSameComp,
          color: isInSameComp ? 'emerald' : undefined
        };
      });

      const desc = connected
        ? `Yêu cầu ${qIdx + 1} (${q.u} ${q.v} 2): KIỂM TRA thùng ${q.u} và thùng ${q.v} -> ĐÃ LIÊN THÔNG (cùng Nhóm ${find(q.u)}). Nước có thể lưu thông giữa 2 thùng -> OUTPUT: 1.`
        : `Yêu cầu ${qIdx + 1} (${q.u} ${q.v} 2): KIỂM TRA thùng ${q.u} và thùng ${q.v} -> CHƯA LIÊN THÔNG (Thùng ${q.u} thuộc Nhóm ${find(q.u)}, thùng ${q.v} thuộc Nhóm ${find(q.v)}). Chưa có đường van thông nhau -> OUTPUT: 0.`;

      frames.push({
        step: currentStep++,
        description: desc,
        nodes: currentNodes,
        edges: currentEdges,
        variables: {
          'yêu_cầu': `Kiểm tra (${q.u}, ${q.v})`,
          'kết_quả': resultVal,
          'trạng_thái': connected ? '✓ ĐÃ LIÊN THÔNG (1)' : '✕ CHƯA LIÊN THÔNG (0)'
        }
      });
    }
  });

  return {
    ...sim,
    viewType: 'graph',
    frames
  };
}

/**
 * Tự động bù và mô phỏng các test case tiếp theo nếu Input mẫu có nhiều test case (T >= 2)
 * mà AI chỉ mới mô phỏng Test 1 rồi dừng lại.
 */
function expandMultiTestCaseSimulation(sim: SimulationResult): SimulationResult {
  if (!sim || !sim.frames || sim.frames.length === 0) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 3) return sim;

  // Kiểm tra nếu dòng đầu tiên là số lượng test case T >= 2
  const firstNum = parseInt(lines[0], 10);
  if (isNaN(firstNum) || firstNum < 2 || lines[0].trim().split(/\s+/).length > 1) {
    return sim;
  }

  // Kiểm tra xem trong frames đã có Test 2 hay chưa
  const hasTest2 = sim.frames.some(f => {
    const desc = (f.description || '').toLowerCase();
    return desc.includes('test 2') || desc.includes('test case 2') || desc.includes('truy vấn 2');
  });

  if (hasTest2) return sim;

  const outLines = (sim.sampleOutput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);

  // Phân tích các khối test case trong Input
  const parsedTests: { n?: number; s?: number; arr: number[]; expectedOut?: string }[] = [];
  let lineIdx = 1;

  while (lineIdx < lines.length) {
    const p1 = lines[lineIdx].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (lineIdx + 1 < lines.length) {
      const p2 = lines[lineIdx + 1].split(/\s+/).map(Number).filter(v => !isNaN(v));
      if (p2.length >= 2 || (p1.length <= 2 && p2.length >= (p1[0] || 0))) {
        parsedTests.push({
          n: p1[0],
          s: p1[1],
          arr: p2,
          expectedOut: outLines[parsedTests.length]
        });
        lineIdx += 2;
        continue;
      }
    }

    if (p1.length >= 2) {
      parsedTests.push({
        arr: p1,
        expectedOut: outLines[parsedTests.length]
      });
    }
    lineIdx++;
  }

  if (parsedTests.length < 2) return sim;

  // Bổ sung các frame cho Test Case 2 trở đi
  const newFrames = [...sim.frames];
  let curStep = newFrames.length;

  for (let t = 1; t < parsedTests.length; t++) {
    const tc = parsedTests[t];
    const tcNum = t + 1;
    const expected = tc.expectedOut || (outLines[t] ? outLines[t] : '');

    // Frame 1 của test case t: Khởi tạo test case mới
    newFrames.push({
      step: curStep++,
      description: `=== BẮT ĐẦU TEST CASE ${tcNum}: n = ${tc.n || tc.arr.length}${tc.s !== undefined ? `, s = ${tc.s}` : ''}, mảng ban đầu = [${tc.arr.join(', ')}] ===`,
      elements: tc.arr,
      highlights: [],
      pointers: {},
      variables: {
        'test_case': `${tcNum}/${parsedTests.length}`,
        'n': tc.n || tc.arr.length,
        ...(tc.s !== undefined ? { 's': tc.s } : {})
      }
    });

    // Nếu có tham số s (như bài Trò chơi xóa số)
    if (tc.s !== undefined) {
      const sumAll = tc.arr.reduce((a, b) => a + b, 0);
      if (sumAll < tc.s) {
        newFrames.push({
          step: curStep++,
          description: `Test Case ${tcNum}: Tính tổng các phần tử trong mảng: tổng = ${sumAll}. Vì tổng toàn mảng (${sumAll}) nhỏ hơn s (${tc.s}), nên không thể chọn hoặc xóa phần tử nào để đạt tổng bằng ${tc.s} -> KẾT QUẢ: -1.`,
          elements: tc.arr,
          highlights: tc.arr.map((_, idx) => idx),
          status: 'done',
          pointers: {},
          variables: {
            'test_case': `${tcNum}/${parsedTests.length}`,
            'tổng_mảng': sumAll,
            's': tc.s,
            'kết_quả': -1
          }
        });
      } else {
        newFrames.push({
          step: curStep++,
          description: `Test Case ${tcNum}: Mô phỏng mảng [${tc.arr.join(', ')}] với mục tiêu tổng s = ${tc.s}. Kết quả đạt được là ${expected || 'hoàn thành'}.`,
          elements: tc.arr,
          highlights: tc.arr.map((_, idx) => idx),
          status: 'done',
          pointers: {},
          variables: {
            'test_case': `${tcNum}/${parsedTests.length}`,
            'kết_quả': expected || 'hoàn thành'
          }
        });
      }
    } else {
      newFrames.push({
        step: curStep++,
        description: `Test Case ${tcNum}: Mô phỏng hoàn tất với mảng [${tc.arr.join(', ')}]. Kết quả: ${expected || 'hoàn thành'}.`,
        elements: tc.arr,
        highlights: tc.arr.map((_, idx) => idx),
        status: 'done',
        pointers: {},
        variables: {
          'test_case': `${tcNum}/${parsedTests.length}`,
          'kết_quả': expected || 'hoàn thành'
        }
      });
    }
  }

  return {
    ...sim,
    frames: newFrames
  };
}

/**
 * Tự động bù và mở rộng đầy đủ các bước nếu bài toán có số bước hữu hạn <= 20
 * mà AI nhảy cóc hoặc sinh thiếu (ví dụ: chỉ sinh giây 1, 2 rồi nhảy thẳng sang giây 9)
 */
function ensureFullSimulationSteps(sim: SimulationResult): SimulationResult {
  if (!sim || !sim.frames || sim.frames.length === 0) return sim;

  // 1. Kiểm tra mở rộng đa test case (nếu input có T >= 2 mà frames chỉ mới có test 1)
  sim = expandMultiTestCaseSimulation(sim);

  // 2. Kiểm tra mở rộng bài toán DSU (Các thùng nước / Union-Find)
  const expandedDsu = expandDsuSimulation(sim);
  if (expandedDsu !== sim && expandedDsu.frames && expandedDsu.frames.length > 0) {
    return expandedDsu;
  }

  // 3. Kiểm tra mở rộng đường đi trên lưới (Grid Pathfinding)
  const expandedGridPath = expandGridPathSimulation(sim);
  if (expandedGridPath !== sim && expandedGridPath.frames && expandedGridPath.frames.length > 0) {
    return expandedGridPath;
  }

  // 2. Kiểm tra nếu là bài toán Robot di chuyển trên sàn (Robot Cleaner)
  const isRobot = (sim.problemTitle + ' ' + sim.problemSummary).toLowerCase().includes('robot') ||
                  (sim.tags || []).some(t => t.toLowerCase().includes('robot'));

  if (isRobot) {
    const lines = (sim.sampleInput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
    let n = 0, m = 0, rb = 0, cb = 0;
    for (const line of lines) {
      const parts = line.split(/\s+/).map(Number).filter(v => !isNaN(v));
      if (parts.length === 1 && lines.length > 1 && n === 0) continue;
      if (parts.length >= 4 && n === 0) {
        n = parts[0]; m = parts[1]; rb = parts[2]; cb = parts[3];
        break;
      }
    }

    const outLines = (sim.sampleOutput || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
    const maxT = outLines.length > 0 ? parseInt(outLines[0], 10) : 0;

    if (n > 0 && m > 0 && rb > 0 && cb > 0 && maxT > 0 && maxT <= 20) {
      if (sim.frames.length < maxT + 1) {
        let r = rb, c = cb, dr = 1, dc = 1;
        const newFrames: any[] = [];
        const cleanedRows = new Set<number>();
        const cleanedCols = new Set<number>();

        for (let t = 0; t <= maxT; t++) {
          cleanedRows.add(r);
          cleanedCols.add(c);

          const grid: string[][] = [];
          const cellHighlights: any[] = [];

          for (let row = 1; row <= n; row++) {
            const rowArr: string[] = [];
            for (let col = 1; col <= m; col++) {
              if (row === r && col === c) {
                rowArr.push('🤖');
                cellHighlights.push({ r: row - 1, c: col - 1, status: 'robot' });
              } else if (cleanedRows.has(row) || cleanedCols.has(col)) {
                rowArr.push('✓');
                cellHighlights.push({ r: row - 1, c: col - 1, status: 'path' });
              } else {
                rowArr.push('·');
              }
            }
            grid.push(rowArr);
          }

          let desc = `Giây ${t}: Robot tại ô (${r}, ${c}), làm sạch toàn bộ hàng ${r} và cột ${c}. Hướng: (dr=${dr}, dc=${dc}).`;
          if (t === 0) {
            desc = `Giây 0: Khởi tạo robot tại vị trí (${r}, ${c}). Làm sạch hàng ${r} và cột ${c}. Hướng di chuyển ban đầu: (dr=1, dc=1).`;
          } else if (t === maxT) {
            desc = `Giây ${t}: Robot di chuyển đến (${r}, ${c}). Toàn bộ các ô cần thiết trên sàn đã được làm sạch! Hoàn thành sau ${maxT} giây.`;
          }

          newFrames.push({
            step: t,
            description: desc,
            grid,
            cellHighlights,
            variables: {
              'thời_gian': `${t}s`,
              'vị_trí_robot': `(${r}, ${c})`,
              'hướng_dr': dr,
              'hướng_dc': dc
            }
          });

          // Chuẩn bị cho giây tiếp theo: phản xạ trước khi di chuyển
          if (r + dr > n || r + dr < 1) dr = -dr;
          if (c + dc > m || c + dc < 1) dc = -dc;
          r += dr;
          c += dc;
        }

        return {
          ...sim,
          viewType: 'grid',
          frames: newFrames
        };
      }
    }
  }

  return sim;
}
