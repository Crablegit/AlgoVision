import { SimulationResult } from '../types';

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Kiểm tra xem Gemini API Key có hợp lệ hay không
 */
export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
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
  apiKey: string
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
   - Hãy đọc đề bài (từ ảnh chụp hoặc văn bản) và trích xuất đúng Test ví dụ 1 (Input 1 & Output 1) trong đề bài để mô phỏng.

3. XÁC ĐỊNH viewType TRỰC QUAN HÓA TỐI ƯU (CHỈ CHỌN 1 TRONG CÁC TỪ KHÓA SAU):
   - "graph": Dành cho mọi bài toán ĐỒ THỊ (đồ thị vô hướng, có hướng, tìm đường đi ngắn nhất như Dijkstra/BFS, DSU, chu trình, luồng cực đại).
     + BẮT BUỘC: MỌI FRAME đều PHẢI chứa mảng "nodes" (đủ tất cả các đỉnh) và mảng "edges" (đủ tất cả các cạnh).
     + Ở mỗi bước, đỉnh và cạnh nào đang được xét hoặc thuộc đường đi hiện tại thì đặt "highlight": true.
     + Các đỉnh/cạnh khác đặt "highlight": false. TUYỆT ĐỐI KHÔNG BỎ TRỐNG "nodes" hay "edges" ở các frame sau.
   - "tree": BẮT BUỘC DÙNG khi đề bài nói về CÂY (tree, rooted tree, binary tree, cây có gốc, LCA, cây con, đường đi trên cây, v.v.).
     + ĐỈNH GỐC (rootId): Đọc kỹ đề bài để xác định gốc là đỉnh nào (ví dụ: gốc là 1, hoặc gốc là 0, hoặc gốc là r theo input của test). TUYỆT ĐỐI KHÔNG MẶC ĐỊNH CỐ ĐỊNH LÀ 1 nếu đề bài quy định đỉnh khác là gốc! Ghi giá trị này vào trường "rootId".
     + BẮT BUỘC: Nếu cây có N đỉnh (ví dụ: N = 32 đỉnh), mảng "nodes" PHẢI chứa ĐỦ TẤT CẢ N đỉnh (từ 1 đến N), và mảng "edges" PHẢI chứa ĐỦ TẤT CẢ N-1 cạnh nối giữa các đỉnh. TUYỆT ĐỐI KHÔNG ĐƯỢC chỉ sinh 2 đỉnh rồi bỏ dở! MỌI frame đều phải có đủ các đỉnh và cạnh này.
   - "grid": Dành cho bài toán BẢNG 2D / MA TRẬN / ROBOT DI CHUYỂN TRÊN SÀN (như bài Robot Cleaner kích thước n x m, mê cung, tìm hình chữ nhật con).
     + BẮT BUỘC: MỌI FRAME ĐỀU PHẢI CÓ MẢNG "grid" (mảng 2D kích thước n hàng x m cột).
     + Nếu đề bài cho sàn kích thước n x m và vị trí robot (ví dụ: 10 x 10, bắt đầu tại (6, 1)):
       BẮT BUỘC phải tạo mảng "grid" kích thước 10 x 10!
       Tại ô của robot, đặt "🤖" (hoặc "R").
       Tại các ô đã làm sạch: đặt "✓".
       Tại các ô chưa làm sạch: đặt "·".
     + TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỂ TRỐNG "grid" Ở BẤT KỲ BƯỚC NÀO!
   - "intervals": Nếu là các đoạn thẳng trên trục số, bài toán phủ đoạn, khoảng thời gian [start, end].
   - "circular": Nếu là vòng tròn, mảng xoay vòng, bài toán Josephus.
   - "array": Nếu là mảng 1D thông thường, 2 con trỏ, binary search.

