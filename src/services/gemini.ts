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

3. XÁC ĐỊNH viewType TRỰC QUAN HÓA TỐI ƯU:
   - "tree": BẮT BUỘC DÙNG khi đề bài nói về CÂY (tree, rooted tree, binary tree, cây có gốc, LCA, cây con, đường đi trên cây, v.v.).
     + ĐỈNH GỐC (rootId): Đọc kỹ đề bài để xác định gốc là đỉnh nào (ví dụ: gốc là 1, hoặc gốc là 0, hoặc gốc là r theo input của test). TUYỆT ĐỐI KHÔNG MẶC ĐỊNH CỐ ĐỊNH LÀ 1 nếu đề bài quy định đỉnh khác là gốc! Ghi giá trị này vào trường "rootId".
     + Cung cấp danh sách "nodes" (mỗi node có id, label, highlight) và "edges" (mỗi edge có from, to, highlight).
   - "grid": Nếu là ma trận 2D, bảng ký tự (như bài tìm hình chữ nhật nhỏ nhất n x m). "grid" trong mỗi frame là mảng 2D chứa đầy đủ các ký tự của input.
   - "intervals": Nếu là các đoạn thẳng trên trục số, bài toán phủ đoạn, khoảng thời gian [start, end].
   - "graph": Nếu là đồ thị tổng quát (có chu trình, DSU nối tập đỉnh, tìm đường đi ngắn nhất giữa 2 đỉnh).
   - "circular": Nếu là vòng tròn, mảng xoay vòng, bài toán Josephus.
   - "array": Nếu là mảng 1D thông thường, 2 con trỏ, binary search.

4. MÔ PHỎNG TỪNG BƯỚC:
   - Bước 0: Trạng thái ban đầu của Input mẫu.
   - Các bước giữa: Diễn biến từng bước kiểm tra/duyệt theo đúng quy tắc đề bài.
   - Bước cuối cùng: Đạt được kết quả đúng bằng Output mẫu.
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
          temperature: 0.1
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
    return parsed;
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
          temperature: 0.1
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
    return parsed;
  } catch (error: any) {
    console.error("Lỗi custom test:", error);
    throw error;
  }
}