4. QUY TẮC MÔ PHỎNG CHI TIẾT TỪNG BƯỚC (BẮT BUỘC TUÂN THỦ 100%):
   - KHOẢNG BƯỚC HỮU HẠN (<= 20 BƯỚC):
     + Đọc giá trị Output mẫu (ví dụ: Output = 9 nghĩa là cần 9 giây).
     + NẾU KẾT QUẢ <= 20: BẮT BUỘC 100% PHẢI TẠO ĐỦ TẤT CẢ CÁC BƯỚC LIÊN TỤC TỪ 0 ĐẾN KẾT QUẢ.
       Ví dụ nếu kết quả là 9: Mảng "frames" BẮT BUỘC PHẢI CÓ ĐỦ 10 FRAMES LIÊN TỤC:
       Frame 0: Giây 0 (t=0)
       Frame 1: Giây 1 (t=1)
       Frame 2: Giây 2 (t=2)
       Frame 3: Giây 3 (t=3)
       Frame 4: Giây 4 (t=4)
       Frame 5: Giây 5 (t=5)
       Frame 6: Giây 6 (t=6)
       Frame 7: Giây 7 (t=7)
       Frame 8: Giây 8 (t=8)
       Frame 9: Giây 9 (t=9)
     + TUYỆT ĐỐI NGHIÊM CẤM BỎ QUA HOẶC NHẢY CÓC BẤT KỲ BƯỚC NÀO (CẤM việc chỉ sinh giây 1, 2 rồi nhảy thẳng sang giây 9). MỖI ĐƠN VỊ THỜI GIAN/BƯỚC DUYỆT BẮT BUỘC PHẢI LÀ 1 FRAME RIÊNG.
     + Ở mỗi bước (mỗi giây):
       * Cập nhật vị trí mới của robot/con trỏ (t=0 ở (6,1), t=1 ở (7,2), t=2 ở (8,3), t=3 ở (9,4), t=4 ở (10,5), t=5 ở (9,6)...).
       * Cập nhật các ô vừa được làm sạch trong frame đó.
       * Mô tả rõ hành động diễn ra ở bước đó (ví dụ: "Giây 1: Robot di chuyển đến (7, 2), làm sạch hàng 7 và cột 2...").
   - NẾU SỐ BƯỚC LỚN HƠN 20 (ví dụ: n = 1000):
     + Mô phỏng khoảng 8 - 15 bước tiêu biểu nhất (bao gồm bước đầu, các bước thay đổi trạng thái quan trọng, đổi hướng khi va chạm, và các bước cuối cùng đạt kết quả).
5. TUYỆT ĐỐI KHÔNG phân tích thuật toán, KHÔNG giảng giải độ phức tạp O(n).

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
      "nodes": [{"id": "1", "label": "1", "highlight": true}],
      "edges": [{"from": "1", "to": "2", "highlight": true}],
      "elements": [1, 2, 3],
      "highlights": [0, 1],
      "pointers": {"left": 0, "right": 2},
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
  if (problemText && problemText.trim()) {
    promptContent += `NỘI DUNG ĐỀ BÀI HOẶC GHI CHÚ:\n${problemText.trim()}`;
  } else if (!userSampleInput) {
    promptContent += `Hãy đọc đề bài từ hình ảnh đính kèm, trích xuất đúng Test ví dụ 1 (Input 1 & Output 1) và mô phỏng chính xác test đó.`;
  }

  parts.push({ text: promptContent });

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
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
  apiKey: string
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
- Nếu số bước hữu hạn và dưới 20 bước (ví dụ: robot di chuyển 9-10 giây, mảng 5-15 phần tử): BẮT BUỘC 100% PHẢI MÔ TẢ ĐẦY ĐỦ TỪNG BƯỚC MỘT (t=0, t=1, t=2... đến kết quả). TUYỆT ĐỐI KHÔNG ĐƯỢC NHẢY CÓC!
- Nếu số bước lớn (> 20): Mô phỏng khoảng 8 - 15 bước tiêu biểu.

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
      "pointers": ...,
      "variables": ...
    }
  ]
}
`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
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
 * Tự động bù và mở rộng đầy đủ các bước nếu bài toán có số bước hữu hạn <= 20
 * mà AI nhảy cóc hoặc sinh thiếu (ví dụ: chỉ sinh giây 1, 2 rồi nhảy thẳng sang giây 9)
 */
function ensureFullSimulationSteps(sim: SimulationResult): SimulationResult {
  if (!sim || !sim.frames || sim.frames.length === 0) return sim;

  // Kiểm tra nếu là bài toán Robot di chuyển trên sàn (Robot Cleaner)
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
                cellHighlights.push({ r: row - 1, c: col - 1, status: 'found' });
              } else if (cleanedRows.has(row) || cleanedCols.has(col)) {
                rowArr.push('✓');
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
